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
        var roleType = await _db.Roles.FirstOrDefaultAsync(at => at.RoleName == "PendingStudent" && at.BusinessEntity == "Admission");
        if (roleType == null)
            throw new InvalidOperationException("Student account type not found");

        var account = new Account
        {
            NationalId = dto.NationalId,
            Email = $"{dto.NationalId}@student.com",
            FullNameEn = dto.StudentName,
            FullNameAr = dto.StudentName,
            RoleId = roleType.Id,
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

    private async Task<Account> CreateAccountAsync(CreateTeacherDTO dto, string roleName)
    {
        if (await _db.Accounts.AnyAsync(a => a.Email == dto.Email))
            throw new InvalidOperationException("Email already exists");

        var roleType = await _db.Roles.FirstOrDefaultAsync(at => at.RoleName == roleName && at.BusinessEntity == "Admission");
        if (roleType == null)
            throw new InvalidOperationException($"{roleName} account type not found");

        var account = new Account
        {
            NationalId = GenerateRandomNationalId(),
            Email = dto.Email,
            FullNameEn = dto.FullNameEn,
            FullNameAr = dto.FullNameAr,
            RoleId = roleType.Id,
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

    private async Task<Account> CreateAccountAsync(CreateAdminDTO dto, string roleName)
    {
        if (await _db.Accounts.AnyAsync(a => a.Email == dto.Email))
            throw new InvalidOperationException("Email already exists");

        var roleType = await _db.Roles.FirstOrDefaultAsync(at => at.RoleName == roleName && at.BusinessEntity == "Admission");
        if (roleType == null)
            throw new InvalidOperationException($"{roleName} account type not found");

        var account = new Account
        {
            NationalId = GenerateRandomNationalId(),
            Email = dto.Email,
            FullNameEn = dto.FullNameEn,
            FullNameAr = dto.FullNameAr,
            RoleId = roleType.Id,
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

    private async Task<Account> CreateAccountAsync(CreateSuperAdminDTO dto, string roleName)
    {
        if (await _db.Accounts.AnyAsync(a => a.Email == dto.Email))
            throw new InvalidOperationException("Email already exists");

        var roleType = await _db.Roles.FirstOrDefaultAsync(at => at.RoleName == roleName && at.BusinessEntity == "Admission");
        if (roleType == null)
            throw new InvalidOperationException($"{roleName} account type not found");

        var account = new Account
        {
            NationalId = GenerateRandomNationalId(),
            Email = dto.Email,
            FullNameEn = dto.FullNameEn,
            FullNameAr = dto.FullNameAr,
            RoleId = roleType.Id,
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

    private async Task<Account> CreateAccountAsync(CreateStaffAdminDTO dto, string roleName)
    {
        if (await _db.Accounts.AnyAsync(a => a.Email == dto.Email))
            throw new InvalidOperationException("Email already exists");

        var roleType = await _db.Roles.FirstOrDefaultAsync(at => at.RoleName == roleName && at.BusinessEntity == "Admission");
        if (roleType == null)
            throw new InvalidOperationException($"{roleName} account type not found");

        var account = new Account
        {
            NationalId = GenerateRandomNationalId(),
            Email = dto.Email,
            FullNameEn = dto.FullNameEn,
            FullNameAr = dto.FullNameAr,
            RoleId = roleType.Id,
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
            .ThenInclude(a => a.Role)
            .FirstOrDefaultAsync(l => l.Email == email && l.Account.Role.BusinessEntity == "Admission");

        return login != null && BCrypt.Net.BCrypt.Verify(password, login.PasswordHash);
    }


    public async Task<Account?> GetAccountByEmailAsync(string email)
    {
        return await _db.Accounts
            .Include(a => a.Role)
            .FirstOrDefaultAsync(a => a.Email == email && a.Role.BusinessEntity == "Admission");
    }



    public async Task<string> GenerateJwtTokenAsync(Account account)
    {
        var jwtKey = _config["Jwt:Key"] 
            ?? throw new InvalidOperationException("JWT Key is not configured.");
        var jwtIssuer = _config["Jwt:Issuer"] 
            ?? throw new InvalidOperationException("JWT Issuer is not configured.");
        var jwtAudience = _config["Jwt:Audience"] 
            ?? throw new InvalidOperationException("JWT Audience is not configured.");
        

        var tokenHandler = new JwtSecurityTokenHandler();
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, account.Email),
            }),

            Expires = DateTime.UtcNow.AddHours(24),
            SigningCredentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256),
            Issuer = jwtIssuer,
            Audience = jwtAudience
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);

        return tokenHandler.WriteToken(token);
    }

    

    public async Task<bool> IsSuperAdminAsync(string email)
    {
        var account = await GetAccountByEmailAsync(email);
        return account?.Role?.RoleName == "SuperAdmin" && account?.Role?.BusinessEntity == "Admission";
    }

    public async Task<bool> IsAdminAsync(string email)
    {
        var account = await GetAccountByEmailAsync(email);
        return account?.Role?.RoleName == "Admin" && account?.Role?.BusinessEntity == "Admission";
    }

    public async Task<bool> IsTeacherAsync(string email)
    {
        var account = await GetAccountByEmailAsync(email);
        return account?.Role?.RoleName == "Teacher" && account?.Role?.BusinessEntity == "Admission";
    }

    public async Task<bool> IsStaffAdminAsync(string email)
    {
        var account = await GetAccountByEmailAsync(email);
        return account?.Role?.RoleName == "StaffAdmin" && account?.Role?.BusinessEntity == "Admission";
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
