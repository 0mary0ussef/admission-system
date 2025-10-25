using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using SchoolAdmission.Models;
using SchoolAdmission.Data;
using SchoolAdmission.DTOs;
using Microsoft.EntityFrameworkCore;
using OfficeOpenXml;
using System.Security.Claims;

[ApiController]
[Route("api/[controller]")]
public class ExamController : ControllerBase
{
    private readonly SchoolAdmissionDbContext db;
    public static int questionsCount = 10;

    public ExamController(SchoolAdmissionDbContext context)
    {
        db = context;
    }

    private string GetCurrentAdminEmail()
    {
        return User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst("sub")?.Value
            ?? string.Empty;
    }

    private async Task<bool> IsSuperAdmin()
    {
        var userEmail = GetCurrentAdminEmail();
        var adminAccount = await db.Accounts
            .Include(a => a.Role)
            .FirstOrDefaultAsync(a => a.Email == userEmail && a.Role.BusinessEntity == "Admission");
            
        return adminAccount?.Role?.RoleName == "SuperAdmin";
    }

    // 2. Import Questions from Excel (Multiple Sheets by SectionId)
    
        [HttpPost("import-questions")]
        [Authorize]
        public async Task<IActionResult> ImportQuestionsFromExcelMultiSheets(IFormFile file)
        {
            // Check if user is SuperAdmin
            if (!await IsSuperAdmin())
                return Forbid("Only SuperAdmin users can import exam questions.");

            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded");

            if (!file.FileName.EndsWith(".xlsx"))
                return BadRequest("Please upload an Excel file (.xlsx)");

            try
            {
                var importedQuestions = new List<ExamQuestion>();

                using var stream = file.OpenReadStream();
                using var package = new ExcelPackage(stream);

                // Loop through all sheets in the workbook
                foreach (var worksheet in package.Workbook.Worksheets)
                {
                    // Each Sheet is the SectionId
                    if (!int.TryParse(worksheet.Name, out int sectionId))
                        continue;

                    // Check if the section exists in the database
                    var sectionExists = await db.Sections.AnyAsync(s => s.Id == sectionId);
                    if (!sectionExists)
                        continue;

                    // Skip header row, start from row 2
                    for (int row = 2; row <= worksheet.Dimension.End.Row; row++)
                    {
                        var questionTitle = worksheet.Cells[row, 1].Value?.ToString();
                        var choice1 = worksheet.Cells[row, 2].Value?.ToString();
                        var choice2 = worksheet.Cells[row, 3].Value?.ToString();
                        var choice3 = worksheet.Cells[row, 4].Value?.ToString();
                        var choice4 = worksheet.Cells[row, 5].Value?.ToString();
                        var correctAnswer = worksheet.Cells[row, 6].Value?.ToString();
                        var sectionIdStr = worksheet.Cells[row, 7].Value?.ToString();

                        if (string.IsNullOrEmpty(questionTitle) || string.IsNullOrEmpty(sectionIdStr))
                            continue; // Skip empty rows

                        if (!int.TryParse(sectionIdStr, out int parsedSectionId) || parsedSectionId != sectionId)
                            continue;

                        var question = new ExamQuestion
                        {
                            QuestionTitle = questionTitle,
                            Choice1 = choice1 ?? "",
                            Choice2 = choice2 ?? "",
                            Choice3 = choice3 ?? "",
                            Choice4 = choice4 ?? "",
                            CorrectAnswer = correctAnswer ?? "",
                            SectionId = sectionId
                        };

                        db.ExamQuestions.Add(question);
                        importedQuestions.Add(question);
                    }
                }

                await db.SaveChangesAsync();

                return Ok(new
                {
                    message = "Questions imported successfully (multi-sheets)",
                    importedCount = importedQuestions.Count,
                    questions = importedQuestions.Select(q => new {
                        q.Id,
                        q.QuestionTitle,
                        q.SectionId
                    })
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error importing questions: {ex.Message}");
            }
        }
    

    // Get Questions by Section and school type, new Logic- With Randomization
    [HttpGet("questions/{sectionName}/{nationalId}")]
    public async Task<IActionResult> GetQuestionsBySectionWithSchoolType(string sectionName, string nationalId)
    {
        // Get student and school type
        var student = await db.Accounts
            .Include(s => s.AdmissionProfile)
            .Include(s => s.Role)
            .FirstOrDefaultAsync(s => s.NationalId == nationalId && s.Role.BusinessEntity == "Admission");

        if (student == null)
            return NotFound("Student not found");

        // Determine actual section name based on school type
        var actualSectionName = sectionName;
        if (sectionName.Equals("Math", StringComparison.OrdinalIgnoreCase))
        {
            if (student.AdmissionProfile?.PreviousSchoolType == "عربي")
                actualSectionName = "MathAR";
            else if (student.AdmissionProfile?.PreviousSchoolType == "لغات")
                actualSectionName = "MathEN";
            else
                actualSectionName = "MathEN"; // Default to MathEN
        }
        else if (sectionName.Equals("MathEN", StringComparison.OrdinalIgnoreCase))
        {
            actualSectionName = "MathEN";
        }
        else if (sectionName.Equals("MathAR", StringComparison.OrdinalIgnoreCase))
        {
            actualSectionName = "MathAR";
        }

        // Get section with questions
        var section = await db.Sections
            .Include(s => s.ExamQuestions)
            .FirstOrDefaultAsync(s => s.SectionName == actualSectionName);

        if (section == null)
            return NotFound($"Section '{actualSectionName}' not found");

        // Randomize and take 10 questions
        var questions = section.ExamQuestions
            .OrderBy(q => Guid.NewGuid()) // randomize
            .Take(questionsCount)
            .Select(q => new {
                q.Id,
                q.QuestionTitle,
                q.Choice1,
                q.Choice2,
                q.Choice3,
                q.Choice4
                // Don't include CorrectAnswer
            })
            .ToList();

        return Ok(new {
            sectionName = section.SectionName,
            actualSectionName = actualSectionName,
            schoolType = student.AdmissionProfile?.PreviousSchoolType,
            questionCount = questions.Count,
            questions = questions
        });
    }




    // 3.1. Get Sections with School Type Logic
    [HttpGet("sections/{nationalId}")]
    
    public async Task<IActionResult> GetSectionsWithSchoolType(string nationalId)
    {
        // Get student's school type
        var account = await db.Accounts
            .Include(a => a.AdmissionProfile)
            .Include(a => a.Role)
            .FirstOrDefaultAsync(a => a.NationalId == nationalId && a.Role.BusinessEntity == "Admission");

        if (account == null)
            return NotFound("Student not found");

        var schoolType = account.AdmissionProfile?.PreviousSchoolType;

        var allSections = await db.Sections
            .Include(s => s.ExamQuestions)
            .Select(s => new {
                s.Id,
                s.SectionName,
                questionCount = s.ExamQuestions.Count
            })
            .ToListAsync();

        // Filter sections based on school type
        var filteredSections = new List<object>();
        
        foreach (var section in allSections)
        {
            // Always include English, Arabic, and Software sections
            if (section.SectionName.Equals("English", StringComparison.OrdinalIgnoreCase) ||
                section.SectionName.Equals("Arabic", StringComparison.OrdinalIgnoreCase) ||
                section.SectionName.Equals("Software", StringComparison.OrdinalIgnoreCase))
            {
                filteredSections.Add(section);
            }
            // Handle Math sections based on school type
            else if (section.SectionName.Equals("MathEN", StringComparison.OrdinalIgnoreCase))
            {
                if (schoolType == "لغات")
                {
                    filteredSections.Add(section);
                }
            }
            else if (section.SectionName.Equals("MathAR", StringComparison.OrdinalIgnoreCase))
            {
                if (schoolType == "عربي")
                {
                    filteredSections.Add(section);
                }
            }
        }

        // Log the sections for debugging
        Console.WriteLine($"Student {account.NationalId} - School Type: {schoolType}");
        Console.WriteLine("Available sections:");
        foreach (var section in filteredSections)
        {
            var sectionObj = (dynamic)section;
            Console.WriteLine($"  - {sectionObj.SectionName}: {sectionObj.questionCount} questions");
        }

        return Ok(new {
            schoolType = schoolType,
            sections = filteredSections
        });
    }
    

    // 4. Submit Student Answers
    [HttpPost("submit-answers")]
    public async Task<IActionResult> SubmitAnswers([FromBody] SubmitAnswersDTO dto)
    {

        var account = await db.Accounts
            .FirstOrDefaultAsync(a => a.NationalId == dto.NationalId);

        if (account == null)
            return NotFound("Student not found");

        // Clear previous answers for this student (if any)
        var existingAnswers = await db.StudentExamAnswers
            .Where(sea => sea.AccountId == account.Id)
            .ToListAsync();
        
        if (existingAnswers.Any())
        {
            db.StudentExamAnswers.RemoveRange(existingAnswers);
            await db.SaveChangesAsync();
        }

        var submittedAnswers = new List<StudentExamAnswer>();

        foreach (var answer in dto.Answers)
        {
            var question = await db.ExamQuestions
                .Include(q => q.Section)
                .FirstOrDefaultAsync(q => q.Id == answer.QuestionId);

            if (question == null)
            {
                continue;
            }

            // Handle answer comparison - frontend sends indices (0,1,2,3) but DB stores actual text
            bool isCorrect = false;
            
            if (int.TryParse(answer.ChosenAnswer, out int chosenIndex))
            {
                // Frontend sent a numeric index, convert to actual answer text
                var actualAnswer = chosenIndex switch
                {
                    0 => question.Choice1,
                    1 => question.Choice2,
                    2 => question.Choice3,
                    3 => question.Choice4,
                    _ => answer.ChosenAnswer
                };
                
                // Compare with correct answer
                isCorrect = actualAnswer?.Trim().ToLower() == question.CorrectAnswer?.Trim().ToLower();
                
            }
            else
            {
                // Frontend sent text directly, compare normally
                isCorrect = answer.ChosenAnswer?.Trim().ToLower() == question.CorrectAnswer?.Trim().ToLower();
            }

            var studentAnswer = new StudentExamAnswer
            {
                AccountId = account.Id,
                ExamId = answer.QuestionId,
                ChoosedAnswer = answer.ChosenAnswer,
                Score = isCorrect
            };

            db.StudentExamAnswers.Add(studentAnswer);
            submittedAnswers.Add(studentAnswer);
        }

        await db.SaveChangesAsync();

        // Calculate and update final results
        await CalculateAndUpdateResults(account.Id);

        // Get the calculated results to return total score
        var results = await db.StudentExamResults
            .FirstOrDefaultAsync(r => r.AccountId == account.Id);

        var totalScore = 0;
        if (results != null)
        {
            totalScore = results.ExamArabicScore + results.ExamEnglishScore + results.ExamMathScore + results.ExamSoftwareScore;
        }

        return Ok(new {
            message = "Answers submitted successfully",
            totalScore = totalScore,
            maxScore = 60
        });
    }

 
    // Helper method to calculate and update final results
        private async Task CalculateAndUpdateResults(long accountId)
    {
        // Get all student answers with Exam and Section
        var studentAnswers = await db.StudentExamAnswers
            .Include(sea => sea.Exam)
            .ThenInclude(e => e.Section)
            .Where(sea => sea.AccountId == accountId)
            .ToListAsync();

        if (!studentAnswers.Any())
            return;

        // Define each Section and the number of questions the student answered for each subject
        var sections = studentAnswers
            .Where(sea => sea.Exam != null && sea.Exam.Section != null)
            .GroupBy(sea => sea.Exam.Section.SectionName)
            .ToDictionary(
                g => g.Key,
                g => new
                {
                    CorrectAnswers = g.Count(sea => sea.Score),                          // عدد الإجابات الصح
                    TotalDisplayed = g.Count()                        // عدد الأسئلة اللي ظهرت للطالب
                }
            );

        // Get or create StudentExamResult
        var results = await db.StudentExamResults.FirstOrDefaultAsync(r => r.AccountId == accountId);
        if (results == null)
        {
            results = new StudentExamResult { AccountId = accountId };
            db.StudentExamResults.Add(results);
        }

        // Helper method to calculate the score out of 15
        int CalcScore(string sectionName)
        {
            if (!sections.ContainsKey(sectionName) || sections[sectionName].TotalDisplayed == 0)
                return 0;

            var sec = sections[sectionName];
            return (int)Math.Round((double)sec.CorrectAnswers / questionsCount * 15);
        }

        // Update scores
        results.ExamArabicScore = CalcScore("Arabic");
        results.ExamEnglishScore = CalcScore("English");

        // Math can be MathEN or MathAR depending on the student
        var mathENScore = CalcScore("MathEN");
        var mathARScore = CalcScore("MathAR");
        results.ExamMathScore = mathENScore > 0 ? mathENScore : mathARScore;

        results.ExamSoftwareScore = CalcScore("Software");

        await db.SaveChangesAsync();
    }



    // 10. Request Time Extension (Teacher Authentication)
    [HttpPost("request-extension")]
    public async Task<IActionResult> RequestTimeExtension([FromBody] TimeExtensionDTO dto)
    {
        // Validate teacher credentials
        var teacher = await db.Accounts
            .Include(a => a.Role)
            .FirstOrDefaultAsync(a => a.Email == dto.TeacherEmail && a.Role.BusinessEntity == "Admission");

        if (teacher == null || teacher.Role?.RoleName != "Teacher")
            return BadRequest("Invalid teacher credentials.");

        // Verify password
        var login = await db.Logins.FirstOrDefaultAsync(l => l.AccountId == teacher.Id);
        if (login == null || !BCrypt.Net.BCrypt.Verify(dto.TeacherPassword, login.PasswordHash))
            return BadRequest("Invalid teacher credentials.");

        // Validate student exists
        var student = await db.Accounts.FirstOrDefaultAsync(a => a.NationalId == dto.NationalId);
        if (student == null)
            return NotFound("Student not found.");

        // Check if student has already taken exam
        var existingResult = await db.StudentExamResults
            .FirstOrDefaultAsync(r => r.AccountId == student.Id);

        if (existingResult != null)
            return BadRequest("Student has already completed the exam.");

        // Log the extension request
        // You might want to create a table to track extension requests
        // For now, we'll just return success

        return Ok(new {
            message = $"Time extension of {dto.ExtensionMinutes} minutes granted.",
            extensionMinutes = dto.ExtensionMinutes
        });
    }

}
