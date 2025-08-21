using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using SchoolAdmission.DTOs;
using SchoolAdmission.Services;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TeacherController : ControllerBase
{
    private readonly IAccountService _accountService;
    private readonly IStudentService _studentService;

    public TeacherController(IAccountService accountService, IStudentService studentService)
    {
        _accountService = accountService;
        _studentService = studentService;
    }

    [HttpPost("register-student")]
    public async Task<IActionResult> RegisterStudent([FromBody] StudentRegisterDTO dto)
    {
        try
        {
            // Check if student already exists
            if (await _studentService.StudentExistsAsync(dto.NationalId))
                return BadRequest("Student with this National ID already exists.");

            // Validate MinistryExamPercentage if acceptance letter is received
            if (dto.IsAcceptanceLetterReceived && dto.MinistryExamPercentage == 0)
                return BadRequest("Ministry exam percentage is required when acceptance letter is received.");

            // Validate MinistryExamPercentage range
            if (dto.MinistryExamPercentage < 0 || dto.MinistryExamPercentage > 100)
                return BadRequest("Ministry exam percentage must be between 0 and 100.");

            var account = await _accountService.RegisterStudentAsync(dto);

            return Ok(ApiResponse.SuccessResult(new
            {
                accountId = account.Id,
                email = account.Email,
                defaultPassword = dto.NationalId,
                studentName = dto.StudentName,
                isAcceptanceLetterReceived = dto.IsAcceptanceLetterReceived,
                ministryExamPercentage = dto.MinistryExamPercentage
            }, "Student registered successfully"));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse.ErrorResult("An error occurred while registering student", ex.Message));
        }
    }

    [HttpGet("students")]
    public async Task<IActionResult> GetStudents()
    {
        try
        {
            var teacherEmail = User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value;
            if (string.IsNullOrEmpty(teacherEmail))
                return Unauthorized("Teacher not authenticated");

            if (!await _accountService.IsTeacherAsync(teacherEmail))
                return Unauthorized("Teacher not found or invalid account type");

            var students = await _studentService.GetAllStudentsAsync();

            return Ok(students);
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse.ErrorResult("An error occurred while retrieving students", ex.Message));
        }
    }
}
