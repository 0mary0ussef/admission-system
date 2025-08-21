using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using SchoolAdmission.DTOs;
using SchoolAdmission.Services;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AdminController : ControllerBase
{
    private readonly IAdminService _adminService;

    public AdminController(IAdminService adminService)
    {
        _adminService = adminService;
    }

    [HttpGet("students")]
    public async Task<IActionResult> GetAllStudents()
    {
        try
        {
            var userEmail = await _adminService.GetCurrentAdminEmailAsync(User);
            if (string.IsNullOrEmpty(userEmail))
                return Unauthorized("Admin not found or not authorized. Please log in again.");

            var adminAccount = await _adminService.GetAccountByEmailAsync(userEmail);
            if (adminAccount == null)
                return Unauthorized("Admin not found or not authorized. Please log in again.");

            List<dynamic> result;
            if (adminAccount.Role.RoleName == "Admin")
            {
                result = await _adminService.GetStudentsForAdminAsync(userEmail);
            }
            else if (adminAccount.Role.RoleName == "SuperAdmin")
            {
                result = await _adminService.GetStudentsForSuperAdminAsync(userEmail);
            }
            else
            {
                return Forbid("You do not have permission to view student information.");
            }

            if (result.Count == 0)
                return NotFound("No students found in the system.");

            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse.ErrorResult("An error occurred while retrieving students", ex.Message));
        }
    }



    [HttpGet("students/filter")]
    public async Task<IActionResult> FilterStudents([FromQuery] string? name, [FromQuery] string? nationalId)
    {
        try
        {
            var userEmail = await _adminService.GetCurrentAdminEmailAsync(User);
            if (string.IsNullOrEmpty(userEmail))
                return Unauthorized("Admin not found or not authorized. Please log in again.");

            var adminAccount = await _adminService.GetAccountByEmailAsync(userEmail);
            if (adminAccount == null)
                return Unauthorized("Admin not found or not authorized. Please log in again.");

            if (adminAccount.Role.RoleName != "SuperAdmin")
                return Forbid("Only superadmins can filter students.");

            var result = await _adminService.FilterStudentsAsync(name, nationalId);
            if (result.Count == 0)
                return NotFound("No students match the provided filter criteria.");

            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse.ErrorResult("An error occurred while filtering students", ex.Message));
        }
    }


    [HttpPost("student/{studentId}/my-interview-score")]
    public async Task<IActionResult> SetMyInterviewScore(long studentId, [FromBody] double scoreValue)
    {
        try
        {
            var userEmail = await _adminService.GetCurrentAdminEmailAsync(User);
            if (string.IsNullOrEmpty(userEmail))
                return Unauthorized("Admin not found or not authorized. Please log in again.");

            var adminAccount = await _adminService.GetAccountByEmailAsync(userEmail);
            if (adminAccount == null)
                return Unauthorized("Admin not found or not authorized. Please log in again.");

            if (adminAccount.Role.RoleName != "Admin")
                return Forbid("Only admins can set or edit their own interview score.");

            await _adminService.SetInterviewScoreAsync(studentId, adminAccount.Id, scoreValue);

            return Ok(ApiResponse.SuccessResult("Interview score submitted successfully."));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse.ErrorResult("An error occurred while submitting your interview score", ex.Message));
        }
    }


    [HttpPut("student/{studentId}/status")]
    public async Task<IActionResult> UpdateStudentStatus(long studentId, [FromBody] UpdateStudentStatusDTO dto)
    {
        try
        {
            var userEmail = await _adminService.GetCurrentAdminEmailAsync(User);
            if (string.IsNullOrEmpty(userEmail))
                return Unauthorized("Admin not found or not authorized. Please log in again.");

            var adminAccount = await _adminService.GetAccountByEmailAsync(userEmail);
            if (adminAccount == null)
                return Unauthorized("Admin not found or not authorized. Please log in again.");

            if (adminAccount.Role.RoleName != "SuperAdmin")
                return Forbid("Only superadmins can update student status.");

            await _adminService.UpdateStudentStatusAsync(studentId, dto.Status);

            return Ok(ApiResponse.SuccessResult($"Student status updated successfully to {dto.Status}."));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse.ErrorResult("An error occurred while updating student status", ex.Message));
        }
    }


}
