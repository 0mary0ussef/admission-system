using Microsoft.AspNetCore.Mvc;
using SchoolAdmission.DTOs;
using SchoolAdmission.Data;
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

        var teacherInDb = await db.Teachers.FirstOrDefaultAsync(t => t.Email == teacher.Email);
        if (teacherInDb == null || !BCrypt.Net.BCrypt.Verify(teacher.Password, teacherInDb.PasswordHash))
            return BadRequest("Invalid email or password");

        var token = CreateToken(teacherInDb.Email, "Teacher");
        return Ok(new { token });
    }

    [HttpPost("admin/login")]
    public async Task<IActionResult> AdminLogin([FromBody] AdminLoginDTO admin)
    {
        if (string.IsNullOrEmpty(admin.Email) || string.IsNullOrEmpty(admin.Password))
            return BadRequest("Email and password are required");

        var adminInDb = await db.Admins.FirstOrDefaultAsync(a => a.Email == admin.Email);
        if (adminInDb == null || !BCrypt.Net.BCrypt.Verify(admin.Password, adminInDb.PasswordHash))
            return BadRequest("Invalid email or password");

        var token = CreateToken(adminInDb.Email, "Admin");
        return Ok(new { token });
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
