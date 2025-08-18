using Microsoft.AspNetCore.Mvc;
using SchoolAdmission.DTOs;
using SchoolAdmission.Services;

[ApiController]
[Route("api/[controller]")]
public class StudentController : ControllerBase
{
    private readonly IStudentService _studentService;
    private readonly IWebHostEnvironment _environment;

    public StudentController(IStudentService studentService, IWebHostEnvironment environment)
    {
        _studentService = studentService;
        _environment = environment;
    }

    [HttpGet("validate/{nationalId}")]
    public async Task<IActionResult> ValidateNationalId(string nationalId)
    {
        try
        {
            var account = await _studentService.GetStudentByNationalIdAsync(nationalId);
            if (account == null)
                return NotFound("Student not found");

            // Check if student already completed info (using the same logic as the profile completion check)
            var hasCompletedInfo = !string.IsNullOrWhiteSpace(account.AdmissionProfile?.PhoneNumber) &&
                                  !string.IsNullOrWhiteSpace(account.AdmissionProfile?.ParentPhoneNumber) &&
                                  !string.IsNullOrWhiteSpace(account.AdmissionProfile?.BuildingNo) &&
                                  !string.IsNullOrWhiteSpace(account.AdmissionProfile?.ParentOccupation);

            return Ok(new
            {
                nationalId = account.NationalId,
                name = account.FullNameEn,
                mathScore = account.AdmissionProfile?.MathScore,
                english = account.AdmissionProfile?.EnglishScore,
                prepScore = account.AdmissionProfile?.ThirdPrepScore,
                ministryPercentage = account.AdmissionProfile?.MinistryExamPercentage,
                dateOfBirth = account.AdmissionProfile?.DateOfBirth,
                hasCompletedInfo = hasCompletedInfo,
                // Include existing data if already completed
                parentOccupation = hasCompletedInfo ? account.AdmissionProfile?.ParentOccupation : null,
                location = hasCompletedInfo ? account.AdmissionProfile?.Location : null,
                city = hasCompletedInfo ? account.AdmissionProfile?.City : null,
                district = hasCompletedInfo ? account.AdmissionProfile?.District : null,
                streetName = hasCompletedInfo ? account.AdmissionProfile?.StreetName : null,
                buildingNo = hasCompletedInfo ? account.AdmissionProfile?.BuildingNo : null,
                phoneNumber = hasCompletedInfo ? account.AdmissionProfile?.PhoneNumber : null,
                parentPhoneNumber = hasCompletedInfo ? account.AdmissionProfile?.ParentPhoneNumber : null,
                email = hasCompletedInfo ? account.Email : null,
                previousSchoolType = hasCompletedInfo ? account.AdmissionProfile?.PreviousSchoolType : null
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse.ErrorResult("An error occurred while validating student", ex.Message));
        }
    }

    [HttpPost("complete-info")]
    public async Task<IActionResult> CompleteStudentInfo([FromBody] StudentCompleteInfoDTO dto)
    {
        try
        {
            await _studentService.UpdateStudentInfoAsync(dto.NationalId, dto);
            return Ok(ApiResponse.SuccessResult("Student information updated successfully"));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse.ErrorResult("An error occurred while updating student information", ex.Message));
        }
    }

    [HttpPost("upload-document")]
    public async Task<IActionResult> UploadDocument(IFormFile file, [FromQuery] string nationalId, [FromQuery] string documentType)
    {
        try
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded");

            var filePath = await _studentService.UploadStudentDocumentAsync(nationalId, documentType, file, _environment.WebRootPath);

            return Ok(ApiResponse.SuccessResult(new
            {
                filePath = filePath,
                documentType = documentType
            }, "Document uploaded successfully"));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse.ErrorResult("Error uploading file", ex.Message));
        }
    }



    [HttpGet("validate-exam/{nationalId}")]
    public async Task<IActionResult> ValidateForExam(string nationalId)
    {
        try
        {
            var account = await _studentService.GetStudentByNationalIdAsync(nationalId);
            if (account == null)
                return NotFound("Student not found");

            if (!await _studentService.ValidateStudentForExamAsync(nationalId))
                return BadRequest("Only students can take exams");

            var hasCompletedExam = await _studentService.HasStudentCompletedExamAsync(account.Id);

            if (hasCompletedExam)
            {
                return Ok(new
                {
                    nationalId = account.NationalId,
                    name = account.FullNameEn,
                    examCompleted = true
                });
            }

            // Check if admission profile is complete
            var isProfileComplete = await _studentService.IsAdmissionProfileCompleteAsync(nationalId);
            if (!isProfileComplete)
            {
                return BadRequest(new
                {
                    error = "Profile Incomplete",
                    message = "Please complete your information first before taking the exam."
                });
            }

            // Check if exam questions are available
            var areQuestionsAvailable = await _studentService.AreExamQuestionsAvailableAsync();
            if (!areQuestionsAvailable)
            {
                return BadRequest(new
                {
                    error = "Exam Not Ready",
                    message = "The exam is not ready yet. Please check back later."
                });
            }

            // Check if student has school type specified
            var schoolType = account.AdmissionProfile?.PreviousSchoolType;
            if (string.IsNullOrEmpty(schoolType))
            {
                return BadRequest(new
                {
                    error = "School Type Not Specified",
                    message = "Please complete your information and specify your school type before taking the exam."
                });
            }

            // Validate school type
            if (schoolType != "لغات" && schoolType != "عربي")
            {
                return BadRequest(new
                {
                    error = "Invalid School Type",
                    message = "Invalid school type. Please contact administration."
                });
            }

            return Ok(new
            {
                nationalId = account.NationalId,
                name = account.FullNameEn,
                examCompleted = false,
                accountId = account.Id,
                schoolType = schoolType
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse.ErrorResult("An error occurred while validating student for exam", ex.Message));
        }
    }

    // Note: SubmitAnswers functionality is now handled in ExamController.SubmitAnswers
    // to maintain consistency and avoid duplication
}
