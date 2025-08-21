using SchoolAdmission.DTOs;
using SchoolAdmission.Models;
using SchoolAdmission.Data;
using Microsoft.EntityFrameworkCore;

namespace SchoolAdmission.Services;

public class StudentService : IStudentService
{
    private readonly SchoolAdmissionDbContext _db;

    public StudentService(SchoolAdmissionDbContext db)
    {
        _db = db;
    }

    public async Task<Account?> GetStudentByNationalIdAsync(string nationalId)
    {
        return await _db.Accounts
            .Include(a => a.AdmissionProfile)
            .FirstOrDefaultAsync(a => a.NationalId == nationalId);
    }

    public async Task<bool> ValidateStudentForExamAsync(string nationalId)
    {
        var account = await _db.Accounts
            .Include(a => a.Role)
            .FirstOrDefaultAsync(a => a.NationalId == nationalId);

        return account?.Role?.RoleName == "Student";
    }

    public async Task<bool> HasStudentCompletedExamAsync(long accountId)
    {
        return await _db.StudentExamResults.AnyAsync(ser => ser.AccountId == accountId);
    }

    public async Task<AdmissionProfile?> GetStudentAdmissionProfileAsync(long accountId)
    {
        return await _db.AdmissionProfiles.FirstOrDefaultAsync(ap => ap.AccountId == accountId);
    }

    public async Task UpdateStudentInfoAsync(string nationalId, StudentCompleteInfoDTO dto)
    {
        var account = await GetStudentByNationalIdAsync(nationalId);
        if (account == null)
            throw new InvalidOperationException("Student not found");

        // Update Account email if provided
        if (!string.IsNullOrEmpty(dto.Email))
        {
            // Check if email already exists for another account
            var existingAccount = await _db.Accounts.FirstOrDefaultAsync(a => a.Email == dto.Email && a.Id != account.Id);
            if (existingAccount != null)
            {
                throw new InvalidOperationException("Email address already exists. Please use a different email.");
            }
            
            account.Email = dto.Email;
        }

        // Update AdmissionProfile
        if (account.AdmissionProfile != null)
        {
            account.AdmissionProfile.ParentOccupation = dto.ParentOccupation ?? "";
            account.AdmissionProfile.Location = dto.Location ?? "";
            account.AdmissionProfile.PhoneNumber = dto.PhoneNumber ?? "";
            account.AdmissionProfile.City = dto.City ?? "";
            account.AdmissionProfile.District = dto.District ?? "";
            account.AdmissionProfile.StreetName = dto.StreetName ?? "";
            account.AdmissionProfile.BuildingNo = dto.BuildingNo ?? "";
            account.AdmissionProfile.ParentPhoneNumber = dto.ParentPhoneNumber ?? "";
            account.AdmissionProfile.PreviousSchoolType = dto.PreviousSchoolType ?? "";

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
            throw new InvalidOperationException("Student admission profile not found");
        }

        await _db.SaveChangesAsync();
    }

    public async Task<string> UploadStudentDocumentAsync(string nationalId, string documentType, IFormFile file, string webRootPath)
    {
        var account = await GetStudentByNationalIdAsync(nationalId);
        if (account == null)
            throw new InvalidOperationException("Student not found");

        if (account.AdmissionProfile == null)
            throw new InvalidOperationException("Student admission profile not found");

        // Validate file
        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".pdf" };
        var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!allowedExtensions.Contains(fileExtension))
            throw new ArgumentException("Invalid file type. Only JPG, PNG, and PDF files are allowed.");

        if (file.Length > 10 * 1024 * 1024)
            throw new ArgumentException("File size too large. Maximum size is 10MB.");

        // Setup directory
        var uploadsPath = Path.Combine(webRootPath, "uploads", "documents");
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

        await _db.SaveChangesAsync();

        return relativePath;
    }

    public async Task<bool> StudentExistsAsync(string nationalId)
    {
        return await _db.Accounts.AnyAsync(a => a.NationalId == nationalId);
    }

    public async Task<List<object>> GetAllStudentsAsync()
    {
        return await _db.Accounts
            .Include(a => a.Role)
            .Where(a => a.Role.RoleName == "Student")
            .Select(a => new
            {
                id = a.Id,
                fullName = a.FullNameEn,
                nationalId = a.NationalId
            })
            .Cast<object>()
            .ToListAsync();
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

    public async Task SaveChangesAsync()
    {
        await _db.SaveChangesAsync();
    }

    public async Task<bool> IsAdmissionProfileCompleteAsync(string nationalId)
    {
        var account = await _db.Accounts
            .Include(a => a.AdmissionProfile)
            .FirstOrDefaultAsync(a => a.NationalId == nationalId);

        if (account?.AdmissionProfile == null)
            return false;

        // Check if the four mandatory fields are filled
        return !string.IsNullOrWhiteSpace(account.AdmissionProfile.PhoneNumber) &&
               !string.IsNullOrWhiteSpace(account.AdmissionProfile.ParentPhoneNumber) &&
               !string.IsNullOrWhiteSpace(account.AdmissionProfile.BuildingNo) &&
               !string.IsNullOrWhiteSpace(account.AdmissionProfile.ParentOccupation);
    }

    public async Task<bool> AreExamQuestionsAvailableAsync()
    {
        // Check if there are any exam questions in the database
        return await _db.ExamQuestions.AnyAsync();
    }
}
