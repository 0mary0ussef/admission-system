using SchoolAdmission.DTOs;
using SchoolAdmission.Models;
using SchoolAdmission.Data;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace SchoolAdmission.Services;

public class AdminService : IAdminService
{
    private readonly SchoolAdmissionDbContext _db;

    public AdminService(SchoolAdmissionDbContext db)
    {
        _db = db;
    }

    public async Task<List<dynamic>> GetStudentsForAdminAsync(string adminEmail)
    {
        var adminAccount = await _db.Accounts
            .Include(a => a.Role)
            .FirstOrDefaultAsync(a => a.Email == adminEmail);

        if (adminAccount?.Role?.RoleName != "Admin")
            throw new UnauthorizedAccessException("Only admins can view student information.");

        var students = await _db.Accounts
            .Include(a => a.AdmissionProfile)
            .Include(a => a.Role)
            .Where(a => a.Role.RoleName == "Student")
            .ToListAsync();

        var result = new List<dynamic>();

        foreach (var s in students)
        {
            var admissionProfile = s.AdmissionProfile;

            // Get exam results for this student
            var examResults = await _db.StudentExamResults
                .FirstOrDefaultAsync(ser => ser.AccountId == s.Id);

            // Get interview scores for this student by this admin
            var interviewScore = await _db.InterviewScores
                .FirstOrDefaultAsync(i => i.AccountId == s.Id && i.InterviewerId == adminAccount.Id);

            var examTotal = GetExamTotalAsync(examResults).Result;
            var interviewScoreValue = (double)(interviewScore?.Score ?? 0m);
            var totalWithInterview = examTotal + interviewScoreValue;

            result.Add(new
            {
                s.Id,
                FullName = s.FullNameEn,
                s.Email,
                s.NationalId,
                PhoneNumber = admissionProfile?.PhoneNumber ?? "",
                ParentPhoneNumber = admissionProfile?.ParentPhoneNumber ?? "",
                PreviousSchoolType = admissionProfile?.PreviousSchoolType ?? "",
                MathScore = admissionProfile?.MathScore ?? 0,
                EnglishScore = admissionProfile?.EnglishScore ?? 0,
                FinalYearScore = admissionProfile?.ThirdPrepScore ?? 0,
                MinistryExamPercentage = admissionProfile?.MinistryExamPercentage ?? 0,
                Status = admissionProfile?.StatusId.ToString() ?? "Pending",
                ExamMathScore = examResults?.ExamMathScore ?? 0,
                ExamEnglishScore = examResults?.ExamEnglishScore ?? 0,
                ExamArabicScore = examResults?.ExamArabicScore ?? 0,
                ExamSoftwareScore = examResults?.ExamSoftwareScore ?? 0,
                InterviewScore = interviewScoreValue,
                InterviewPercentage = totalWithInterview,
                TotalScore = examTotal
            });
        }

        return result;
    }

    public async Task<List<dynamic>> GetStudentsForSuperAdminAsync(string superAdminEmail)
    {
        var superAdminAccount = await _db.Accounts
            .Include(a => a.Role)
            .FirstOrDefaultAsync(a => a.Email == superAdminEmail);

        if (superAdminAccount?.Role?.RoleName != "SuperAdmin")
            throw new UnauthorizedAccessException("Only superadmins can view student information.");

        var students = await _db.Accounts
            .Include(a => a.AdmissionProfile)
            .Include(a => a.Role)
            .Where(a => a.Role.RoleName == "Student")
            .ToListAsync();

        var result = new List<dynamic>();

        foreach (var s in students)
        {
            var admissionProfile = s.AdmissionProfile;

            // Get exam results for this student
            var examResults = await _db.StudentExamResults
                .FirstOrDefaultAsync(ser => ser.AccountId == s.Id);

            // Get all interview scores for this student
            var interviewScores = await _db.InterviewScores
                .Where(i => i.AccountId == s.Id)
                .Select(i => new {
                    Admin = _db.Accounts.Where(a => a.Id == i.InterviewerId).Select(a => a.FullNameEn).FirstOrDefault() ?? "Unknown Admin",
                    i.Score
                })
                .ToListAsync();

            // Calculate average interview score safely
            double averageInterviewScore = 0;
            if (interviewScores.Count > 0)
            {
                averageInterviewScore = (double)(interviewScores.Sum(i => i.Score) / interviewScores.Count);
            }

            var examTotal = GetExamTotalAsync(examResults).Result;
            var interviewPercentage = examTotal + averageInterviewScore;

            result.Add(new
            {
                s.Id,
                FullName = s.FullNameEn,
                PhoneNumber = admissionProfile?.PhoneNumber ?? "",
                ParentPhoneNumber = admissionProfile?.ParentPhoneNumber ?? "",
                PreviousSchoolType = admissionProfile?.PreviousSchoolType ?? "",
                s.NationalId,
                s.Email,
                MathScore = admissionProfile?.MathScore ?? 0,
                EnglishScore = admissionProfile?.EnglishScore ?? 0,
                FinalYearScore = admissionProfile?.ThirdPrepScore ?? 0,
                MinistryExamPercentage = admissionProfile?.MinistryExamPercentage ?? 0,
                Location = admissionProfile?.Location ?? "",
                City = admissionProfile?.City ?? "",
                District = admissionProfile?.District ?? "",
                Status = admissionProfile?.StatusId.ToString() ?? "Pending",
                ExamMathScore = examResults?.ExamMathScore ?? 0,
                ExamEnglishScore = examResults?.ExamEnglishScore ?? 0,
                ExamSoftwareScore = examResults?.ExamSoftwareScore ?? 0,
                ExamArabicScore = examResults?.ExamArabicScore ?? 0,
                ExamTotal = examTotal,
                InterviewScores = interviewScores,
                TotalScore = examTotal,
                InterviewPercentage = interviewPercentage
            });
        }

        return result;
    }

    public async Task<List<Account>> FilterStudentsAsync(string? name, string? nationalId)
    {
        var query = _db.Accounts
            .Include(a => a.AdmissionProfile)
            .Where(a => a.Role.RoleName == "Student")
            .AsQueryable();

        if (!string.IsNullOrEmpty(name))
            query = query.Where(s => s.FullNameEn.Contains(name));
        if (!string.IsNullOrEmpty(nationalId))
            query = query.Where(s => s.NationalId == nationalId);

        return await query.ToListAsync();
    }

    public async Task<bool> SetInterviewScoreAsync(long studentId, long adminId, double score)
    {
        if (score < 0 || score > 40)
            throw new ArgumentException("Interview score must be between 0 and 40.");

        var student = await _db.Accounts.FirstOrDefaultAsync(s => s.Id == studentId);
        if (student == null)
            throw new InvalidOperationException($"Student with ID {studentId} not found.");

        var interviewScore = await _db.InterviewScores
            .FirstOrDefaultAsync(s => s.AccountId == studentId && s.InterviewerId == adminId);

        if (interviewScore == null)
        {
            interviewScore = new InterviewScore
            {
                AccountId = studentId,
                InterviewerId = adminId,
                Score = (decimal)score
            };
            _db.InterviewScores.Add(interviewScore);
        }
        else
        {
            interviewScore.Score = (decimal)score;
        }

        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> UpdateStudentStatusAsync(long studentId, string status)
    {
        if (!Enum.TryParse<AdmissionStatus>(status, true, out var admissionStatus))
            throw new ArgumentException($"Invalid status '{status}'. Allowed values are: {string.Join(", ", Enum.GetNames<AdmissionStatus>())}");

        var student = await _db.Accounts
            .Include(a => a.AdmissionProfile)
            .FirstOrDefaultAsync(s => s.Id == studentId);

        if (student == null)
            throw new InvalidOperationException($"Student with ID {studentId} not found.");

        if (student.AdmissionProfile == null)
            throw new InvalidOperationException($"Student admission profile not found for student ID {studentId}.");

        student.AdmissionProfile.StatusId = (long)admissionStatus;
        await _db.SaveChangesAsync();

        return true;
    }

    public async Task<int> GetExamTotalAsync(StudentExamResult? examResults)
    {
        if (examResults == null)
            return 0;

        return examResults.ExamMathScore + examResults.ExamEnglishScore +
               examResults.ExamArabicScore + examResults.ExamSoftwareScore;
    }

    public Task<string> GetCurrentAdminEmailAsync(System.Security.Claims.ClaimsPrincipal user)
    {
        return Task.FromResult(user.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? user.FindFirst("sub")?.Value
            ?? string.Empty);
    }

    public async Task<Account?> GetAccountByEmailAsync(string email)
    {
        return await _db.Accounts
            .Include(a => a.Role)
            .FirstOrDefaultAsync(a => a.Email == email);
    }

    public async Task<PaginationResponseDTO<dynamic>> GetStudentsForAdminPaginatedAsync(string adminEmail, PaginationRequestDTO request)
    {
        var adminAccount = await _db.Accounts
            .Include(a => a.Role)
            .FirstOrDefaultAsync(a => a.Email == adminEmail);

        if (adminAccount?.Role?.RoleName != "Admin")
            throw new UnauthorizedAccessException("Only admins can view student information.");

        // Build base query
        var query = _db.Accounts
            .Include(a => a.AdmissionProfile)
            .Include(a => a.Role)
            .Where(a => a.Role.RoleName == "Student")
            .AsQueryable();

        // Apply search filter
        if (!string.IsNullOrEmpty(request.SearchTerm))
        {
            query = query.Where(s => 
                s.FullNameEn.Contains(request.SearchTerm) ||
                s.NationalId.Contains(request.SearchTerm) ||
                s.Email.Contains(request.SearchTerm)
            );
        }

        // Apply status filter
        if (!string.IsNullOrEmpty(request.StatusFilter) && request.StatusFilter != "all")
        {
            var statusMapping = new Dictionary<string, long>
            {
                { "Pending", 1 },
                { "Accepted", 2 },
                { "Rejected", 3 },
                { "Waitlisted", 4 }
            };

            if (statusMapping.TryGetValue(request.StatusFilter, out var statusId))
            {
                query = query.Where(s => s.AdmissionProfile.StatusId == statusId);
            }
        }

        // Get total count before pagination
        var totalCount = await query.CountAsync();

        // Apply sorting
        query = request.SortBy?.ToLower() switch
        {
            "name" => request.SortOrder?.ToLower() == "desc" 
                ? query.OrderByDescending(s => s.FullNameEn)
                : query.OrderBy(s => s.FullNameEn),
            "nationalid" => request.SortOrder?.ToLower() == "desc"
                ? query.OrderByDescending(s => s.NationalId)
                : query.OrderBy(s => s.NationalId),
            "email" => request.SortOrder?.ToLower() == "desc"
                ? query.OrderByDescending(s => s.Email)
                : query.OrderBy(s => s.Email),
            _ => query.OrderBy(s => s.FullNameEn)
        };

        // Apply pagination
        var students = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync();

        var result = new List<dynamic>();

        foreach (var s in students)
        {
            var admissionProfile = s.AdmissionProfile;

            // Get exam results for this student
            var examResults = await _db.StudentExamResults
                .FirstOrDefaultAsync(ser => ser.AccountId == s.Id);

            // Get interview score for this admin
            var interviewScore = await _db.InterviewScores
                .Where(i => i.AccountId == s.Id && i.InterviewerId == adminAccount.Id)
                .Select(i => i.Score)
                .FirstOrDefaultAsync();

            var examTotal = GetExamTotalAsync(examResults).Result;

            result.Add(new
            {
                s.Id,
                FullName = s.FullNameEn,
                s.NationalId,
                s.Email,
                MathScore = admissionProfile?.MathScore ?? 0,
                EnglishScore = admissionProfile?.EnglishScore ?? 0,
                FinalYearScore = admissionProfile?.ThirdPrepScore ?? 0,
                MinistryExamPercentage = admissionProfile?.MinistryExamPercentage ?? 0,
                Status = admissionProfile?.StatusId.ToString() ?? "1",
                ExamMathScore = examResults?.ExamMathScore ?? 0,
                ExamEnglishScore = examResults?.ExamEnglishScore ?? 0,
                ExamSoftwareScore = examResults?.ExamSoftwareScore ?? 0,
                ExamArabicScore = examResults?.ExamArabicScore ?? 0,
                ExamTotal = examTotal,
                InterviewScore = interviewScore  ,
                TotalScore = examTotal + interviewScore 
            });
        }

        var totalPages = (int)Math.Ceiling((double)totalCount / request.PageSize);

        return new PaginationResponseDTO<dynamic>
        {
            Data = result,
            TotalCount = totalCount,
            PageNumber = request.PageNumber,
            PageSize = request.PageSize,
            TotalPages = totalPages,
            HasPreviousPage = request.PageNumber > 1,
            HasNextPage = request.PageNumber < totalPages
        };
    }

    public async Task<PaginationResponseDTO<dynamic>> GetStudentsForSuperAdminPaginatedAsync(string superAdminEmail, PaginationRequestDTO request)
    {
        var superAdminAccount = await _db.Accounts
            .Include(a => a.Role)
            .FirstOrDefaultAsync(a => a.Email == superAdminEmail);

        if (superAdminAccount?.Role?.RoleName != "SuperAdmin")
            throw new UnauthorizedAccessException("Only superadmins can view student information.");

        // Build base query
        var query = _db.Accounts
            .Include(a => a.AdmissionProfile)
            .Include(a => a.Role)
            .Where(a => a.Role.RoleName == "Student")
            .AsQueryable();

        // Apply search filter
        if (!string.IsNullOrEmpty(request.SearchTerm))
        {
            query = query.Where(s => 
                s.FullNameEn.Contains(request.SearchTerm) ||
                s.NationalId.Contains(request.SearchTerm) ||
                s.Email.Contains(request.SearchTerm)
            );
        }

        // Apply status filter
        if (!string.IsNullOrEmpty(request.StatusFilter) && request.StatusFilter != "all")
        {
            var statusMapping = new Dictionary<string, long>
            {
                { "Pending", 1 },
                { "Accepted", 2 },
                { "Rejected", 3 },
                { "Waitlisted", 4 }
            };

            if (statusMapping.TryGetValue(request.StatusFilter, out var statusId))
            {
                query = query.Where(s => s.AdmissionProfile.StatusId == statusId);
            }
        }

        // Get total count before pagination
        var totalCount = await query.CountAsync();

        // Apply sorting
        query = request.SortBy?.ToLower() switch
        {
            "name" => request.SortOrder?.ToLower() == "desc" 
                ? query.OrderByDescending(s => s.FullNameEn)
                : query.OrderBy(s => s.FullNameEn),
            "nationalid" => request.SortOrder?.ToLower() == "desc"
                ? query.OrderByDescending(s => s.NationalId)
                : query.OrderBy(s => s.NationalId),
            "email" => request.SortOrder?.ToLower() == "desc"
                ? query.OrderByDescending(s => s.Email)
                : query.OrderBy(s => s.Email),
            _ => query.OrderBy(s => s.FullNameEn)
        };

        // Apply pagination
        var students = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync();

        var result = new List<dynamic>();

        foreach (var s in students)
        {
            var admissionProfile = s.AdmissionProfile;

            // Get exam results for this student
            var examResults = await _db.StudentExamResults
                .FirstOrDefaultAsync(ser => ser.AccountId == s.Id);

            // Get all interview scores for this student
            var interviewScores = await _db.InterviewScores
                .Where(i => i.AccountId == s.Id)
                .Select(i => new {
                    Admin = _db.Accounts.Where(a => a.Id == i.InterviewerId).Select(a => a.FullNameEn).FirstOrDefault() ?? "Unknown Admin",
                    i.Score
                })
                .ToListAsync();

            // Calculate total percentage according to the formula:
            // Total Percentage = (interviewerScore1 / 3 + interviewerScore2 / 3 + interviewerScore3 / 3) + ExamTotal
            var examTotal = GetExamTotalAsync(examResults).Result;
            double totalPercentage = examTotal; // Start with exam total

            // Add each interviewer score divided by 3
            foreach (var interviewScore in interviewScores)
            {
                totalPercentage += (double)(interviewScore.Score / 3);
            }

            result.Add(new
            {
                s.Id,
                FullName = s.FullNameEn,
                PhoneNumber = admissionProfile?.PhoneNumber ?? "",
                ParentPhoneNumber = admissionProfile?.ParentPhoneNumber ?? "",
                PreviousSchoolType = admissionProfile?.PreviousSchoolType ?? "",
                s.NationalId,
                s.Email,
                MathScore = admissionProfile?.MathScore ?? 0,
                EnglishScore = admissionProfile?.EnglishScore ?? 0,
                FinalYearScore = admissionProfile?.ThirdPrepScore ?? 0,
                MinistryExamPercentage = admissionProfile?.MinistryExamPercentage ?? 0,
                Location = admissionProfile?.Location ?? "",
                City = admissionProfile?.City ?? "",
                District = admissionProfile?.District ?? "",
                Status = admissionProfile?.StatusId.ToString() ?? "1",
                ExamMathScore = examResults?.ExamMathScore ?? 0,
                ExamEnglishScore = examResults?.ExamEnglishScore ?? 0,
                ExamSoftwareScore = examResults?.ExamSoftwareScore ?? 0,
                ExamArabicScore = examResults?.ExamArabicScore ?? 0,
                ExamTotal = examTotal,
                InterviewScores = interviewScores,
                TotalScore = examTotal,
                TotalPercentage = Math.Round(totalPercentage, 2)
            });
        }

        var totalPages = (int)Math.Ceiling((double)totalCount / request.PageSize);

        return new PaginationResponseDTO<dynamic>
        {
            Data = result,
            TotalCount = totalCount,
            PageNumber = request.PageNumber,
            PageSize = request.PageSize,
            TotalPages = totalPages,
            HasPreviousPage = request.PageNumber > 1,
            HasNextPage = request.PageNumber < totalPages
        };
    }
}
