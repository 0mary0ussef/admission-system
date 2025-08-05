using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using SchoolAdmission.DTOs;
using SchoolAdmission.Models;
using SchoolAdmission.Data;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AdminController : ControllerBase
{
    private readonly SchoolAdmissionDbContext db;

    public AdminController(SchoolAdmissionDbContext context)
    {
        db = context;
    }

    private string GetCurrentAdminEmail()
    {
        return User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst("sub")?.Value
            ?? string.Empty;
    }

    [HttpGet("students")]
    public async Task<IActionResult> GetAllStudents()
    {
        try
        {
            var userEmail = GetCurrentAdminEmail();
            var adminAccount = await db.Accounts
                .Include(a => a.AccountType)
                .FirstOrDefaultAsync(a => a.Email == userEmail);
                
            if (adminAccount == null)
                return Unauthorized("Admin not found or not authorized. Please log in again.");

            if (adminAccount.AccountType.AccountTypeName != "Admin" && 
                adminAccount.AccountType.AccountTypeName != "SuperAdmin")
                return Forbid("Only admins can view student information.");

            var students = await db.Accounts
                .Include(a => a.AdmissionProfile)
                .Include(a => a.StudentExtension)
                .Include(a => a.AccountType)
                .Where(a => a.AccountType.AccountTypeName == "Student")
                .ToListAsync();

            if (students.Count == 0)
                return NotFound("No students found in the system.");

            if (adminAccount.AccountType.AccountTypeName == "Admin")
            {
                var result = await GetAdminView(students, adminAccount.Id);
                return Ok(result);
            }
            else if (adminAccount.AccountType.AccountTypeName == "SuperAdmin")
            {
                var result = await GetSuperAdminView(students);
                return Ok(result);
            }

            return Forbid("You do not have permission to view student information.");
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred while retrieving students: {ex.Message}");
        }
    }

    private async Task<List<dynamic>> GetAdminView(List<Account> students, long adminId)
    {
        var result = new List<dynamic>();
        
        foreach (var s in students)
        {
            var admissionProfile = s.AdmissionProfile;
            var studentExtension = s.StudentExtension;
            
            // Get exam results for this student
            var examResults = await db.StudentExamResults
                .FirstOrDefaultAsync(ser => ser.AccountId == s.Id);
            
            // Get interview scores for this student by this admin
            var interviewScore = await db.InterviewScores
                .FirstOrDefaultAsync(i => i.StudentId == s.Id && i.AdminId == adminId);
            
            var examTotal = GetExamTotal(examResults);
            var interviewScoreValue = interviewScore?.Score ?? 0;
            var totalWithInterview = examTotal + interviewScoreValue;
            
            result.Add(new {
                s.Id,
                FullName = s.FullNameEn,
                s.Email,
                s.NationalId,
                MathScore = admissionProfile?.MathScore ?? 0,
                EnglishScore = admissionProfile?.EnglishScore ?? 0,
                FinalYearScore = admissionProfile?.ThirdPrepScore ?? 0,
                MinistryExamPercentage = admissionProfile?.MinistryExamPercentage ?? 0,
                Status = admissionProfile?.Status.ToString() ?? "Pending",
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

    private async Task<List<dynamic>> GetSuperAdminView(List<Account> students)
    {
        var result = new List<dynamic>();
        
        foreach (var s in students)
        {
            var admissionProfile = s.AdmissionProfile;
            var studentExtension = s.StudentExtension;
            
            // Get exam results for this student
            var examResults = await db.StudentExamResults
                .FirstOrDefaultAsync(ser => ser.AccountId == s.Id);
            
            // Get all interview scores for this student
            var interviewScores = await db.InterviewScores
                .Where(i => i.StudentId == s.Id)
                .Select(i => new { 
                    Admin = db.Accounts.Where(a => a.Id == i.AdminId).Select(a => a.FullNameEn).FirstOrDefault() ?? "Unknown Admin", 
                    i.Score 
                })
                .ToListAsync();

            // Calculate average interview score safely
            double averageInterviewScore = 0;
            if (interviewScores.Count > 0)
            {
                averageInterviewScore = interviewScores.Sum(i => i.Score) / interviewScores.Count;
            }
            
            var examTotal = GetExamTotal(examResults);
            var interviewPercentage = examTotal + averageInterviewScore; 
            
            result.Add(new {
                s.Id,
                FullName = s.FullNameEn,
                PhoneNumber = admissionProfile?.PhoneNumber ?? "",
                s.NationalId,
                s.Email,
                MathScore = admissionProfile?.MathScore ?? 0,
                EnglishScore = admissionProfile?.EnglishScore ?? 0,
                FinalYearScore = admissionProfile?.ThirdPrepScore ?? 0,
                MinistryExamPercentage = admissionProfile?.MinistryExamPercentage ?? 0,
                City = admissionProfile?.City ?? "",
                District = admissionProfile?.District ?? "",
                Status = admissionProfile?.Status.ToString() ?? "Pending",
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

    private double GetExamTotal(StudentExamResults? examResults)
    {
        if (examResults == null)
            return 0;
            
        return examResults.ExamMathScore + examResults.ExamEnglishScore + 
               examResults.ExamArabicScore + examResults.ExamSoftwareScore;
    }

    [HttpGet("students/filter")]
    public async Task<IActionResult> FilterStudents([FromQuery] string? name, [FromQuery] string? nationalId)
    {
        try
        {
            var userEmail = GetCurrentAdminEmail();
            var adminAccount = await db.Accounts
                .Include(a => a.AccountType)
                .FirstOrDefaultAsync(a => a.Email == userEmail);
                
            if (adminAccount == null)
                return Unauthorized("Admin not found or not authorized. Please log in again.");

            if (adminAccount.AccountType.AccountTypeName != "SuperAdmin")
                return Forbid("Only superadmins can filter students.");

            var query = db.Accounts
                .Include(a => a.AdmissionProfile)
                .Include(a => a.StudentExtension)
                .Where(a => a.AccountType.AccountTypeName == "Student")
                .AsQueryable();
            
            if (!string.IsNullOrEmpty(name))
                query = query.Where(s => s.FullNameEn.Contains(name));
            if (!string.IsNullOrEmpty(nationalId))
                query = query.Where(s => s.NationalId == nationalId);
                
            var result = await query.ToListAsync();
            if (result.Count == 0)
                return NotFound("No students match the provided filter criteria.");
                
            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred while filtering students: {ex.Message}");
        }
    }

    [HttpPost("student/{studentId}/my-interview-score")]
    public async Task<IActionResult> SetMyInterviewScore(long studentId, [FromBody] double scoreValue)
    {
        try
        {
            var userEmail = GetCurrentAdminEmail();
            var adminAccount = await db.Accounts
                .Include(a => a.AccountType)
                .FirstOrDefaultAsync(a => a.Email == userEmail);
                
            if (adminAccount == null)
                return Unauthorized("Admin not found or not authorized. Please log in again.");

            if (adminAccount.AccountType.AccountTypeName != "Admin")
                return Forbid("Only admins can set or edit their own interview score.");

            if (scoreValue < 0 || scoreValue > 40)
                return BadRequest("Interview score must be between 0 and 40.");

            var student = await db.Accounts.FirstOrDefaultAsync(s => s.Id == studentId);
            if (student == null)
                return NotFound($"Student with ID {studentId} not found.");

            var interviewScore = await db.InterviewScores
                .FirstOrDefaultAsync(s => s.StudentId == studentId && s.AdminId == adminAccount.Id);
                
            if (interviewScore == null)
            {
                interviewScore = new InterviewScore { 
                    StudentId = studentId, 
                    AdminId = adminAccount.Id, 
                    Score = scoreValue 
                };
                db.InterviewScores.Add(interviewScore);
            }
            else
            {
                interviewScore.Score = scoreValue;
            }

            await db.SaveChangesAsync();
            
            var allScores = await db.InterviewScores
                .Where(s => s.StudentId == studentId)
                .SumAsync(s => s.Score);
            var percentage = (allScores / 120.0) * 100;
            
            return Ok(new { 
                Success = true, 
                Message = "Interview score submitted successfully.", 
                TotalPercentage = percentage 
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred while submitting your interview score: {ex.Message}");
        }
    }

    [HttpPut("student/{studentId}/status")]
    public async Task<IActionResult> UpdateStudentStatus(long studentId, [FromBody] UpdateStudentStatusDTO dto)
    {
        try
        {
            var userEmail = GetCurrentAdminEmail();
            var adminAccount = await db.Accounts
                .Include(a => a.AccountType)
                .FirstOrDefaultAsync(a => a.Email == userEmail);
                
            if (adminAccount == null)
                return Unauthorized("Admin not found or not authorized. Please log in again.");

            if (adminAccount.AccountType.AccountTypeName != "SuperAdmin")
                return Forbid("Only superadmins can update student status.");

            var student = await db.Accounts
                .Include(a => a.AdmissionProfile)
                .FirstOrDefaultAsync(s => s.Id == studentId);
                
            if (student == null)
                return NotFound($"Student with ID {studentId} not found.");

            if (student.AdmissionProfile == null)
                return NotFound($"Student admission profile not found for student ID {studentId}.");

            // Validate status value
            if (!Enum.TryParse<AdmissionStatus>(dto.Status, true, out var admissionStatus))
                return BadRequest($"Invalid status. Allowed values are: {string.Join(", ", Enum.GetNames<AdmissionStatus>())}");

            // Update the status
            student.AdmissionProfile.Status = admissionStatus;
            await db.SaveChangesAsync();
            
            return Ok(new { 
                Success = true, 
                Message = $"Student status updated successfully to {admissionStatus}.",
                StudentId = studentId,
                StudentName = student.FullNameEn,
                Status = admissionStatus.ToString()
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred while updating student status: {ex.Message}");
        }
    }
}
