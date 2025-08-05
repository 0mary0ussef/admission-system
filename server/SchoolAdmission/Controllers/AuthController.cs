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

        // Check if it's an admin or superadmin account
        if (login.Account.AccountType.AccountTypeName != "Admin" && 
            login.Account.AccountType.AccountTypeName != "SuperAdmin")
            return BadRequest("Invalid account type");

        var token = CreateToken(login.Account.Email, login.Account.AccountType.AccountTypeName);
        return Ok(new { token, role = login.Account.AccountType.AccountTypeName });
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
}
