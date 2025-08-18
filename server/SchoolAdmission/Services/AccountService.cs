using SchoolAdmission.DTOs;
using SchoolAdmission.Models;
using SchoolAdmission.Data;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Security.Claims;

namespace SchoolAdmission.Services;

public class AccountService : IAccountService
{
    private readonly SchoolAdmissionDbContext _db;
    private readonly IConfiguration _config;

    public AccountService(SchoolAdmissionDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    public async Task<Account> CreateTeacherAccountAsync(CreateTeacherDTO dto)
    {
        return await CreateAccountAsync(dto, "Teacher");
    }

    public async Task<Account> CreateAdminAccountAsync(CreateAdminDTO dto)
    {
        return await CreateAccountAsync(dto, "Admin");
    }

    public async Task<Account> CreateSuperAdminAccountAsync(CreateSuperAdminDTO dto)
    {
        return await CreateAccountAsync(dto, "SuperAdmin");
    }

    public async Task<Account> CreateStaffAdminAccountAsync(CreateStaffAdminDTO dto)
    {
        return await CreateAccountAsync(dto, "StaffAdmin");
    }

    public async Task<Account> RegisterStudentAsync(StudentRegisterDTO dto)
    {
        var accountType = await _db.AccountTypes.FirstOrDefaultAsync(at => at.AccountTypeName == "Student");
        if (accountType == null)
            throw new InvalidOperationException("Student account type not found");

        var account = new Account
        {
            NationalId = dto.NationalId,
            Email = $"{dto.NationalId}@student.com",
            FullNameEn = dto.StudentName,
            FullNameAr = dto.StudentName,
            AccountTypeId = accountType.Id,
            IsActive = true,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NationalId)
        };

        _db.Accounts.Add(account);
        await _db.SaveChangesAsync();

        // Create AdmissionProfile with the provided data
        var admissionProfile = new AdmissionProfile
        {
            AccountId = account.Id,
            DateOfBirth = DateOnly.Parse(dto.DateOfBirth),
            MathScore = dto.MathScore,
            EnglishScore = dto.EnglishScore,
            ThirdPrepScore = dto.FinalYearScore,
            IsAcceptanceLetterReceived = dto.IsAcceptanceLetterReceived,
            MinistryExamPercentage = dto.MinistryExamPercentage,
            StatusId = 1 // Default status (Pending)
        };

        _db.AdmissionProfiles.Add(admissionProfile);
        await _db.SaveChangesAsync();

        return account;
    }

    private async Task<Account> CreateAccountAsync(CreateTeacherDTO dto, string accountTypeName)
    {
        if (await _db.Accounts.AnyAsync(a => a.Email == dto.Email))
            throw new InvalidOperationException("Email already exists");

        var accountType = await _db.AccountTypes.FirstOrDefaultAsync(at => at.AccountTypeName == accountTypeName);
        if (accountType == null)
            throw new InvalidOperationException($"{accountTypeName} account type not found");

        var account = new Account
        {
            NationalId = GenerateRandomNationalId(),
            Email = dto.Email,
            FullNameEn = dto.FullNameEn,
            FullNameAr = dto.FullNameAr,
            AccountTypeId = accountType.Id,
            IsActive = true,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password)
        };

        _db.Accounts.Add(account);
        await _db.SaveChangesAsync();

        // Create Login record
        var login = new Login
        {
            AccountId = account.Id,
            Email = dto.Email,
            PasswordHash = account.PasswordHash
        };

        _db.Logins.Add(login);
        await _db.SaveChangesAsync();

        return account;
    }

    private async Task<Account> CreateAccountAsync(CreateAdminDTO dto, string accountTypeName)
    {
        if (await _db.Accounts.AnyAsync(a => a.Email == dto.Email))
            throw new InvalidOperationException("Email already exists");

        var accountType = await _db.AccountTypes.FirstOrDefaultAsync(at => at.AccountTypeName == accountTypeName);
        if (accountType == null)
            throw new InvalidOperationException($"{accountTypeName} account type not found");

        var account = new Account
        {
            NationalId = GenerateRandomNationalId(),
            Email = dto.Email,
            FullNameEn = dto.FullNameEn,
            FullNameAr = dto.FullNameAr,
            AccountTypeId = accountType.Id,
            IsActive = true,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password)
        };

        _db.Accounts.Add(account);
        await _db.SaveChangesAsync();

        // Create Login record
        var login = new Login
        {
            AccountId = account.Id,
            Email = dto.Email,
            PasswordHash = account.PasswordHash
        };

        _db.Logins.Add(login);
        await _db.SaveChangesAsync();

        return account;
    }

    private async Task<Account> CreateAccountAsync(CreateSuperAdminDTO dto, string accountTypeName)
    {
        if (await _db.Accounts.AnyAsync(a => a.Email == dto.Email))
            throw new InvalidOperationException("Email already exists");

        var accountType = await _db.AccountTypes.FirstOrDefaultAsync(at => at.AccountTypeName == accountTypeName);
        if (accountType == null)
            throw new InvalidOperationException($"{accountTypeName} account type not found");

        var account = new Account
        {
            NationalId = GenerateRandomNationalId(),
            Email = dto.Email,
            FullNameEn = dto.FullNameEn,
            FullNameAr = dto.FullNameAr,
            AccountTypeId = accountType.Id,
            IsActive = true,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password)
        };

        _db.Accounts.Add(account);
        await _db.SaveChangesAsync();

        // Create Login record
        var login = new Login
        {
            AccountId = account.Id,
            Email = dto.Email,
            PasswordHash = account.PasswordHash
        };

        _db.Logins.Add(login);
        await _db.SaveChangesAsync();

        return account;
    }

    private async Task<Account> CreateAccountAsync(CreateStaffAdminDTO dto, string accountTypeName)
    {
        if (await _db.Accounts.AnyAsync(a => a.Email == dto.Email))
            throw new InvalidOperationException("Email already exists");

        var accountType = await _db.AccountTypes.FirstOrDefaultAsync(at => at.AccountTypeName == accountTypeName);
        if (accountType == null)
            throw new InvalidOperationException($"{accountTypeName} account type not found");

        var account = new Account
        {
            NationalId = GenerateRandomNationalId(),
            Email = dto.Email,
            FullNameEn = dto.FullNameEn,
            FullNameAr = dto.FullNameAr,
            AccountTypeId = accountType.Id,
            IsActive = true,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password)
        };

        _db.Accounts.Add(account);
        await _db.SaveChangesAsync();

        // Create Login record
        var login = new Login
        {
            AccountId = account.Id,
            Email = dto.Email,
            PasswordHash = account.PasswordHash
        };

        _db.Logins.Add(login);
        await _db.SaveChangesAsync();

        return account;
    }

    public async Task<bool> ValidateCredentialsAsync(string email, string password)
    {
        var login = await _db.Logins
            .Include(l => l.Account)
            .ThenInclude(a => a.AccountType)
            .FirstOrDefaultAsync(l => l.Email == email);

        return login != null && BCrypt.Net.BCrypt.Verify(password, login.PasswordHash);
    }

    public async Task<Account?> GetAccountByEmailAsync(string email)
    {
        return await _db.Accounts
            .Include(a => a.AccountType)
            .FirstOrDefaultAsync(a => a.Email == email);
    }

    public async Task<Account?> GetAccountByNationalIdAsync(string nationalId)
    {
        return await _db.Accounts
            .Include(a => a.AdmissionProfile)
            .FirstOrDefaultAsync(a => a.NationalId == nationalId);
    }

    public async Task<string> GenerateJwtTokenAsync(Account account)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, account.Email),
            new Claim(ClaimTypes.Name, account.Email),
            new Claim(ClaimTypes.Role, account.AccountType.AccountTypeName),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Issuer"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(24),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public async Task<bool> IsSuperAdminAsync(string email)
    {
        var account = await GetAccountByEmailAsync(email);
        return account?.AccountType?.AccountTypeName == "SuperAdmin";
    }

    public async Task<bool> IsAdminAsync(string email)
    {
        var account = await GetAccountByEmailAsync(email);
        return account?.AccountType?.AccountTypeName == "Admin";
    }

    public async Task<bool> IsTeacherAsync(string email)
    {
        var account = await GetAccountByEmailAsync(email);
        return account?.AccountType?.AccountTypeName == "Teacher";
    }

    public async Task<bool> IsStaffAdminAsync(string email)
    {
        var account = await GetAccountByEmailAsync(email);
        return account?.AccountType?.AccountTypeName == "StaffAdmin";
    }

    private string GenerateRandomNationalId()
    {
        var random = new Random();
        var nationalId = "";
        
        for (int i = 0; i < 14; i++)
        {
            nationalId += random.Next(0, 10).ToString();
        }
        
        return nationalId;
    }
}
