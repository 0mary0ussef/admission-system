using Microsoft.AspNetCore.Mvc;
using SchoolAdmission.DTOs;
using SchoolAdmission.Repos.IRepos;
using SchoolAdmission.Services;
using SchoolAdmission.Data;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class StudentController : ControllerBase
{
    private readonly IStudentRepo _studentRepo;
    private readonly IWebHostEnvironment _environment;
    private readonly IExamRepo _examRepo;
    private readonly IAuthRepo _authRepo;
    private readonly SchoolAdmissionDbContext _db;

    public StudentController( IWebHostEnvironment environment, IStudentRepo studentRepo, IExamRepo examRepo, IAuthRepo authRepo, SchoolAdmissionDbContext db)
    {
        _environment = environment;
        _studentRepo = studentRepo;
        _examRepo = examRepo;
        _authRepo = authRepo;
        _db = db;
    }

    [HttpGet("validate/{nationalId}")]
    public async Task<IActionResult> ValidateNationalId(string nationalId)
    {
        try
        {
            var account = await _studentRepo.getStudentByNationalIdWithIncludeAsync(nationalId);
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
                hasOnlineTrainingCourses = account.AdmissionProfile?.HasOnlineTrainingCourses,
                hasICDLLicense = account.AdmissionProfile?.HasIcdllicense,
                hasLaptop = account.AdmissionProfile?.HasLaptop,
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
                email = account.Email,

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
            if(dto == null){
                return BadRequest("Student information is required");
            }
            var student = await _studentRepo.getStudentByNationalIdWithIncludeAsync(dto.NationalId);
            if(student == null){
                return BadRequest("Student not found");
            }
            if (!string.IsNullOrWhiteSpace(dto.Email))
            {
                if (student.Email != dto.Email)
                {
                    var emailExists = await _studentRepo.getStudentByEmailAsync(dto.Email);
                    if (emailExists)
                    {
                        return BadRequest("Email already exists");
                    }
                }
                student.Email = dto.Email;
            }
            student.FullNameEn = dto.StudentNameEn;
            student.AdmissionProfile.StudentName = dto.StudentNameEn;
            student.AdmissionProfile.ParentOccupation = dto.ParentOccupation;
            student.AdmissionProfile.Location = dto.Location;
            student.AdmissionProfile.City = dto.City;
            student.AdmissionProfile.District = dto.District;
            student.AdmissionProfile.StreetName = dto.StreetName;
            student.AdmissionProfile.BuildingNo = dto.BuildingNo;
            student.AdmissionProfile.PhoneNumber = dto.PhoneNumber;
            student.AdmissionProfile.ParentPhoneNumber = dto.ParentPhoneNumber;
            student.AdmissionProfile.PreviousSchoolType = dto.PreviousSchoolType;
            student.AdmissionProfile.HasOnlineTrainingCourses = dto.HasOnlineTrainingCourses;
            student.AdmissionProfile.HasIcdllicense = dto.HasICDLLicense;
            student.AdmissionProfile.HasLaptop = dto.HasLaptop;
            student.AdmissionProfile.BirthCertificatePath = dto.BirthCertificatePath;
            student.AdmissionProfile.SuccessReportPath = dto.SuccessReportPath;
            student.AdmissionProfile.TuitionFeeReceiptPath = dto.TuitionFeeReceiptPath;
            student.AdmissionProfile.PreferencesSheetPath = dto.PreferencesSheetPath;

            _studentRepo.Update(student);
            await _studentRepo.SaveChangesAsync();

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

            var filePath = await  _studentRepo.UploadStudentDocumentAsync(nationalId, documentType, file, _environment.WebRootPath);

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
            var account = await _studentRepo.getStudentByNationalIdWithIncludeAsync(nationalId);
            if (account == null)
                return NotFound("Student not found");

            // Check if account is an applicant - applicants don't have Login records
            var isApplicant = await _authRepo.IsApplicantAsync(account.Id);
            if (!isApplicant)
                return BadRequest("Only applicants can take exams");

            var hasCompletedExam = await _studentRepo.hasStudentCompletedExamAsync(nationalId);

            if (hasCompletedExam)
            {
                return Ok(new
                {
                    nationalId = account.NationalId,
                    name = account.FullNameEn,
                    examCompleted = true
                });
            }

            if(account.AdmissionProfile.PhoneNumber == null || account.AdmissionProfile.ParentPhoneNumber == null || account.AdmissionProfile.BuildingNo == null || account.AdmissionProfile.ParentOccupation == null){
                return BadRequest(new
                {
                    error = "Profile Incomplete",
                    message = "Please complete your information first before taking the exam."
                });
            }

              

            // Check if exam questions are available
            var areQuestionsAvailable = await _examRepo.areExamQuestionsAvailableAsync();
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

    [HttpGet("portal/{nationalId}")]
    public async Task<IActionResult> GetStudentPortal(string nationalId)
    {
        try
        {
            var account = await _studentRepo.getStudentByNationalIdWithIncludeAsync(nationalId);
            if (account == null)
                return NotFound("Student not found");

            var profile = account.AdmissionProfile;
            var hasCompletedInfo = !string.IsNullOrWhiteSpace(profile?.PhoneNumber) &&
                                  !string.IsNullOrWhiteSpace(profile?.ParentPhoneNumber) &&
                                  !string.IsNullOrWhiteSpace(profile?.BuildingNo) &&
                                  !string.IsNullOrWhiteSpace(profile?.ParentOccupation);

            var examResult = await _db.StudentExamResults
                .AsNoTracking()
                .FirstOrDefaultAsync(r => r.AccountId == account.Id);

            var examSectionScores = new Dictionary<string, int>
            {
                ["Arabic"] = examResult?.ExamArabicScore ?? 0,
                ["English"] = examResult?.ExamEnglishScore ?? 0,
                ["Math"] = examResult?.ExamMathScore ?? 0,
                ["Software"] = examResult?.ExamSoftwareScore ?? 0
            };

            var examTotal = examSectionScores.Values.Sum();
            var examMax = 60;
            var hasCompletedExam = examResult != null;
            var examPercentage = hasCompletedExam ? Math.Round((double)examTotal * 100 / examMax, 2) : 0;

            var cohortExamTotals = await _db.StudentExamResults
                .AsNoTracking()
                .Select(r => r.ExamArabicScore + r.ExamEnglishScore + r.ExamMathScore + r.ExamSoftwareScore)
                .ToListAsync();

            var cohortAverage = cohortExamTotals.Any()
                ? Math.Round(cohortExamTotals.Average(), 2)
                : 0;

            var percentileRank = hasCompletedExam && cohortExamTotals.Any()
                ? Math.Round((double)cohortExamTotals.Count(score => score <= examTotal) * 100 / cohortExamTotals.Count, 2)
                : 0;

            var interviewScores = await _db.InterviewScores
                .AsNoTracking()
                .Where(i => i.AccountId == account.Id)
                .Select(i => i.Score)
                .ToListAsync();

            var interviewCount = interviewScores.Count;
            var interviewMaxCount = 3;
            var interviewAverage = interviewCount > 0
                ? Math.Round(interviewScores.Average(), 2)
                : 0;

            var missingFields = new List<string>();
            if (string.IsNullOrWhiteSpace(profile?.ParentOccupation)) missingFields.Add("Parent Occupation");
            if (string.IsNullOrWhiteSpace(profile?.Location)) missingFields.Add("Address");
            if (string.IsNullOrWhiteSpace(profile?.City)) missingFields.Add("City");
            if (string.IsNullOrWhiteSpace(profile?.District)) missingFields.Add("District");
            if (string.IsNullOrWhiteSpace(profile?.StreetName)) missingFields.Add("Street");
            if (string.IsNullOrWhiteSpace(profile?.BuildingNo)) missingFields.Add("Building Number");
            if (string.IsNullOrWhiteSpace(profile?.PhoneNumber)) missingFields.Add("Student Phone");
            if (string.IsNullOrWhiteSpace(profile?.ParentPhoneNumber)) missingFields.Add("Parent Phone");
            if (string.IsNullOrWhiteSpace(profile?.PreviousSchoolType)) missingFields.Add("School Type");

            var documents = new[]
            {
                new { key = "birthCertificate", label = "Birth Certificate", uploaded = !string.IsNullOrWhiteSpace(profile?.BirthCertificatePath) },
                new { key = "successReport", label = "Success Report", uploaded = !string.IsNullOrWhiteSpace(profile?.SuccessReportPath) },
                new { key = "tuitionFeeReceipt", label = "Tuition Fee Receipt", uploaded = !string.IsNullOrWhiteSpace(profile?.TuitionFeeReceiptPath) },
                new { key = "preferencesSheet", label = "Preferences Sheet", uploaded = !string.IsNullOrWhiteSpace(profile?.PreferencesSheetPath) }
            };

            var uploadedDocumentCount = documents.Count(d => d.uploaded);
            var statusText = MapStatus((long)(profile?.StatusId ?? account.StatusId));
            var nextAction = DetermineNextAction(hasCompletedInfo, hasCompletedExam, interviewCount, statusText);

            return Ok(new
            {
                student = new
                {
                    id = account.Id,
                    fullName = account.FullNameEn,
                    nationalId = account.NationalId,
                    email = account.Email,
                    createdAt = account.CreatedAt,
                    status = new
                    {
                        id = (long)(profile?.StatusId ?? account.StatusId),
                        text = statusText
                    }
                },
                stageProgress = new
                {
                    registered = true,
                    profileCompleted = hasCompletedInfo,
                    examCompleted = hasCompletedExam,
                    interviewsCompletedCount = interviewCount,
                    interviewsExpectedCount = interviewMaxCount,
                    finalDecisionPublished = statusText == "Accepted" || statusText == "Rejected" || statusText == "Waitlisted"
                },
                profile = new
                {
                    isCompleted = hasCompletedInfo,
                    missingFields,
                    schoolType = profile?.PreviousSchoolType,
                    parentOccupation = profile?.ParentOccupation,
                    location = profile?.Location,
                    city = profile?.City,
                    district = profile?.District,
                    streetName = profile?.StreetName,
                    buildingNo = profile?.BuildingNo,
                    studentPhone = profile?.PhoneNumber,
                    parentPhone = profile?.ParentPhoneNumber,
                    hasLaptop = profile?.HasLaptop ?? false,
                    hasOnlineTrainingCourses = profile?.HasOnlineTrainingCourses ?? false,
                    hasICDLLicense = profile?.HasIcdllicense ?? false
                },
                documents = new
                {
                    uploadedCount = uploadedDocumentCount,
                    totalCount = documents.Length,
                    items = documents
                },
                exam = new
                {
                    isCompleted = hasCompletedExam,
                    total = examTotal,
                    max = examMax,
                    percentage = examPercentage,
                    sections = examSectionScores,
                    benchmark = new
                    {
                        cohortAverageTotal = cohortAverage,
                        percentileRank = percentileRank
                    }
                },
                interviews = new
                {
                    count = interviewCount,
                    expected = interviewMaxCount,
                    average = interviewAverage
                },
                insights = new
                {
                    nextAction = nextAction
                }
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse.ErrorResult("An error occurred while loading student portal data", ex.Message));
        }
    }

    private static string MapStatus(long statusId)
    {
        return statusId switch
        {
            2 => "Accepted",
            3 => "Rejected",
            4 => "Waitlisted",
            _ => "Pending"
        };
    }

    private static string DetermineNextAction(bool hasCompletedInfo, bool hasCompletedExam, int interviewCount, string statusText)
    {
        if (!hasCompletedInfo)
            return "Complete your profile details to unlock exam access.";

        if (!hasCompletedExam)
            return "Proceed to exam verification and complete the admission exam.";

        if (statusText == "Accepted" || statusText == "Rejected" || statusText == "Waitlisted")
            return $"Your final decision is published: {statusText}.";

        if (interviewCount < 3)
            return "Wait for interview scheduling. Keep your contact channels active.";

        return "Your interviews are completed. Await final board decision.";
    }


}
