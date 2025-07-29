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
        var studentExists = await db.Students.AnyAsync(s => s.NationalId == dto.NationalId);
        if (studentExists)
            return BadRequest("Student with this National ID already exists.");

        var student = new Student
        {
            FullName = dto.FullName,
            NationalId = dto.NationalId,
            MathScore = dto.MathScore,
            EnglishScore = dto.EnglishScore,
            FinalYearScore = dto.FinalYearScore,
            MinistryExamPercentage = dto.MinistryExamPercentage
        };

        db.Students.Add(student);
        await db.SaveChangesAsync();
        
        return Ok("Student registered successfully");
    }
}
