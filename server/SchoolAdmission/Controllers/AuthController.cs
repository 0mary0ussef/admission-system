using Microsoft.AspNetCore.Mvc;
using SchoolAdmission.DTOs;
using SchoolAdmission.Data;
using SchoolAdmission.Services;
using SchoolAdmission.Models;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly SchoolAdmissionDbContext db;
    private readonly IConfiguration config;

    public AuthController(SchoolAdmissionDbContext context, IConfiguration configuration)
    {
        db = context;
        config = configuration;
    }

    [HttpPost("teacher/login")]
    public async Task<IActionResult> TeacherLogin([FromBody] TeacherLoginDTO teacher)
    {
        if (string.IsNullOrEmpty(teacher.Email) || string.IsNullOrEmpty(teacher.Password))
            return BadRequest("Email and password are required");

        var login = await db.Logins
            .Include(l => l.Account)
            .ThenInclude(a => a.AccountType)
            .FirstOrDefaultAsync(l => l.Email == teacher.Email);

        if (login == null || !BCrypt.Net.BCrypt.Verify(teacher.Password, login.PasswordHash))
            return BadRequest("Invalid email or password");

        // Check if it's a teacher account
        if (login.Account.AccountType.AccountTypeName != "Teacher")
            return BadRequest("Invalid account type");

        var token = CreateToken(login.Account.Email, login.Account.AccountType.AccountTypeName);
        return Ok(new { token, role = login.Account.AccountType.AccountTypeName });
    }

    [HttpPost("admin/login")]
    public async Task<IActionResult> AdminLogin([FromBody] AdminLoginDTO admin)
    {
        if (string.IsNullOrEmpty(admin.Email) || string.IsNullOrEmpty(admin.Password))
            return BadRequest("Email and password are required");

        var login = await db.Logins
            .Include(l => l.Account)
            .ThenInclude(a => a.AccountType)
            .FirstOrDefaultAsync(l => l.Email == admin.Email);

        if (login == null || !BCrypt.Net.BCrypt.Verify(admin.Password, login.PasswordHash))
            return BadRequest("Invalid email or password");

        // Check if it's an admin, superadmin, or staffadmin account
        if (login.Account.AccountType.AccountTypeName != "Admin" && 
            login.Account.AccountType.AccountTypeName != "SuperAdmin" &&
            login.Account.AccountType.AccountTypeName != "StaffAdmin")
            return BadRequest("Invalid account type");

        var token = CreateToken(login.Account.Email, login.Account.AccountType.AccountTypeName);
        return Ok(new { token, role = login.Account.AccountType.AccountTypeName });
    }

    // Account Creation Endpoints
    [HttpPost("create-teacher")]
    public async Task<IActionResult> CreateTeacher([FromBody] CreateTeacherDTO dto)
    {
        if (string.IsNullOrEmpty(dto.Email) || string.IsNullOrEmpty(dto.Password))
            return BadRequest("Email and password are required");

        // Check if email already exists
        if (await db.Accounts.AnyAsync(a => a.Email == dto.Email))
            return BadRequest("Email already exists");

        // Get Teacher AccountType
        var teacherAccountType = await db.AccountTypes.FirstOrDefaultAsync(at => at.AccountTypeName == "Teacher");
        if (teacherAccountType == null)
            return BadRequest("Teacher account type not found");

        // Create Account
        var account = new Account
        {
            NationalId = GenerateRandomNationalId(), // Generate random 14-digit number
            Email = dto.Email,
            FullNameEn = dto.FullNameEn,
            FullNameAr = dto.FullNameAr,
            AccountTypeId = teacherAccountType.Id,
            IsActive = true,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password)
        };

        db.Accounts.Add(account);
        await db.SaveChangesAsync();

        // Create Login
        var login = new Login
        {
            AccountId = account.Id,
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password)
        };

        db.Logins.Add(login);
        await db.SaveChangesAsync();

        return Ok(new { message = "Teacher account created successfully", accountId = account.Id });
    }

    [HttpPost("create-admin")]
    public async Task<IActionResult> CreateAdmin([FromBody] CreateAdminDTO dto)
    {
        if (string.IsNullOrEmpty(dto.Email) || string.IsNullOrEmpty(dto.Password))
            return BadRequest("Email and password are required");

        // Check if email already exists
        if (await db.Accounts.AnyAsync(a => a.Email == dto.Email))
            return BadRequest("Email already exists");

        // Get Admin AccountType
        var adminAccountType = await db.AccountTypes.FirstOrDefaultAsync(at => at.AccountTypeName == "Admin");
        if (adminAccountType == null)
            return BadRequest("Admin account type not found");

        // Create Account
        var account = new Account
        {
            NationalId = GenerateRandomNationalId(), // Generate random 14-digit number
            Email = dto.Email,
            FullNameEn = dto.FullNameEn,
            FullNameAr = dto.FullNameAr,
            AccountTypeId = adminAccountType.Id,
            IsActive = true,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password)
        };

        db.Accounts.Add(account);
        await db.SaveChangesAsync();

        // Create Login
        var login = new Login
        {
            AccountId = account.Id,
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password)
        };

        db.Logins.Add(login);
        await db.SaveChangesAsync();

        return Ok(new { message = "Admin account created successfully", accountId = account.Id });
    }

    [HttpPost("create-superadmin")]
    public async Task<IActionResult> CreateSuperAdmin([FromBody] CreateSuperAdminDTO dto)
    {
        if (string.IsNullOrEmpty(dto.Email) || string.IsNullOrEmpty(dto.Password))
            return BadRequest("Email and password are required");

        // Check if email already exists
        if (await db.Accounts.AnyAsync(a => a.Email == dto.Email))
            return BadRequest("Email already exists");

        // Get SuperAdmin AccountType
        var superAdminAccountType = await db.AccountTypes.FirstOrDefaultAsync(at => at.AccountTypeName == "SuperAdmin");
        if (superAdminAccountType == null)
            return BadRequest("SuperAdmin account type not found");

        // Create Account
        var account = new Account
        {
            NationalId = GenerateRandomNationalId(), // Generate random 14-digit number
            Email = dto.Email,
            FullNameEn = dto.FullNameEn,
            FullNameAr = dto.FullNameAr,
            AccountTypeId = superAdminAccountType.Id,
            IsActive = true,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password)
        };

        db.Accounts.Add(account);
        await db.SaveChangesAsync();

        // Create Login
        var login = new Login
        {
            AccountId = account.Id,
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password)
        };

        db.Logins.Add(login);
        await db.SaveChangesAsync();

        return Ok(new { message = "SuperAdmin account created successfully", accountId = account.Id });
    }

    [HttpPost("create-staffadmin")]
    public async Task<IActionResult> CreateStaffAdmin([FromBody] CreateStaffAdminDTO dto)
    {
        if (string.IsNullOrEmpty(dto.Email) || string.IsNullOrEmpty(dto.Password))
            return BadRequest("Email and password are required");

        // Check if email already exists
        if (await db.Accounts.AnyAsync(a => a.Email == dto.Email))
            return BadRequest("Email already exists");

        // Get StaffAdmin AccountType
        var staffAdminAccountType = await db.AccountTypes.FirstOrDefaultAsync(at => at.AccountTypeName == "StaffAdmin");
        if (staffAdminAccountType == null)
            return BadRequest("StaffAdmin account type not found");

        // Create Account
        var account = new Account
        {
            NationalId = GenerateRandomNationalId(), // Generate random 14-digit number
            Email = dto.Email,
            FullNameEn = dto.FullNameEn,
            FullNameAr = dto.FullNameAr,
            AccountTypeId = staffAdminAccountType.Id,
            IsActive = true,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password)
        };

        db.Accounts.Add(account);
        await db.SaveChangesAsync();

        // Create Login
        var login = new Login
        {
            AccountId = account.Id,
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password)
        };

        db.Logins.Add(login);
        await db.SaveChangesAsync();

        return Ok(new { message = "StaffAdmin account created successfully", accountId = account.Id });
    }

    private string CreateToken(string email, string role)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["Jwt:Key"]));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, email),
            new Claim(ClaimTypes.Role, role),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: config["Jwt:Issuer"],
            audience: config["Jwt:Issuer"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(24),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private string GenerateRandomNationalId()
    {
        var random = new Random();
        var nationalId = "";
        
        // Generate 14 random digits
        for (int i = 0; i < 14; i++)
        {
            nationalId += random.Next(0, 10).ToString();
        }
        
        return nationalId;
    }
}
