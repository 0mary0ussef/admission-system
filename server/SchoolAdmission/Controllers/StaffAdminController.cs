using Microsoft.AspNetCore.Mvc;
using SchoolAdmission.Services;
using SchoolAdmission.DTOs;
using Microsoft.AspNetCore.Authorization;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "StaffAdmin")]
public class StaffAdminController : ControllerBase
{
    private readonly IStudentService _studentService;
    private readonly IAccountService _accountService;

    public StaffAdminController(IStudentService studentService, IAccountService accountService)
    {
        _studentService = studentService;
        _accountService = accountService;
    }

    [HttpGet("search-student/{nationalId}")]
    public async Task<IActionResult> SearchStudent(string nationalId)
    {
        try
        {
            var student = await _studentService.GetStudentByNationalIdAsync(nationalId);
            if (student == null)
            {
                return NotFound("No student found with this national ID.");
            }

            // Return only the editable fields for staff admin
            var studentData = new
            {
                nationalId = student.NationalId,
                studentName = student.FullNameEn,
                dateOfBirth = student.AdmissionProfile?.DateOfBirth,
                location = student.AdmissionProfile?.Location,
                phoneNumber = student.AdmissionProfile?.PhoneNumber,
                parentPhoneNumber = student.AdmissionProfile?.ParentPhoneNumber,
                mathScore = student.AdmissionProfile?.MathScore,
                englishScore = student.AdmissionProfile?.EnglishScore,
                thirdPrepScore = student.AdmissionProfile?.ThirdPrepScore,
                parentOccupation = student.AdmissionProfile?.ParentOccupation,
                city = student.AdmissionProfile?.City,
                district = student.AdmissionProfile?.District,
                streetName = student.AdmissionProfile?.StreetName,
                buildingNo = student.AdmissionProfile?.BuildingNo,
                previousSchoolType = student.AdmissionProfile?.PreviousSchoolType
            };

            return Ok(studentData);
        }
        catch (Exception ex)
        {
            return StatusCode(500, "An error occurred while searching for the student.");
        }
    }

    [HttpPut("update-student/{nationalId}")]
    public async Task<IActionResult> UpdateStudent(string nationalId, [FromBody] StaffAdminUpdateDTO dto)
    {
        try
        {
            var student = await _studentService.GetStudentByNationalIdAsync(nationalId);
            if (student == null)
            {
                return NotFound("No student found with this national ID.");
            }

            // Validate data before updating
            var validationErrors = ValidateStudentData(dto);
            if (validationErrors.Any())
            {
                return BadRequest(new { errors = validationErrors });
            }

            // Update only the allowed fields
            if (dto.StudentName != null)
                student.FullNameEn = dto.StudentName;

            if (student.AdmissionProfile != null)
            {
                if (dto.DateOfBirth.HasValue)
                    student.AdmissionProfile.DateOfBirth = DateOnly.FromDateTime(dto.DateOfBirth.Value);
                if (dto.Location != null)
                    student.AdmissionProfile.Location = dto.Location;
                if (dto.PhoneNumber != null)
                    student.AdmissionProfile.PhoneNumber = dto.PhoneNumber;
                if (dto.ParentPhoneNumber != null)
                    student.AdmissionProfile.ParentPhoneNumber = dto.ParentPhoneNumber;
                if (dto.MathScore.HasValue)
                    student.AdmissionProfile.MathScore = dto.MathScore.Value;
                if (dto.EnglishScore.HasValue)
                    student.AdmissionProfile.EnglishScore = dto.EnglishScore.Value;
                if (dto.ThirdPrepScore.HasValue)
                    student.AdmissionProfile.ThirdPrepScore = dto.ThirdPrepScore.Value;
                if (dto.ParentOccupation != null)
                    student.AdmissionProfile.ParentOccupation = dto.ParentOccupation;
                if (dto.City != null)
                    student.AdmissionProfile.City = dto.City;
                if (dto.District != null)
                    student.AdmissionProfile.District = dto.District;
                if (dto.StreetName != null)
                    student.AdmissionProfile.StreetName = dto.StreetName;
                if (dto.BuildingNo != null)
                    student.AdmissionProfile.BuildingNo = dto.BuildingNo;
                if (dto.PreviousSchoolType != null)
                    student.AdmissionProfile.PreviousSchoolType = dto.PreviousSchoolType;
            }

            await _studentService.SaveChangesAsync();
            return Ok("Student information updated successfully.");
        }
        catch (Exception ex)
        {
            return StatusCode(500, "An error occurred while updating the student information.");
        }
    }

    private List<string> ValidateStudentData(StaffAdminUpdateDTO dto)
    {
        var errors = new List<string>();

        // Validate Date of Birth (student must be under 18)
        if (dto.DateOfBirth.HasValue)
        {
            var today = DateTime.Today;
            var age = today.Year - dto.DateOfBirth.Value.Year;
            if (dto.DateOfBirth.Value.Date > today.AddYears(-age))
                age--;

            if (age >= 18)
            {
                errors.Add("The student's age cannot be over 18.");
            }
        }

        // Validate Math Score
        if (dto.MathScore.HasValue)
        {
            if (dto.MathScore.Value < 0 || dto.MathScore.Value > 60)
            {
                errors.Add("Math score must be between 0 and 60.");
            }
        }

        // Validate English Score
        if (dto.EnglishScore.HasValue)
        {
            if (dto.EnglishScore.Value < 0 || dto.EnglishScore.Value > 40)
            {
                errors.Add("English score must be between 0 and 40.");
            }
        }

        // Validate Third Prep Score
        if (dto.ThirdPrepScore.HasValue)
        {
            if (dto.ThirdPrepScore.Value < 0 || dto.ThirdPrepScore.Value > 280)
            {
                errors.Add("Third prep score must be between 0 and 280.");
            }
        }

        // Validate Phone Numbers (must be 11 digits)
        if (!string.IsNullOrEmpty(dto.PhoneNumber))
        {
            if (dto.PhoneNumber.Length != 11 || !dto.PhoneNumber.All(char.IsDigit))
            {
                errors.Add("Phone number must be exactly 11 digits.");
            }
        }

        if (!string.IsNullOrEmpty(dto.ParentPhoneNumber))
        {
            if (dto.ParentPhoneNumber.Length != 11 || !dto.ParentPhoneNumber.All(char.IsDigit))
            {
                errors.Add("Parent phone number must be exactly 11 digits.");
            }
        }

        // Validate required fields only if they are provided
        if (!string.IsNullOrWhiteSpace(dto.StudentName) && string.IsNullOrWhiteSpace(dto.StudentName.Trim()))
        {
            errors.Add("Student name cannot be empty.");
        }

        if (!string.IsNullOrWhiteSpace(dto.Location) && string.IsNullOrWhiteSpace(dto.Location.Trim()))
        {
            errors.Add("Location cannot be empty.");
        }

        if (!string.IsNullOrWhiteSpace(dto.City) && string.IsNullOrWhiteSpace(dto.City.Trim()))
        {
            errors.Add("City cannot be empty.");
        }

        if (!string.IsNullOrWhiteSpace(dto.District) && string.IsNullOrWhiteSpace(dto.District.Trim()))
        {
            errors.Add("District cannot be empty.");
        }

        if (!string.IsNullOrWhiteSpace(dto.StreetName) && string.IsNullOrWhiteSpace(dto.StreetName.Trim()))
        {
            errors.Add("Street name cannot be empty.");
        }

        if (!string.IsNullOrWhiteSpace(dto.BuildingNo) && string.IsNullOrWhiteSpace(dto.BuildingNo.Trim()))
        {
            errors.Add("Building number cannot be empty.");
        }

        if (!string.IsNullOrWhiteSpace(dto.ParentOccupation) && string.IsNullOrWhiteSpace(dto.ParentOccupation.Trim()))
        {
            errors.Add("Parent occupation cannot be empty.");
        }

        // Validate Previous School Type
        if (!string.IsNullOrEmpty(dto.PreviousSchoolType))
        {
            var validTypes = new[] { "عربي", "لغات" };
            if (!validTypes.Contains(dto.PreviousSchoolType))
            {
                errors.Add("Previous school type must be either 'عربي' or 'لغات'.");
            }
        }

        return errors;
    }
}
