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
            var admin = await db.Admins.FirstOrDefaultAsync(a => a.Email == userEmail);
            if (admin == null)
                return Unauthorized("Admin not found or not authorized. Please log in again.");

            var students = await db.Students
                .Include(s => s.Exam)
                .Include(s => s.InterviewScores)
                    .ThenInclude(i => i.Admin)
                .ToListAsync();

            if (students.Count == 0)
                return NotFound("No students found in the system.");

            if (admin.Role.ToLower() == "admin")
            {
                var result = GetAdminView(students, admin.Id);
                return Ok(result);
            }
            else if (admin.Role.ToLower() == "superadmin")
            {
                var result = GetSuperAdminView(students);
                return Ok(result);
            }

            return Forbid("You do not have permission to view student information.");
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred while retrieving students: {ex.Message}");
        }
    }

    private List<dynamic> GetAdminView(List<Student> students, int adminId)
    {
        return students.Select(s => {
            var exam = s.Exam;
            var interviewScore = s.InterviewScores
                .FirstOrDefault(i => i.AdminId == adminId)?.Score ?? 0;
            
            var examTotal = GetExamTotal(exam);
            var totalWithInterview = examTotal + interviewScore;
            
            return new {
                s.FullName,
                s.Email,
                s.NationalId,
                s.MathScore,
                s.EnglishScore,
                s.FinalYearScore,
                s.MinistryExamPercentage,
                ExamMathScore = exam?.MathScore ?? 0,
                ExamEnglishScore = exam?.EnglishScore ?? 0,
                ExamArabicScore = exam?.ArabicScore ?? 0,
                ExamSoftwareScore = exam?.SoftwareScore ?? 0,
                InterviewScore = interviewScore,
                InterviewPercentage = totalWithInterview,
                TotalScore = examTotal
            };
        }).ToList<dynamic>();
    }

    private List<dynamic> GetSuperAdminView(List<Student> students)
    {
        return students.Select(s => {
            var exam = s.Exam;
            var interviewScores = s.InterviewScores
                .Select(i => new { Admin = i.Admin.FullName, i.Score }).ToList();

            var interviewScores2 = interviewScores[0].Score / 3 + interviewScores[1].Score / 3 + interviewScores[2].Score / 3;
            var totalScore = (exam?.MathScore ?? 0) + (exam?.EnglishScore ?? 0) + (exam?.ArabicScore ?? 0) + (exam?.SoftwareScore ?? 0);
            var examTotal = GetExamTotal(exam);
            var interviewPercentage = (examTotal + interviewScores2) / 100 * 100; 
            
            return new {
                s.FullName,
                s.PhoneNumber,
                s.NationalId,
                s.Email,
                s.MathScore,
                s.EnglishScore,
                s.FinalYearScore,
                s.MinistryExamPercentage,
                s.City,
                s.District,
                s.Status,
                ExamMathScore = exam?.MathScore ?? 0,
                ExamEnglishScore = exam?.EnglishScore ?? 0,
                ExamSoftwareScore = exam?.SoftwareScore ?? 0,
                ExamArabicScore = exam?.ArabicScore ?? 0,
                ExamTotal = examTotal,
                InterviewScores = interviewScores,
                TotalScore = totalScore,
                InterviewPercentage = interviewPercentage
            };
        }).ToList<dynamic>();
    }

    private double GetExamTotal(Exam? exam)
    {
        return (exam?.MathScore ?? 0) + (exam?.EnglishScore ?? 0) + 
               (exam?.ArabicScore ?? 0) + (exam?.SoftwareScore ?? 0);
    }

    [HttpGet("students/filter")]
    public async Task<IActionResult> FilterStudents([FromQuery] string? name, [FromQuery] string? nationalId)
    {
        try
        {
            var userEmail = GetCurrentAdminEmail();
            var admin = await db.Admins.FirstOrDefaultAsync(a => a.Email == userEmail);
            if (admin == null)
                return Unauthorized("Admin not found or not authorized. Please log in again.");

            if (admin.Role.ToLower() != "superadmin")
                return Forbid("Only superadmins can filter students.");

            var query = db.Students.AsQueryable();
            
            if (!string.IsNullOrEmpty(name))
                query = query.Where(s => s.FullName.Contains(name));
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
    public async Task<IActionResult> SetMyInterviewScore(int studentId, [FromBody] double scoreValue)
    {
        try
        {
            var userEmail = GetCurrentAdminEmail();
            var admin = await db.Admins.FirstOrDefaultAsync(a => a.Email == userEmail);
            if (admin == null)
                return Unauthorized("Admin not found or not authorized. Please log in again.");

            if (admin.Role.ToLower() != "admin")
                return Forbid("Only admins can set or edit their own interview score.");

            if (scoreValue < 0 || scoreValue > 40)
                return BadRequest("Interview score must be between 0 and 40.");

            var student = await db.Students.FirstOrDefaultAsync(s => s.Id == studentId);
            if (student == null)
                return NotFound($"Student with ID {studentId} not found.");

            var interviewScore = await db.InterviewScores
                .FirstOrDefaultAsync(s => s.StudentId == studentId && s.AdminId == admin.Id);
                
            if (interviewScore == null)
            {
                interviewScore = new InterviewScore { 
                    StudentId = studentId, 
                    AdminId = admin.Id, 
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
    public async Task<IActionResult> UpdateStudentStatus(int studentId, [FromBody] string status)
    {
        try
        {
            var userEmail = GetCurrentAdminEmail();
            var admin = await db.Admins.FirstOrDefaultAsync(a => a.Email == userEmail);
            if (admin == null)
                return Unauthorized("Admin not found or not authorized. Please log in again.");

            if (admin.Role.ToLower() != "superadmin")
                return Forbid("Only superadmins can update student status.");

            var student = await db.Students.FirstOrDefaultAsync(s => s.Id == studentId);
            if (student == null)
                return NotFound($"Student with ID {studentId} not found.");

            if (!Enum.TryParse<StudentStatus>(status, true, out var studentStatus))
                return BadRequest("Invalid status. Must be one of: Pending, Accepted, Waitlist, Rejected");

            student.Status = studentStatus;
            await db.SaveChangesAsync();

            return Ok(new { 
                Success = true, 
                Message = $"Student status updated to {studentStatus} successfully.",
                StudentId = studentId,
                Status = studentStatus
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred while updating student status: {ex.Message}");
        }
    }
}
