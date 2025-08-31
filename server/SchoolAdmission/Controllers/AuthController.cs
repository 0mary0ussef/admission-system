using Microsoft.AspNetCore.Mvc;
using SchoolAdmission.DTOs;
using SchoolAdmission.Services;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAccountService _accountService;

    public AuthController(IAccountService accountService)
    {
        _accountService = accountService;
    }

    [HttpPost("teacher/login")]
    public async Task<IActionResult> TeacherLogin([FromBody] TeacherLoginDTO teacher)
    {
        try
        {
            if (string.IsNullOrEmpty(teacher.Email) || string.IsNullOrEmpty(teacher.Password))
                return BadRequest("Email and password are required");

            if (!await _accountService.ValidateCredentialsAsync(teacher.Email, teacher.Password))
                return BadRequest("Invalid email or password");

            var account = await _accountService.GetAccountByEmailAsync(teacher.Email);
            if (account == null)
                return BadRequest("Account not found");

            if (!await _accountService.IsTeacherAsync(teacher.Email))
                return BadRequest("Invalid account type");

            var token = await _accountService.GenerateJwtTokenAsync(account);
            return Ok(new { token, role = account.Role.RoleName });
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse.ErrorResult("An error occurred during login", ex.Message));
        }
    }

    [HttpPost("admin/login")]
    public async Task<IActionResult> AdminLogin([FromBody] AdminLoginDTO admin)
    {
        try
        {
            if (string.IsNullOrEmpty(admin.Email) || string.IsNullOrEmpty(admin.Password))
                return BadRequest("Email and password are required");

            if (!await _accountService.ValidateCredentialsAsync(admin.Email, admin.Password))
                return BadRequest("Invalid email or password");

            var account = await _accountService.GetAccountByEmailAsync(admin.Email);
            if (account == null)
                return BadRequest("Account not found");

            if (!await _accountService.IsAdminAsync(admin.Email) && !await _accountService.IsSuperAdminAsync(admin.Email) && !await _accountService.IsStaffAdminAsync(admin.Email))
                return BadRequest("Invalid account type");

            var token = await _accountService.GenerateJwtTokenAsync(account);
            return Ok(new { token, role = account.Role.RoleName });
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse.ErrorResult("An error occurred during login", ex.Message));
        }
    }

    
    [HttpPost("create-teacher")]
    public async Task<IActionResult> CreateTeacher([FromBody] CreateTeacherDTO dto)
    {
        try
        {
            if (string.IsNullOrEmpty(dto.Email) || string.IsNullOrEmpty(dto.Password))
                return BadRequest("Email and password are required");

            var account = await _accountService.CreateTeacherAccountAsync(dto);
            return Ok(ApiResponse.SuccessResult(new { accountId = account.Id }, "Teacher account created successfully"));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse.ErrorResult("An error occurred while creating teacher account", ex.Message));
        }
    }

    [HttpPost("create-admin")]
    public async Task<IActionResult> CreateAdmin([FromBody] CreateAdminDTO dto)
    {
        try
        {
            if (string.IsNullOrEmpty(dto.Email) || string.IsNullOrEmpty(dto.Password))
                return BadRequest("Email and password are required");

            var account = await _accountService.CreateAdminAccountAsync(dto);
            return Ok(ApiResponse.SuccessResult(new { accountId = account.Id }, "Admin account created successfully"));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse.ErrorResult("An error occurred while creating admin account", ex.Message));
        }
    }

    [HttpPost("create-superadmin")]
    public async Task<IActionResult> CreateSuperAdmin([FromBody] CreateSuperAdminDTO dto)
    {
        try
        {
            if (string.IsNullOrEmpty(dto.Email) || string.IsNullOrEmpty(dto.Password))
                return BadRequest("Email and password are required");

            var account = await _accountService.CreateSuperAdminAccountAsync(dto);
            return Ok(ApiResponse.SuccessResult(new { accountId = account.Id }, "SuperAdmin account created successfully"));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse.ErrorResult("An error occurred while creating superadmin account", ex.Message));
        }
    }

    [HttpPost("create-staffadmin")]
    public async Task<IActionResult> CreateStaffAdmin([FromBody] CreateStaffAdminDTO dto)
    {
        try
        {
            if (string.IsNullOrEmpty(dto.Email) || string.IsNullOrEmpty(dto.Password))
                return BadRequest("Email and password are required");

            var account = await _accountService.CreateStaffAdminAccountAsync(dto);
            return Ok(ApiResponse.SuccessResult(new { accountId = account.Id }, "StaffAdmin account created successfully"));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse.ErrorResult("An error occurred while creating staff admin account", ex.Message));
        }
    }
    




}
