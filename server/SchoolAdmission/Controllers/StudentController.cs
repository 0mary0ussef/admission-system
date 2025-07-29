using Microsoft.AspNetCore.Mvc;
using SchoolAdmission.DTOs;
using SchoolAdmission.Models;
using SchoolAdmission.Data;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class StudentController : ControllerBase
{
    private readonly SchoolAdmissionDbContext db;
    private readonly IWebHostEnvironment environment;

    public StudentController(SchoolAdmissionDbContext context, IWebHostEnvironment env)
    {
        db = context;
        environment = env;
    }

    [HttpGet("validate/{nationalId}")]
    public async Task<IActionResult> ValidateNationalId(string nationalId)
    {
        var student = await db.Students.FirstOrDefaultAsync(s => s.NationalId == nationalId);
        if (student == null)
            return NotFound("Student not found");

        return Ok(student);
    }

    [HttpPost("complete-info")]
    public async Task<IActionResult> CompleteStudentInfo([FromBody] StudentCompleteInfoDTO dto)
    {
        var student = await db.Students.FirstOrDefaultAsync(s => s.NationalId == dto.NationalId);
        if (student == null)
            return NotFound("Student not found");
        
        // Update basic info
        student.DateOfBirth = dto.DateOfBirth;
        student.ParentOccupation = dto.ParentOccupation;
        student.Address = dto.Address;
        student.PhoneNumber = dto.PhoneNumber;
        student.Email = dto.Email;
        student.City = dto.City;
        student.District = dto.District;
        student.StreetName = dto.StreetName;
        student.BuildingNo = dto.BuildingNo;
        
        // Update document paths
        if (!string.IsNullOrEmpty(dto.BirthCertificatePath))
            student.BirthCertificatePath = dto.BirthCertificatePath;
        if (!string.IsNullOrEmpty(dto.SuccessReportPath))
            student.SuccessReportPath = dto.SuccessReportPath;
        if (!string.IsNullOrEmpty(dto.TuitionFeeReceiptPath))
            student.TuitionFeeReceiptPath = dto.TuitionFeeReceiptPath;
        if (!string.IsNullOrEmpty(dto.PreferencesSheetPath))
            student.PreferencesSheetPath = dto.PreferencesSheetPath;
        
        await db.SaveChangesAsync();
        return Ok("Student information updated successfully");
    }

    [HttpPost("upload-document")]
    public async Task<IActionResult> UploadDocument(IFormFile file, [FromQuery] string nationalId, [FromQuery] string documentType)
    {
        if (file == null || file.Length == 0)
            return BadRequest("No file uploaded");

        var student = await db.Students.FirstOrDefaultAsync(s => s.NationalId == nationalId);
        if (student == null)
            return NotFound("Student not found");

        // Check file type
        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".pdf" };
        var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!allowedExtensions.Contains(fileExtension))
            return BadRequest("Invalid file type. Only JPG, PNG, and PDF files are allowed.");

        // Check file size
        if (file.Length > 10 * 1024 * 1024)
            return BadRequest("File size too large. Maximum size is 10MB.");

        try
        {
            // Setup directory
            var uploadsPath = Path.Combine(environment.WebRootPath, "uploads", "documents");
            if (!Directory.Exists(uploadsPath))
                Directory.CreateDirectory(uploadsPath);

            // Save file
            var fileName = $"{nationalId}_{documentType}_{DateTime.Now:yyyyMMddHHmmss}{fileExtension}";
            var filePath = Path.Combine(uploadsPath, fileName);
            
            using var stream = new FileStream(filePath, FileMode.Create);
            await file.CopyToAsync(stream);

            // Update student record
            var relativePath = $"/uploads/documents/{fileName}";
            UpdateStudentDocumentPath(student, documentType, relativePath);

            await db.SaveChangesAsync();

            return Ok(new { 
                message = "Document uploaded successfully", 
                filePath = relativePath,
                documentType = documentType
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error uploading file: {ex.Message}");
        }
    }

    private void UpdateStudentDocumentPath(Student student, string documentType, string path)
    {
        switch (documentType.ToLower())
        {
            case "birthcertificate":
                student.BirthCertificatePath = path;
                break;
            case "successreport":
                student.SuccessReportPath = path;
                break;
            case "tuitionfeereceipt":
                student.TuitionFeeReceiptPath = path;
                break;
            case "preferencessheet":
                student.PreferencesSheetPath = path;
                break;
            default:
                throw new ArgumentException("Invalid document type");
        }
    }

    [HttpGet("validate-exam/{nationalId}")]
    public async Task<IActionResult> ValidateForExam(string nationalId)
    {
        var student = await db.Students.FirstOrDefaultAsync(s => s.NationalId == nationalId);
        if (student == null)
            return NotFound("Student not found");

        return Ok(student);
    }

    [HttpPost("submit-exam")]
    public async Task<IActionResult> SubmitExam([FromBody] ExamResultDTO dto)
    {
        var student = await db.Students.FirstOrDefaultAsync(s => s.NationalId == dto.NationalId);
        if (student == null)
            return NotFound("Student not found");

        var exam = new Exam
        {
            StudentId = student.Id,
            MathScore = dto.MathScore,
            EnglishScore = dto.EnglishScore,
            ArabicScore = dto.ArabicScore,
            SoftwareScore = dto.SoftwareScore
        };

        db.Exams.Add(exam);
        await db.SaveChangesAsync();
        
        return Ok(exam);
    }
}
