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
        var account = await db.Accounts
            .Include(a => a.AdmissionProfile)
            .Include(a => a.StudentExtension)
            .FirstOrDefaultAsync(a => a.NationalId == nationalId);
            
        if (account == null)
            return NotFound("Student not found");

        return Ok(new {
            accountId = account.Id,
            nationalId = account.NationalId,
            fullName = account.FullNameEn,
            email = account.Email,
            admissionProfile = account.AdmissionProfile,
            studentExtension = account.StudentExtension
        });
    }

    [HttpPost("complete-info")]
    public async Task<IActionResult> CompleteStudentInfo([FromBody] StudentCompleteInfoDTO dto)
    {
        var account = await db.Accounts
            .Include(a => a.AdmissionProfile)
            .FirstOrDefaultAsync(a => a.NationalId == dto.NationalId);
            
        if (account == null)
            return NotFound("Student not found");
        
        // Update Account email if provided
        if (!string.IsNullOrEmpty(dto.Email))
        {
            account.Email = dto.Email;
        }
        
        // Update AdmissionProfile with additional info
        if (account.AdmissionProfile != null)
        {
            account.AdmissionProfile.ParentOccupation = dto.ParentOccupation ?? "";
            account.AdmissionProfile.Address = dto.Address ?? "";
            account.AdmissionProfile.PhoneNumber = dto.PhoneNumber ?? "";
            account.AdmissionProfile.City = dto.City ?? "";
            account.AdmissionProfile.District = dto.District ?? "";
            account.AdmissionProfile.StreetName = dto.StreetName ?? "";
            account.AdmissionProfile.BuildingNo = dto.BuildingNo ?? "";
            
            // Update document paths
            if (!string.IsNullOrEmpty(dto.BirthCertificatePath))
                account.AdmissionProfile.BirthCertificatePath = dto.BirthCertificatePath;
            if (!string.IsNullOrEmpty(dto.SuccessReportPath))
                account.AdmissionProfile.SuccessReportPath = dto.SuccessReportPath;
            if (!string.IsNullOrEmpty(dto.TuitionFeeReceiptPath))
                account.AdmissionProfile.TuitionFeeReceiptPath = dto.TuitionFeeReceiptPath;
            if (!string.IsNullOrEmpty(dto.PreferencesSheetPath))
                account.AdmissionProfile.PreferencesSheetPath = dto.PreferencesSheetPath;
        }
        else
        {
            return BadRequest("Student admission profile not found");
        }
        
        await db.SaveChangesAsync();
        return Ok("Student information updated successfully");
    }

    [HttpPost("upload-document")]
    public async Task<IActionResult> UploadDocument(IFormFile file, [FromQuery] string nationalId, [FromQuery] string documentType)
    {
        if (file == null || file.Length == 0)
            return BadRequest("No file uploaded");

        var account = await db.Accounts
            .Include(a => a.AdmissionProfile)
            .FirstOrDefaultAsync(a => a.NationalId == nationalId);
            
        if (account == null)
            return NotFound("Student not found");

        if (account.AdmissionProfile == null)
            return BadRequest("Student admission profile not found");

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

            // Update admission profile record
            var relativePath = $"/uploads/documents/{fileName}";
            UpdateAdmissionProfileDocumentPath(account.AdmissionProfile, documentType, relativePath);

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

    private void UpdateAdmissionProfileDocumentPath(AdmissionProfile admissionProfile, string documentType, string path)
    {
        switch (documentType.ToLower())
        {
            case "birthcertificate":
                admissionProfile.BirthCertificatePath = path;
                break;
            case "successreport":
                admissionProfile.SuccessReportPath = path;
                break;
            case "tuitionfeereceipt":
                admissionProfile.TuitionFeeReceiptPath = path;
                break;
            case "preferencessheet":
                admissionProfile.PreferencesSheetPath = path;
                break;
            default:
                throw new ArgumentException("Invalid document type");
        }
    }

    [HttpGet("validate-exam/{nationalId}")]
    public async Task<IActionResult> ValidateForExam(string nationalId)
    {
        var account = await db.Accounts
            .Include(a => a.AdmissionProfile)
            .Include(a => a.AccountType)
            .FirstOrDefaultAsync(a => a.NationalId == nationalId);
            
        if (account == null)
            return NotFound("Student not found");

        if (account.AccountType.AccountTypeName != "Student")
            return BadRequest("Only students can take exams");

        // Check if student has already taken the exam
        var existingResults = await db.StudentExamResults
            .FirstOrDefaultAsync(ser => ser.AccountId == account.Id);

        return Ok(new {
            accountId = account.Id,
            nationalId = account.NationalId,
            fullName = account.FullNameEn,
            admissionProfile = account.AdmissionProfile,
            hasTakenExam = existingResults != null,
            examResults = existingResults
        });
    }

    // Note: SubmitAnswers functionality is now handled in ExamController.SubmitAnswers
    // to maintain consistency and avoid duplication
}
