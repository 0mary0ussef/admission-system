using Microsoft.AspNetCore.Mvc;
using SchoolAdmission.DTOs;
using SchoolAdmission.Models;
using SchoolAdmission.Data;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class TeacherController : ControllerBase
{
    private readonly SchoolAdmissionDbContext db;

    public TeacherController(SchoolAdmissionDbContext context)
    {
        db = context;
    }

    [HttpPost("register-student")]
    public async Task<IActionResult> RegisterStudent([FromBody] StudentRegisterDTO dto)
    {
        // Check if student already exists in Account table
        var accountExists = await db.Accounts.AnyAsync(a => a.NationalId == dto.NationalId);
        if (accountExists)
            return BadRequest("Student with this National ID already exists.");

        // Validate MinistryExamPercentage if acceptance letter is received
        if (dto.IsAcceptanceLetterReceived && !dto.MinistryExamPercentage.HasValue)
            return BadRequest("Ministry exam percentage is required when acceptance letter is received.");

        // Validate MinistryExamPercentage range
        if (dto.MinistryExamPercentage.HasValue && 
            (dto.MinistryExamPercentage < 0 || dto.MinistryExamPercentage > 100))
            return BadRequest("Ministry exam percentage must be between 0 and 100.");

        // Get Student AccountType
        var studentAccountType = await db.AccountTypes.FirstOrDefaultAsync(at => at.AccountTypeName == "Student");
        if (studentAccountType == null)
            return BadRequest("Student account type not found.");

        // Create Account record
        var account = new Account
        {
            NationalId = dto.NationalId,
            Email = $"{dto.NationalId}@student.com", // Generate email from NationalId
            FullNameEn = dto.StudentName,
            FullNameAr = dto.StudentName, // You might want to add Arabic name field to DTO
            AccountTypeId = studentAccountType.Id,
            IsActive = true,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NationalId) // Default password is NationalId
        };

        db.Accounts.Add(account);
        await db.SaveChangesAsync(); // Save to get the AccountId

        // Create AdmissionProfile
        var admissionProfile = new AdmissionProfile
        {
            AccountId = account.Id,
            StudentName = dto.StudentName,
            DateOfBirth = DateOnly.FromDateTime(dto.DateOfBirth),
            MathScore = (decimal?)dto.MathScore,
            EnglishScore = (decimal?)dto.EnglishScore,
            ThirdPrepScore = (decimal?)dto.FinalYearScore, // Map FinalYearScore to ThirdPrepScore
            MinistryExamPercentage = dto.MinistryExamPercentage ?? 0.0, // Use 0.0 if null
            IsAcceptanceLetterReceived = dto.IsAcceptanceLetterReceived
        };

        db.AdmissionProfiles.Add(admissionProfile);

        // Create StudentExtension
        var studentExtension = new StudentExtension
        {
            AccountId = account.Id,
            IsLeader = false,
            ClassId = null
        };

        db.StudentExtensions.Add(studentExtension);

        // Create Login record with default password (NationalId)
        var login = new Login
        {
            AccountId = account.Id,
            Email = account.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NationalId) // Default password is NationalId
        };

        db.Logins.Add(login);

        await db.SaveChangesAsync();
        
        return Ok(new { 
            message = "Student registered successfully",
            accountId = account.Id,
            email = account.Email,
            defaultPassword = dto.NationalId,
            studentName = dto.StudentName,
            isAcceptanceLetterReceived = dto.IsAcceptanceLetterReceived,
            ministryExamPercentage = dto.MinistryExamPercentage
        });
    }
}
