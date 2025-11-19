using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using SchoolAdmission.DTOs;
using SchoolAdmission.Services;
using OfficeOpenXml;
using OfficeOpenXml.Style;
using SchoolAdmission.Data;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Collections.Generic;
using System;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AdminController : ControllerBase
{
    private readonly IAdminService _adminService;
    private readonly SchoolAdmissionDbContext _db;
    private static readonly List<ExportColumnDefinitionDTO> ExportableColumns = new()
    {
        new ExportColumnDefinitionDTO { Key = "StudName", Label = "Student Name", Description = "Full name of the applicant" },
        new ExportColumnDefinitionDTO { Key = "SocialID", Label = "National ID", Description = "National identification number" },
        new ExportColumnDefinitionDTO { Key = "Prep_Scores", Label = "Prep Scores", Description = "Math & English prep scores" },
        new ExportColumnDefinitionDTO { Key = "Prep_Final%", Label = "Prep Final %", Description = "Final year percentage" },
        new ExportColumnDefinitionDTO { Key = "MinistryExam%", Label = "Ministry Exam %", Description = "Ministry exam percentage" },
        new ExportColumnDefinitionDTO { Key = "InterviewersScores", Label = "Interviewers Scores", Description = "Scores given by interviewers" },
        new ExportColumnDefinitionDTO { Key = "Interviewers_SUM_Scores", Label = "Interviewers Sum", Description = "Sum of interviewer scores" },
        new ExportColumnDefinitionDTO { Key = "Interviewers_Count", Label = "Interviewers Count", Description = "Number of interviewers" },
        new ExportColumnDefinitionDTO { Key = "Interviewers_AVG_Scores%", Label = "Interview Average %", Description = "Average interviewer score (percentage)" },
        new ExportColumnDefinitionDTO { Key = "SchoolExamSectionScores", Label = "Exam Section Scores", Description = "Detailed school exam section scores" },
        new ExportColumnDefinitionDTO { Key = "SchoolExamSection_SUM_Scores", Label = "Exam Section Sum", Description = "Sum of school exam section scores" },
        new ExportColumnDefinitionDTO { Key = "SchoolExamSection_Count", Label = "Exam Section Count", Description = "Number of school exam sections" },
        new ExportColumnDefinitionDTO { Key = "SchoolExamSection_Scores_AVG%", Label = "Exam Section Avg %", Description = "Average school exam section percentage" },
        new ExportColumnDefinitionDTO { Key = "ResultAdmission1%", Label = "Result Admission 1 %", Description = "First admission metric" },
        new ExportColumnDefinitionDTO { Key = "ResultAdmission2%", Label = "Result Admission 2 %", Description = "Second admission metric" }
    };

    public AdminController(IAdminService adminService, SchoolAdmissionDbContext db)
    {
        _adminService = adminService;
        _db = db;
    }

    /*
        [HttpGet("students")]
        public async Task<IActionResult> GetAllStudents()
        {
            try
            {
                var userEmail = await _adminService.GetCurrentAdminEmailAsync(User);
                if (string.IsNullOrEmpty(userEmail))
                    return Unauthorized("Admin not found or not authorized. Please log in again.");

                var adminAccount = await _adminService.GetAccountByEmailAsync(userEmail);
                if (adminAccount == null)
                    return Unauthorized("Admin not found or not authorized. Please log in again.");

                List<dynamic> result;
                if (adminAccount.Role.RoleName == "Admin" && adminAccount.Role.BusinessEntity == "Admission")
                {
                    result = await _adminService.GetStudentsForAdminAsync(userEmail);
                }
                else if (adminAccount.Role.RoleName == "SuperAdmin" && adminAccount.Role.BusinessEntity == "Admission")
                {
                    result = await _adminService.GetStudentsForSuperAdminAsync(userEmail);
                }
                else
                {
                    return Forbid("You do not have permission to view student information.");
                }

                if (result.Count == 0)
                    return NotFound("No students found in the system.");

                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse.ErrorResult("An error occurred while retrieving students", ex.Message));
            }
        }

    */


    [HttpGet("students/paginated")]
    public async Task<IActionResult> GetStudentsPaginated(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? searchTerm = null,
        [FromQuery] string? statusFilter = null,
        [FromQuery] string? sortBy = "name",
        [FromQuery] string? sortOrder = "asc")
    {
        try
        {
            var userEmail = await _adminService.GetCurrentAdminEmailAsync(User);
            if (string.IsNullOrEmpty(userEmail))
                return Unauthorized("Admin not found or not authorized. Please log in again.");

            var adminAccount = await _adminService.GetAccountByEmailAsync(userEmail);
            if (adminAccount == null)
                return Unauthorized("Admin not found or not authorized. Please log in again.");

            var request = new PaginationRequestDTO
            {
                PageNumber = pageNumber,
                PageSize = pageSize,
                SearchTerm = searchTerm,
                StatusFilter = statusFilter,
                SortBy = sortBy,
                SortOrder = sortOrder
            };

            PaginationResponseDTO<dynamic> result;
            if (adminAccount.Role.RoleName == "Admin" && adminAccount.Role.BusinessEntity == "Admission")
            {
                result = await _adminService.GetStudentsForAdminPaginatedAsync(userEmail, request);
            }
            else if (adminAccount.Role.RoleName == "SuperAdmin" && adminAccount.Role.BusinessEntity == "Admission")
            {
                result = await _adminService.GetStudentsForSuperAdminPaginatedAsync(userEmail, request);
            }
            else
            {
                return Forbid("You do not have permission to view student information.");
            }
 
            // Always return the result, even if empty (this is normal for filters)
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse.ErrorResult("An error occurred while retrieving students", ex.Message));
        }
    }



    [HttpGet("students/filter")]
    public async Task<IActionResult> FilterStudents([FromQuery] string? name, [FromQuery] string? nationalId)
    {
        try
        {
            var userEmail = await _adminService.GetCurrentAdminEmailAsync(User);
            if (string.IsNullOrEmpty(userEmail))
                return Unauthorized("Admin not found or not authorized. Please log in again.");

            var adminAccount = await _adminService.GetAccountByEmailAsync(userEmail);
            if (adminAccount == null)
                return Unauthorized("Admin not found or not authorized. Please log in again.");

            if (adminAccount.Role.RoleName != "SuperAdmin" || adminAccount.Role.BusinessEntity != "Admission")
                return Forbid("Only superadmins can filter students.");

            var result = await _adminService.FilterStudentsAsync(name, nationalId);
            if (result.Count == 0)
                return NotFound("No students match the provided filter criteria.");

            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse.ErrorResult("An error occurred while filtering students", ex.Message));
        }
    }



    [HttpPost("student/{studentId}/my-interview-score")]
    public async Task<IActionResult> SetMyInterviewScore(long studentId, [FromBody] double scoreValue)
    {
        try
        {
            var userEmail = await _adminService.GetCurrentAdminEmailAsync(User);
            if (string.IsNullOrEmpty(userEmail))
                return Unauthorized("Admin not found or not authorized. Please log in again.");

            var adminAccount = await _adminService.GetAccountByEmailAsync(userEmail);
            if (adminAccount == null)
                return Unauthorized("Admin not found or not authorized. Please log in again.");

            if (adminAccount.Role.RoleName != "Admin" || adminAccount.Role.BusinessEntity != "Admission")
                return Forbid("Only admins can set or edit their own interview score.");

            await _adminService.SetInterviewScoreAsync(studentId, adminAccount.Id, scoreValue);

            return Ok(ApiResponse.SuccessResult("Interview score submitted successfully."));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse.ErrorResult("An error occurred while submitting your interview score", ex.Message));
        }
    }


    [HttpPut("student/{studentId}/status")]
    public async Task<IActionResult> UpdateStudentStatus(long studentId, [FromBody] UpdateStudentStatusDTO dto)
    {
        try
        {
            var userEmail = await _adminService.GetCurrentAdminEmailAsync(User);
            if (string.IsNullOrEmpty(userEmail))
                return Unauthorized("Admin not found or not authorized. Please log in again.");

            var adminAccount = await _adminService.GetAccountByEmailAsync(userEmail);
            if (adminAccount == null)
                return Unauthorized("Admin not found or not authorized. Please log in again.");

            if (adminAccount.Role.RoleName != "SuperAdmin" || adminAccount.Role.BusinessEntity != "Admission")
                return Forbid("Only superadmins can update student status.");

            await _adminService.UpdateStudentStatusAsync(studentId, dto.Status);

            return Ok(ApiResponse.SuccessResult($"Student status updated successfully to {dto.Status}."));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse.ErrorResult("An error occurred while updating student status", ex.Message));
        }
    }

    [HttpGet("export-students-columns")]
    public async Task<IActionResult> GetExportStudentsColumns()
    {
        try
        {
            var userEmail = await _adminService.GetCurrentAdminEmailAsync(User);
            if (string.IsNullOrEmpty(userEmail))
                return Unauthorized("Admin not found or not authorized. Please log in again.");

            var adminAccount = await _adminService.GetAccountByEmailAsync(userEmail);
            if (adminAccount == null)
                return Unauthorized("Admin not found or not authorized. Please log in again.");

            if (adminAccount.Role.RoleName != "SuperAdmin" || adminAccount.Role.BusinessEntity != "Admission")
                return Forbid("Only superadmins can configure export data.");

            return Ok(ExportableColumns);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse.ErrorResult("An error occurred while fetching export columns", ex.Message));
        }
    }

    [HttpPost("export-students-excel")]
    public async Task<IActionResult> ExportStudentsToExcel([FromBody] ExportStudentsRequestDTO? request)
    {
        try
        {
            var userEmail = await _adminService.GetCurrentAdminEmailAsync(User);
            if (string.IsNullOrEmpty(userEmail))
                return Unauthorized("Admin not found or not authorized. Please log in again.");

            var adminAccount = await _adminService.GetAccountByEmailAsync(userEmail);
            if (adminAccount == null)
                return Unauthorized("Admin not found or not authorized. Please log in again.");

            if (adminAccount.Role.RoleName != "SuperAdmin" || adminAccount.Role.BusinessEntity != "Admission")
                return Forbid("Only superadmins can export students data.");

            var students = await _adminService.GetStudentsForSuperAdminAsync(userEmail);

            if (students == null || students.Count == 0)
            {
                return NotFound("No students found to export.");
            }

            var requestedColumns = request?.Columns?
                .Where(c => !string.IsNullOrWhiteSpace(c))
                .Select(c => c.Trim())
                .ToList() ?? new List<string>();

            var availableKeys = new HashSet<string>(ExportableColumns.Select(c => c.Key));
            var columnsToExport = (requestedColumns.Count > 0
                ? requestedColumns.Where(key => availableKeys.Contains(key)).Distinct().ToList()
                : ExportableColumns.Select(c => c.Key).ToList());

            if (columnsToExport.Count == 0)
            {
                columnsToExport = ExportableColumns.Select(c => c.Key).ToList();
            }

            var headerLookup = ExportableColumns.ToDictionary(c => c.Key, c => c.Label);
            var columnSelectors = new Dictionary<string, Func<dynamic, object?>>
            {
                ["StudName"] = data => data.Student.FullName ?? "",
                ["SocialID"] = data => data.Student.NationalId ?? "",
                ["Prep_Scores"] = data => data.PrepScores,
                ["Prep_Final%"] = data => data.PrepFinalPercent,
                ["MinistryExam%"] = data => data.MinistryExamPercent,
                ["InterviewersScores"] = data => data.InterviewersScores,
                ["Interviewers_SUM_Scores"] = data => data.InterviewersSumScores,
                ["Interviewers_Count"] = data => data.InterviewersCount,
                ["Interviewers_AVG_Scores%"] = data => data.InterviewersAvgScoresPercent,
                ["SchoolExamSectionScores"] = data => data.SchoolExamSectionScores,
                ["SchoolExamSection_SUM_Scores"] = data => data.SchoolExamSectionSumScores,
                ["SchoolExamSection_Count"] = data => data.SchoolExamSectionCount,
                ["SchoolExamSection_Scores_AVG%"] = data => data.SchoolExamSectionScoresAvgPercent,
                ["ResultAdmission1%"] = data => data.ResultAdmission1Percent,
                ["ResultAdmission2%"] = data => data.ResultAdmission2Percent
            };

            using var package = new ExcelPackage();
            var worksheet = package.Workbook.Worksheets.Add("Students Data");

            for (int i = 0; i < columnsToExport.Count; i++)
            {
                var key = columnsToExport[i];
                worksheet.Cells[1, i + 1].Value = headerLookup.TryGetValue(key, out var label) ? label : key;
                worksheet.Cells[1, i + 1].Style.Font.Bold = true;
                worksheet.Cells[1, i + 1].Style.Fill.PatternType = ExcelFillStyle.Solid;
                worksheet.Cells[1, i + 1].Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightBlue);
            }

            // Add data rows using optimized LINQ logic with direct InterviewScores query
            var processedStudents = new List<dynamic>();
            
            foreach (var student in students)
            {
                // Get interview scores data directly from database
                var studentId = (long)student.Id;
                var interviewScores = await _db.InterviewScores
                    .Where(i => i.AccountId == studentId)
                    .Select(i => new {
                        Admin = _db.Accounts.Where(a => a.Id == i.InterviewerId).Select(a => a.FullNameEn).FirstOrDefault() ?? "Unknown Admin",
                        Score = (double)i.Score
                    })
                    .ToListAsync();

                // Calculate interview statistics
                var interviewScoresList = interviewScores.Select(i => i.Score).ToList();
                var interviewersScores = string.Join(", ", interviewScoresList);
                var interviewersSumScores = interviewScoresList.Sum();
                var interviewersCount = interviewScoresList.Count;
                var interviewersAvgScoresPercent = interviewersCount > 0 ? 
                    Math.Round((interviewersSumScores / interviewersCount) * 100.0 / 40.0, 2) : 0.0;

                // Calculate prep scores
                var mathScore = (double)(student.MathScore ?? 0);
                var englishScore = (double)(student.EnglishScore ?? 0);
                var finalYearScore = (double)(student.FinalYearScore ?? 0);
                var ministryExamPercent = (double)(student.MinistryExamPercentage ?? 0);

                // Calculate school exam section scores
                var examArabicScore = (double)(student.ExamArabicScore ?? 0);
                var examEnglishScore = (double)(student.ExamEnglishScore ?? 0);
                var examMathScore = (double)(student.ExamMathScore ?? 0);
                var examSoftwareScore = (double)(student.ExamSoftwareScore ?? 0);

                var prepScores = $"MathPrep={mathScore}|EnglishPrep={englishScore}";
                var prepFinalPercent = Math.Round(finalYearScore * 100.0 / 280.0, 2);
                var schoolExamSectionScores = $"[ExamArabicScore]={examArabicScore}|[ExamEnglishScore]={examEnglishScore}|[ExamMathScore]={examMathScore}|[ExamSoftwareScore]={examSoftwareScore}|";
                var schoolExamSectionSumScores = examArabicScore + examEnglishScore + examMathScore + examSoftwareScore;
                var schoolExamSectionCount = 4;
                var schoolExamSectionScoresAvgPercent = Math.Round(schoolExamSectionSumScores * 100.0 / 60.0, 2);

                // Calculate result admission percentages
                var resultAdmission1Percent = Math.Round((interviewersAvgScoresPercent + schoolExamSectionScoresAvgPercent) / 2.0, 2);
                var resultAdmission2Percent = Math.Round((prepFinalPercent + ministryExamPercent + interviewersAvgScoresPercent + schoolExamSectionScoresAvgPercent) / 4.0, 2);

                processedStudents.Add(new
                {
                    Student = student,
                    InterviewersScores = interviewersScores,
                    InterviewersSumScores = interviewersSumScores,
                    InterviewersCount = interviewersCount,
                    InterviewersAvgScoresPercent = interviewersAvgScoresPercent,
                    PrepScores = prepScores,
                    PrepFinalPercent = prepFinalPercent,
                    MinistryExamPercent = ministryExamPercent,
                    SchoolExamSectionScores = schoolExamSectionScores,
                    SchoolExamSectionSumScores = schoolExamSectionSumScores,
                    SchoolExamSectionCount = schoolExamSectionCount,
                    SchoolExamSectionScoresAvgPercent = schoolExamSectionScoresAvgPercent,
                    ResultAdmission1Percent = resultAdmission1Percent,
                    ResultAdmission2Percent = resultAdmission2Percent
                });
            }

            // Fill Excel cells
            int row = 2;
            foreach (var data in processedStudents)
            {
                for (int columnIndex = 0; columnIndex < columnsToExport.Count; columnIndex++)
                {
                    var key = columnsToExport[columnIndex];
                    if (columnSelectors.TryGetValue(key, out var selector))
                    {
                        worksheet.Cells[row, columnIndex + 1].Value = selector(data);
                    }
                }
                row++;
            }

            // Auto-fit columns
            worksheet.Cells.AutoFitColumns();

            // Generate file name with timestamp
            var fileName = $"Students_Export_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";

            // Convert to byte array
            var fileBytes = package.GetAsByteArray();

            // Return file
            return File(fileBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse.ErrorResult("An error occurred while exporting students data", ex.Message));
        }
    }

    private string GetStatusText(object status)
    {
        if (status == null) return "Pending";
        
        string statusStr = status.ToString();
        return statusStr switch
        {
            "1" => "Pending",
            "2" => "Accepted",
            "3" => "Rejected",
            "4" => "Waitlisted",
            _ => "Pending"
        };
    }
}
