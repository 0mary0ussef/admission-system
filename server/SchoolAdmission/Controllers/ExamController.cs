using Microsoft.AspNetCore.Mvc;
using SchoolAdmission.Models;
using SchoolAdmission.Data;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class ExamController : ControllerBase
{
    private readonly SchoolAdmissionDbContext db;

    public ExamController(SchoolAdmissionDbContext context)
    {
        db = context;
    }

    [HttpGet("student/{nationalId}")]
    public async Task<IActionResult> GetExamResults(string nationalId)
    {
        var student = await db.Students.FirstOrDefaultAsync(s => s.NationalId == nationalId);
        if (student == null)
            return NotFound("Student not found");

        var exam = await db.Exams.FirstOrDefaultAsync(e => e.StudentId == student.Id);
        if (exam == null)
            return NotFound("Exam results not found");

        return Ok(exam);
    }
}
