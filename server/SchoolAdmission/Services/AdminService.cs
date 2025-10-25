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
                .FirstOrDefaultAsync(a => a.Email == adminEmail && a.Role.BusinessEntity == "Admission");

            if (adminAccount?.Role?.RoleName != "Admin")
                throw new UnauthorizedAccessException("Only admins can view student information.");

            var students = await _db.Accounts
                .Include(a => a.AdmissionProfile)
                .Include(a => a.Role)
                .Where(a => a.Role.RoleName == "Student" && a.Role.BusinessEntity == "Admission")
                .ToListAsync();

            var result = new List<dynamic>();

            foreach (var s in students)
            {
                var admissionProfile = s.AdmissionProfile;
                
                // Skip students without admission profile
                if (admissionProfile == null)
                    continue;

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
                .FirstOrDefaultAsync(a => a.Email == superAdminEmail && a.Role.BusinessEntity == "Admission");

            if (superAdminAccount?.Role?.RoleName != "SuperAdmin")
                throw new UnauthorizedAccessException("Only superadmins can view student information.");

            var students = await _db.Accounts
                .Include(a => a.AdmissionProfile)
                .Include(a => a.Role)
                .Where(a => a.Role.RoleName == "PendingStudent" && a.Role.BusinessEntity == "Admission")
                .ToListAsync();

            var result = new List<dynamic>();

            foreach (var s in students)
            {
                var admissionProfile = s.AdmissionProfile;
                
                // Skip students without admission profile
                if (admissionProfile == null)
                    continue;

                // Get exam results for this student
                var examResults = await _db.StudentExamResults
                    .FirstOrDefaultAsync(ser => ser.AccountId == s.Id);

                // Calculate average interview score safely
                double averageInterviewScore = 0;

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
                    TotalScore = examTotal,
                    InterviewPercentage = interviewPercentage,
                    HasOnlineTrainingCourses = admissionProfile?.HasOnlineTrainingCourses ?? false,
                    HasICDLLicense = admissionProfile?.HasIcdllicense ?? false,
                    HasLaptop = admissionProfile?.HasLaptop ?? false
                });
            }

            return result;
        }



    public async Task<List<Account>> FilterStudentsAsync(string? name, string? nationalId)
    {
        var query = _db.Accounts
            .Include(a => a.AdmissionProfile)
            .Where(a => a.Role.RoleName == "Student" && a.Role.BusinessEntity == "Admission")
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
            .AsNoTracking()
            .Include(a => a.Role)
            .FirstOrDefaultAsync(a => a.Email == adminEmail && a.Role.BusinessEntity == "Admission");

        if (adminAccount?.Role?.RoleName != "Admin" && adminAccount?.Role?.BusinessEntity == "Admission")
            throw new UnauthorizedAccessException("Only admins can view student information.");

        // Start with the base query for all students
        var studentsQuery = _db.Accounts
            .AsNoTracking()
            .Include(a => a.AdmissionProfile)
            .Include(a => a.Role)
            .Where(a => a.AdmissionProfile != null && a.Role.RoleName == "PendingStudent" && a.IsActive == true && a.Role.BusinessEntity == "Admission");

        // Apply search filter if a search term is provided
        if (!string.IsNullOrEmpty(request.SearchTerm))
        {
            studentsQuery = studentsQuery.Where(s =>
                s.FullNameEn.Contains(request.SearchTerm) ||
                s.NationalId.Contains(request.SearchTerm) ||
                s.Email.Contains(request.SearchTerm)
            );
        }

        // Apply status filter if a status is provided
        if (!string.IsNullOrEmpty(request.StatusFilter) && request.StatusFilter != "all")
        {
            var statusMapping = new Dictionary<string, long>
        {
            { "Pending", 1 },
            { "Accepted", 2 },
            { "Rejected", 3 }
        };

            if (statusMapping.TryGetValue(request.StatusFilter, out var statusId))
            {
                studentsQuery = studentsQuery.Where(s => s.AdmissionProfile != null && s.AdmissionProfile.StatusId == statusId);
            }
        }

        // Count the total number of records before pagination and materialization
        var totalCount = await studentsQuery.CountAsync();

        // Project data into an anonymous type to include related data in a single query
        var projectedQuery = studentsQuery
            .Select(s => new
            {
                s.Id,
                FullName = s.FullNameAr,
                s.NationalId,
                s.Email,
                AdmissionProfile = s.AdmissionProfile,
                ExamResults = _db.StudentExamResults.FirstOrDefault(ser => ser.AccountId == s.Id),
                InterviewScore = _db.InterviewScores
                    .Where(i => i.AccountId == s.Id && i.InterviewerId == adminAccount.Id)
                    .Select(i => (int?)i.Score)
                    .FirstOrDefault()
            });

        // Apply sorting to the IQueryable before pagination
        projectedQuery = request.SortBy?.ToLower() switch
        {
            "name" => request.SortOrder?.ToLower() == "desc"
                ? projectedQuery.OrderByDescending(s => s.FullName)
                : projectedQuery.OrderBy(s => s.FullName),
            "nationalid" => request.SortOrder?.ToLower() == "desc"
                ? projectedQuery.OrderByDescending(s => s.NationalId)
                : projectedQuery.OrderBy(s => s.NationalId),
            "email" => request.SortOrder?.ToLower() == "desc"
                ? projectedQuery.OrderByDescending(s => s.Email)
                : projectedQuery.OrderBy(s => s.Email),
            "mathscore" => request.SortOrder?.ToLower() == "desc"
                ? projectedQuery.OrderByDescending(s => s.AdmissionProfile.MathScore)
                : projectedQuery.OrderBy(s => s.AdmissionProfile.MathScore),
            "englishscore" => request.SortOrder?.ToLower() == "desc"
                ? projectedQuery.OrderByDescending(s => s.AdmissionProfile.EnglishScore)
                : projectedQuery.OrderBy(s => s.AdmissionProfile.EnglishScore),
            "finalyearscore" => request.SortOrder?.ToLower() == "desc"
                ? projectedQuery.OrderByDescending(s => s.AdmissionProfile.ThirdPrepScore)
                : projectedQuery.OrderBy(s => s.AdmissionProfile.ThirdPrepScore),
            "percentage" => request.SortOrder?.ToLower() == "desc"
                ? projectedQuery.OrderByDescending(s => s.AdmissionProfile.MinistryExamPercentage)
                : projectedQuery.OrderBy(s => s.AdmissionProfile.MinistryExamPercentage),
            _ => projectedQuery.OrderBy(s => s.FullName) // Default sort
        };

        // Apply pagination and then execute the query to materialize the data
        var pagedStudents = await projectedQuery
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync();

        // Materialize the final results, including post-materialization sorting for InterviewScore
        var result = pagedStudents.Select(s =>
        {
            int examTotal = (s.ExamResults?.ExamMathScore ?? 0) +
                            (s.ExamResults?.ExamEnglishScore ?? 0) +
                            (s.ExamResults?.ExamSoftwareScore ?? 0) +
                            (s.ExamResults?.ExamArabicScore ?? 0);

            return new
            {
                s.Id,
                s.FullName,
                s.NationalId,
                s.Email,
                MathScore = s.AdmissionProfile?.MathScore ?? 0,
                EnglishScore = s.AdmissionProfile?.EnglishScore ?? 0,
                FinalYearScore = s.AdmissionProfile?.ThirdPrepScore ?? 0,
                MinistryExamPercentage = s.AdmissionProfile?.MinistryExamPercentage ?? 0,
                Status = s.AdmissionProfile?.StatusId.ToString() ?? "1",
                ExamMathScore = s.ExamResults?.ExamMathScore ?? 0,
                ExamEnglishScore = s.ExamResults?.ExamEnglishScore ?? 0,
                ExamSoftwareScore = s.ExamResults?.ExamSoftwareScore ?? 0,
                ExamArabicScore = s.ExamResults?.ExamArabicScore ?? 0,
                ExamTotal = examTotal,
                InterviewScore = s.InterviewScore,
                TotalScore = examTotal + (s.InterviewScore ?? 0)
            };
        }).ToList();

        // Apply interview score sorting after all data is in memory
        if (request.SortBy?.ToLower() == "interviewscore")
        {
            result = request.SortOrder?.ToLower() == "desc"
                ? result.OrderByDescending(r => r.InterviewScore).ToList()
                : result.OrderBy(r => r.InterviewScore).ToList();
        }

        // Correcting the implicit conversion error by casting the result to a dynamic list
        var dynamicResult = result.Select(item => (dynamic)item).ToList();

        var totalPages = (int)Math.Ceiling((double)totalCount / request.PageSize);

        return new PaginationResponseDTO<dynamic>
        {
            Data = dynamicResult,
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
        .AsNoTracking()
        .Include(a => a.Role)
        .FirstOrDefaultAsync(a => a.Email == superAdminEmail && a.Role.BusinessEntity == "Admission");

    if (superAdminAccount?.Role?.RoleName != "SuperAdmin" && superAdminAccount?.Role?.BusinessEntity == "Admission")
        throw new UnauthorizedAccessException("Only superadmins can view student information.");

    // Start with the base query for all students
    var studentsQuery = _db.Accounts
        .AsNoTracking()
        .Include(a => a.AdmissionProfile)
        .Include(a => a.Role)
        .Where(a => a.AdmissionProfile != null && a.Role.RoleName == "PendingStudent" && a.IsActive == true && a.Role.BusinessEntity == "Admission");

    // Apply search filter if a search term is provided
    if (!string.IsNullOrEmpty(request.SearchTerm))
    {
        studentsQuery = studentsQuery.Where(s =>
            s.FullNameEn.Contains(request.SearchTerm) ||
            s.NationalId.Contains(request.SearchTerm) ||
            s.Email.Contains(request.SearchTerm)
        );
    }

    // Apply status filter if a status is provided
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
            studentsQuery = studentsQuery.Where(s => s.AdmissionProfile != null && s.AdmissionProfile.StatusId == statusId);
        }
    }

    // Count the total number of records before pagination and materialization
    var totalCount = await studentsQuery.CountAsync();

    // Project data into an anonymous type to include related data in a single query
    var projectedQuery = studentsQuery
        .Select(s => new
        {
            s.Id,
            FullName = s.FullNameAr,
            PhoneNumber = s.AdmissionProfile.PhoneNumber,
            ParentPhoneNumber = s.AdmissionProfile.ParentPhoneNumber,
            PreviousSchoolType = s.AdmissionProfile.PreviousSchoolType,
            s.NationalId,
            s.Email,
            MathScore = s.AdmissionProfile.MathScore,
            EnglishScore = s.AdmissionProfile.EnglishScore,
            FinalYearScore = s.AdmissionProfile.ThirdPrepScore,
            MinistryExamPercentage = s.AdmissionProfile.MinistryExamPercentage,
            Location = s.AdmissionProfile.Location,
            City = s.AdmissionProfile.City,
            District = s.AdmissionProfile.District,
            Status = s.AdmissionProfile.StatusId,
            HasOnlineTrainingCourses = s.AdmissionProfile.HasOnlineTrainingCourses,
            HasICDLLicense = s.AdmissionProfile.HasIcdllicense,
            HasLaptop = s.AdmissionProfile.HasLaptop,
            ExamResults = _db.StudentExamResults.FirstOrDefault(ser => ser.AccountId == s.Id),
            InterviewScores = _db.InterviewScores
                .Where(i => i.AccountId == s.Id)
                .Select(i => new
                {
                    Admin = _db.Accounts.Where(a => a.Id == i.InterviewerId).Select(a => a.FullNameEn).FirstOrDefault() ?? "Unknown Admin",
                    Score = (double)i.Score
                }).ToList()
        });




    // Apply sorting that can be translated to SQL before pagination
        projectedQuery = request.SortBy?.ToLower() switch
    {
        "name" => request.SortOrder?.ToLower() == "desc"
            ? projectedQuery.OrderByDescending(s => s.FullName)
            : projectedQuery.OrderBy(s => s.FullName),
        "nationalid" => request.SortOrder?.ToLower() == "desc"
            ? projectedQuery.OrderByDescending(s => s.NationalId)
            : projectedQuery.OrderBy(s => s.NationalId),
        "email" => request.SortOrder?.ToLower() == "desc"
            ? projectedQuery.OrderByDescending(s => s.Email)
            : projectedQuery.OrderBy(s => s.Email),
        "finalyearscore" => request.SortOrder?.ToLower() == "desc"
            ? projectedQuery.OrderByDescending(s => s.FinalYearScore)
            : projectedQuery.OrderBy(s => s.FinalYearScore),
        "percentage" => request.SortOrder?.ToLower() == "desc"
            ? projectedQuery.OrderByDescending(s => s.MinistryExamPercentage)
            : projectedQuery.OrderBy(s => s.MinistryExamPercentage),
        _ => projectedQuery.OrderBy(s => s.FullName) // Default sort
    };

    // Apply pagination and then execute the query to materialize the data
    var pagedStudents = await projectedQuery
        .Skip((request.PageNumber - 1) * request.PageSize)
        .Take(request.PageSize)
        .ToListAsync();

    // Materialize the final results, including post-materialization sorting and calculations
    var result = pagedStudents.Select(s =>
    {
        int examTotal = (s.ExamResults?.ExamMathScore ?? 0) +
                        (s.ExamResults?.ExamEnglishScore ?? 0) +
                        (s.ExamResults?.ExamSoftwareScore ?? 0) +
                        (s.ExamResults?.ExamArabicScore ?? 0);

        double totalPercentage = examTotal;
        foreach (var interviewScore in s.InterviewScores)
        {
            totalPercentage += (double)(interviewScore.Score / 3);
        }

        return new
        {
            s.Id,
            s.FullName,
            s.PhoneNumber,
            s.ParentPhoneNumber,
            s.PreviousSchoolType,
            s.NationalId,
            s.Email,
            s.MathScore,
            s.EnglishScore,
            s.FinalYearScore,
            s.MinistryExamPercentage,
            s.Location,
            s.City,
            s.District,
            Status = s.Status.ToString() ?? "1",
            ExamMathScore = s.ExamResults?.ExamMathScore ?? 0,
            ExamEnglishScore = s.ExamResults?.ExamEnglishScore ?? 0,
            ExamSoftwareScore = s.ExamResults?.ExamSoftwareScore ?? 0,
            ExamArabicScore = s.ExamResults?.ExamArabicScore ?? 0,
            ExamTotal = examTotal,
            InterviewScores = s.InterviewScores,
            TotalScore = examTotal + s.InterviewScores.Sum(i => i.Score),
            TotalPercentage = Math.Round(totalPercentage, 2),
            s.HasOnlineTrainingCourses,
            s.HasICDLLicense,
            s.HasLaptop
        };
    }).ToList();

    // Apply sorting for calculated fields after data is materialized
    if (request.SortBy?.ToLower() == "totalscore")
    {
        result = request.SortOrder?.ToLower() == "desc"
            ? result.OrderByDescending(r => r.TotalScore).ToList()
            : result.OrderBy(r => r.TotalScore).ToList();
    }
    else if (request.SortBy?.ToLower() == "totalpercentage")
    {
        result = request.SortOrder?.ToLower() == "desc"
            ? result.OrderByDescending(r => r.TotalPercentage).ToList()
            : result.OrderBy(r => r.TotalPercentage).ToList();
    }

    var totalPages = (int)Math.Ceiling((double)totalCount / request.PageSize);

    // Cast the final list to dynamic to match the DTO return type
    var dynamicResult = result.Select(item => (dynamic)item).ToList();

    return new PaginationResponseDTO<dynamic>
    {
        Data = dynamicResult,
        TotalCount = totalCount,
        PageNumber = request.PageNumber,
        PageSize = request.PageSize,
        TotalPages = totalPages,
        HasPreviousPage = request.PageNumber > 1,
        HasNextPage = request.PageNumber < totalPages
    };
}
}
