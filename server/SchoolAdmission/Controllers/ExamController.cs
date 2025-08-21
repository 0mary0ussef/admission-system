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
            .FirstOrDefaultAsync(a => a.Email == userEmail);
            
        return adminAccount?.Role?.RoleName == "SuperAdmin";
    }

    // 1. Import Questions from Excel
    [HttpPost("import-questions")]
    [Authorize]
    public async Task<IActionResult> ImportQuestionsFromExcel(IFormFile file)
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
            // Ensure the correct sections exist
            await EnsureCorrectSectionsExist();
            
            var importedQuestions = new List<ExamQuestion>();
            var skippedQuestions = new List<string>();
            
            using var stream = file.OpenReadStream();
            using var package = new ExcelPackage(stream);
            var worksheet = package.Workbook.Worksheets[0]; // First sheet

            // Skip header row, start from row 2
            for (int row = 2; row <= worksheet.Dimension.End.Row; row++)
            {
                var questionTitle = worksheet.Cells[row, 1].Value?.ToString();
                var choice1 = worksheet.Cells[row, 2].Value?.ToString();
                var choice2 = worksheet.Cells[row, 3].Value?.ToString();
                var choice3 = worksheet.Cells[row, 4].Value?.ToString();
                var choice4 = worksheet.Cells[row, 5].Value?.ToString();
                var correctAnswer = worksheet.Cells[row, 6].Value?.ToString();
                var sectionName = worksheet.Cells[row, 7].Value?.ToString();

                if (string.IsNullOrEmpty(questionTitle) || string.IsNullOrEmpty(sectionName))
                    continue; // Skip empty rows

                // Validate section name - only allow predefined sections
                var validSections = new[] { "English", "Math", "MathAR", "Arabic", "Software" };
                if (!validSections.Contains(sectionName, StringComparer.OrdinalIgnoreCase))
                {
                    // Skip questions with invalid section names
                    skippedQuestions.Add($"Row {row}: Invalid section '{sectionName}' for question '{questionTitle}'");
                    continue;
                }

                // Get or create section
                var section = await db.Sections.FirstOrDefaultAsync(s => s.SectionName == sectionName);
                if (section == null)
                {
                    section = new Section { SectionName = sectionName };
                    db.Sections.Add(section);
                    await db.SaveChangesAsync(); // Save to get the ID
                }

                var question = new ExamQuestion
                {
                    QuestionTitle = questionTitle,
                    Choice1 = choice1 ?? "",
                    Choice2 = choice2 ?? "",
                    Choice3 = choice3 ?? "",
                    Choice4 = choice4 ?? "",
                    CorrectAnswer = correctAnswer ?? "",
                    SectionId = section.Id
                };

                db.ExamQuestions.Add(question);
                importedQuestions.Add(question);
            }

            await db.SaveChangesAsync();

            return Ok(new { 
                message = "Questions imported successfully", 
                importedCount = importedQuestions.Count,
                skippedCount = skippedQuestions.Count,
                skippedQuestions = skippedQuestions,
                questions = importedQuestions.Select(q => new {
                    q.Id,
                    q.QuestionTitle,
                    q.SectionId,
                    sectionName = db.Sections.First(s => s.Id == q.SectionId).SectionName
                })
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error importing questions: {ex.Message}");
        }
    }

    // Helper method to ensure correct sections exist
    private async Task EnsureCorrectSectionsExist()
    {
        var validSections = new[] { "English", "Math", "MathAR", "Arabic", "Software" };
        
        foreach (var sectionName in validSections)
        {
            var section = await db.Sections.FirstOrDefaultAsync(s => s.SectionName == sectionName);
            if (section == null)
            {
                section = new Section { SectionName = sectionName };
                db.Sections.Add(section);
            }
        }
        
        await db.SaveChangesAsync();
    }

    // 2. Get Questions by Section
    [HttpGet("questions/{sectionName}")]
    public async Task<IActionResult> GetQuestionsBySection(string sectionName)
    {
        var section = await db.Sections
            .Include(s => s.ExamQuestions)
            .FirstOrDefaultAsync(s => s.SectionName == sectionName);

        if (section == null)
            return NotFound($"Section '{sectionName}' not found");

        var questions = section.ExamQuestions.Select(q => new {
            q.Id,
            q.QuestionTitle,
            q.Choice1,
            q.Choice2,
            q.Choice3,
            q.Choice4
            // Don't include CorrectAnswer for security
        }).ToList();

        Console.WriteLine($"GetQuestionsBySection: Found {questions.Count} questions for section '{sectionName}'");
        Console.WriteLine($"Question IDs: {string.Join(", ", questions.Select(q => q.Id))}");

        return Ok(new {
            sectionName = section.SectionName,
            questionCount = questions.Count,
            questions = questions
        });
    }

    // 2.1. Get Questions by Section with School Type Logic
    [HttpGet("questions/{sectionName}/{nationalId}")]
    public async Task<IActionResult> GetQuestionsBySectionWithSchoolType(string sectionName, string nationalId)
    {
        // Get student's school type
        var account = await db.Accounts
            .Include(a => a.AdmissionProfile)
            .FirstOrDefaultAsync(a => a.NationalId == nationalId);

        if (account == null)
            return NotFound("Student not found");

        var schoolType = account.AdmissionProfile?.PreviousSchoolType;

        // Determine which math section to use based on school type
        string actualSectionName = sectionName;
        if (sectionName.Equals("Math", StringComparison.OrdinalIgnoreCase))
        {
            if (schoolType == "عربي")
            {
                actualSectionName = "MathAR";
            }
            else if (schoolType == "لغات")
            {
                actualSectionName = "Math";
            }
            else
            {
                // Default to Math if school type is not specified
                actualSectionName = "Math";
            }
        }

        var section = await db.Sections
            .Include(s => s.ExamQuestions)
            .FirstOrDefaultAsync(s => s.SectionName == actualSectionName);

        if (section == null)
            return NotFound($"Section '{actualSectionName}' not found");

        var questions = section.ExamQuestions.Select(q => new {
            q.Id,
            q.QuestionTitle,
            q.Choice1,
            q.Choice2,
            q.Choice3,
            q.Choice4
            // Don't include CorrectAnswer for security
        }).ToList();

        Console.WriteLine($"GetQuestionsBySectionWithSchoolType: Found {questions.Count} questions for section '{actualSectionName}' (requested: '{sectionName}', school type: '{schoolType}')");
        Console.WriteLine($"Question IDs: {string.Join(", ", questions.Select(q => q.Id))}");

        return Ok(new {
            sectionName = section.SectionName,
            actualSectionName = actualSectionName,
            schoolType = schoolType,
            questionCount = questions.Count,
            questions = questions
        });
    }

    // 3. Get All Sections
    [HttpGet("sections")]
    public async Task<IActionResult> GetSections()
    {
        var sections = await db.Sections
            .Include(s => s.ExamQuestions)
            .Select(s => new {
                s.Id,
                s.SectionName,
                questionCount = s.ExamQuestions.Count
            })
            .ToListAsync();

        Console.WriteLine($"GetSections: Found {sections.Count} sections");
        foreach (var section in sections)
        {
            Console.WriteLine($"Section: {section.SectionName}, Questions: {section.questionCount}");
        }

        return Ok(sections);
    }

    // 3.1. Get Sections with School Type Logic
    [HttpGet("sections/{nationalId}")]
    public async Task<IActionResult> GetSectionsWithSchoolType(string nationalId)
    {
        // Get student's school type
        var account = await db.Accounts
            .Include(a => a.AdmissionProfile)
            .FirstOrDefaultAsync(a => a.NationalId == nationalId);

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
            else if (section.SectionName.Equals("Math", StringComparison.OrdinalIgnoreCase))
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

        Console.WriteLine($"GetSectionsWithSchoolType: Found {filteredSections.Count} sections for student with school type '{schoolType}'");
        foreach (var section in filteredSections)
        {
            var sectionObj = (dynamic)section;
            Console.WriteLine($"Section: {sectionObj.SectionName}, Questions: {sectionObj.questionCount}");
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
        Console.WriteLine($"SubmitAnswers called for NationalId: {dto.NationalId}");
        Console.WriteLine($"Received {dto.Answers?.Count ?? 0} answers");
        
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
                Console.WriteLine($"Question {answer.QuestionId} not found");
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
                
                Console.WriteLine($"Question {answer.QuestionId} ({question.Section?.SectionName}): Chosen index {chosenIndex} -> '{actualAnswer}', Correct: '{question.CorrectAnswer}', IsCorrect: {isCorrect}");
            }
            else
            {
                // Frontend sent text directly, compare normally
                isCorrect = answer.ChosenAnswer?.Trim().ToLower() == question.CorrectAnswer?.Trim().ToLower();
                Console.WriteLine($"Question {answer.QuestionId} ({question.Section?.SectionName}): Chosen '{answer.ChosenAnswer}', Correct: '{question.CorrectAnswer}', IsCorrect: {isCorrect}");
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

        // Get the updated results for response
        var results = await db.StudentExamResults
            .FirstOrDefaultAsync(ser => ser.AccountId == account.Id);

        // Get section information to determine which math section was used
        var sectionStats = submittedAnswers
            .GroupBy(a => a.Exam.Section.SectionName)
            .ToDictionary(
                g => g.Key,
                g => g.Count()
            );
        
        var mathSectionUsed = sectionStats.ContainsKey("Math") ? "Math" : 
                             sectionStats.ContainsKey("MathAR") ? "MathAR" : "None";

        return Ok(new {
            message = "Answers submitted successfully",
            submittedCount = submittedAnswers.Count,
            correctAnswers = submittedAnswers.Count(a => a.Score),
            totalQuestions = submittedAnswers.Count,
            debugInfo = new {
                answersWithScores = submittedAnswers.Select(a => new {
                    questionId = a.ExamId,
                    chosenAnswer = a.ChoosedAnswer,
                    score = a.Score
                }).Take(5) // Show first 5 for debugging
            },
            scores = new {
                arabic = results?.ExamArabicScore ?? 0,
                english = results?.ExamEnglishScore ?? 0,
                math = results?.ExamMathScore ?? 0,
                software = results?.ExamSoftwareScore ?? 0,
                total = (results?.ExamArabicScore ?? 0) + 
                       (results?.ExamEnglishScore ?? 0) + 
                       (results?.ExamMathScore ?? 0) + 
                       (results?.ExamSoftwareScore ?? 0)
            },
            mathSectionUsed = mathSectionUsed,
            note = "Each section is scored out of 15 points (total exam: 60 points)"
        });
    }

    // 5. Get Student Exam Results
    [HttpGet("results/{nationalId}")]
    [Authorize]
    public async Task<IActionResult> GetExamResults(string nationalId)
    {
        var account = await db.Accounts
            .FirstOrDefaultAsync(a => a.NationalId == nationalId);

        if (account == null)
            return NotFound("Student not found");

        var results = await db.StudentExamResults
            .FirstOrDefaultAsync(ser => ser.AccountId == account.Id);

        if (results == null)
            return NotFound("Exam results not found");

        // Get detailed answer statistics
        var studentAnswers = await db.StudentExamAnswers
            .Include(sea => sea.Exam)
            .ThenInclude(e => e.Section)
            .Where(sea => sea.AccountId == account.Id)
            .ToListAsync();

        // Get total questions count for each section from the database
        var totalQuestionsBySection = await db.ExamQuestions
            .Include(q => q.Section)
            .GroupBy(q => q.Section.SectionName)
            .ToDictionaryAsync(
                g => g.Key,
                g => g.Count()
            );

        var sectionStats = studentAnswers
            .GroupBy(sea => sea.Exam.Section.SectionName)
            .ToDictionary(
                g => g.Key,
                g => {
                    var totalQuestionsInSection = totalQuestionsBySection.GetValueOrDefault(g.Key, 0);
                    var correctAnswers = g.Count(sea => sea.Score);
                    var answeredQuestions = g.Count();
                    
                    return new {
                        correctAnswers = correctAnswers,
                        answeredQuestions = answeredQuestions,
                        totalQuestionsInSection = totalQuestionsInSection,
                        percentage = totalQuestionsInSection > 0 ? Math.Round((double)correctAnswers / totalQuestionsInSection * 100, 2) : 0,
                        scoreOutOf15 = totalQuestionsInSection > 0 ? Math.Round((double)correctAnswers / totalQuestionsInSection * 15, 2) : 0
                    };
                }
            );

        // Determine which math section was used for the unified math score
        var mathSectionUsed = sectionStats.ContainsKey("Math") ? "Math" : 
                             sectionStats.ContainsKey("MathAR") ? "MathAR" : "None";

        return Ok(new {
            accountId = account.Id,
            nationalId = account.NationalId,
            studentName = account.FullNameEn,
            scores = new {
                arabic = results.ExamArabicScore,
                english = results.ExamEnglishScore,
                math = results.ExamMathScore,
                software = results.ExamSoftwareScore,
                total = results.ExamArabicScore + results.ExamEnglishScore + results.ExamMathScore + results.ExamSoftwareScore
            },
            sectionStats = sectionStats,
            mathSectionUsed = mathSectionUsed,
            totalQuestions = studentAnswers.Count,
            totalCorrect = studentAnswers.Count(a => a.Score),
            overallPercentage = studentAnswers.Count > 0 ? Math.Round((double)studentAnswers.Count(a => a.Score) / studentAnswers.Count * 100, 2) : 0,
            scoringSystem = "Each section scored out of 15 points (total exam: 60 points)"
        });
    }

    // 6. Get Student Answers (for review)
    [HttpGet("answers/{nationalId}")]
    [Authorize]
    public async Task<IActionResult> GetStudentAnswers(string nationalId)
    {
        var account = await db.Accounts
            .FirstOrDefaultAsync(a => a.NationalId == nationalId);

        if (account == null)
            return NotFound("Student not found");

        var answers = await db.StudentExamAnswers
            .Include(sea => sea.Exam)
            .ThenInclude(e => e.Section)
            .Where(sea => sea.AccountId == account.Id)
            .Select(sea => new {
                questionId = sea.ExamId,
                questionTitle = sea.Exam.QuestionTitle,
                sectionName = sea.Exam.Section.SectionName,
                chosenAnswer = sea.ChoosedAnswer,
                correctAnswer = sea.Exam.CorrectAnswer,
                isCorrect = sea.Score
            })
            .ToListAsync();

        return Ok(new {
            accountId = account.Id,
            nationalId = account.NationalId,
            studentName = account.FullNameEn,
            totalAnswers = answers.Count,
            correctAnswers = answers.Count(a => a.isCorrect),
            answers = answers
        });
    }

    // Helper method to calculate and update final results
    private async Task CalculateAndUpdateResults(long accountId)
    {
        // Get all answers for this student with proper includes
        var studentAnswers = await db.StudentExamAnswers
            .Include(sea => sea.Exam)
            .ThenInclude(e => e.Section)
            .Where(sea => sea.AccountId == accountId)
            .ToListAsync();

        // Debug: Log what we found
        Console.WriteLine($"Found {studentAnswers.Count} answers for account {accountId}");
        
        if (!studentAnswers.Any())
        {
            Console.WriteLine("No answers found for this student");
            return;
        }

        // Get total questions count for each section from the database
        var totalQuestionsBySection = await db.ExamQuestions
            .Include(q => q.Section)
            .GroupBy(q => q.Section.SectionName)
            .ToDictionaryAsync(
                g => g.Key,
                g => g.Count()
            );

        // Calculate scores by section with detailed statistics
        var scoresBySection = studentAnswers
            .Where(sea => sea.Exam != null && sea.Exam.Section != null) // Filter out null references
            .GroupBy(sea => sea.Exam.Section.SectionName)
            .ToDictionary(
                g => g.Key,
                g => {
                    var totalQuestionsInSection = totalQuestionsBySection.GetValueOrDefault(g.Key, 0);
                    var correctAnswers = g.Count(sea => sea.Score);
                    var answeredQuestions = g.Count();
                    
                    return new {
                        CorrectAnswers = correctAnswers,
                        AnsweredQuestions = answeredQuestions,
                        TotalQuestionsInSection = totalQuestionsInSection,
                        Percentage = totalQuestionsInSection > 0 ? Math.Round((double)correctAnswers / totalQuestionsInSection * 100, 2) : 0,
                        // Calculate score out of 15 based on total questions in section, not answered questions
                        ScoreOutOf15 = totalQuestionsInSection > 0 ? Math.Round((double)correctAnswers / totalQuestionsInSection * 15, 2) : 0
                    };
                }
            );

        // Debug: Log section scores
        foreach (var section in scoresBySection)
        {
            Console.WriteLine($"Section {section.Key}: {section.Value.CorrectAnswers}/{section.Value.TotalQuestionsInSection} correct (answered: {section.Value.AnsweredQuestions}) = {section.Value.ScoreOutOf15} out of 15");
        }

        // Get or create StudentExamResult
        var results = await db.StudentExamResults
            .FirstOrDefaultAsync(ser => ser.AccountId == accountId);

        if (results == null)
        {
            var account = await db.Accounts.FirstAsync(a => a.Id == accountId);
            results = new StudentExamResult
            {
                AccountId = accountId
            };
            db.StudentExamResults.Add(results);
        }

        // Update scores (store the score out of 15 for each section)
        results.ExamArabicScore = (int)Math.Round(scoresBySection.GetValueOrDefault("Arabic", new { CorrectAnswers = 0, AnsweredQuestions = 0, TotalQuestionsInSection = 0, Percentage = 0.0, ScoreOutOf15 = 0.0 }).ScoreOutOf15);
        results.ExamEnglishScore = (int)Math.Round(scoresBySection.GetValueOrDefault("English", new { CorrectAnswers = 0, AnsweredQuestions = 0, TotalQuestionsInSection = 0, Percentage = 0.0, ScoreOutOf15 = 0.0 }).ScoreOutOf15);
        
        // Handle unified Math score - check both Math and MathAR sections
        var mathScore = scoresBySection.GetValueOrDefault("Math", new { CorrectAnswers = 0, AnsweredQuestions = 0, TotalQuestionsInSection = 0, Percentage = 0.0, ScoreOutOf15 = 0.0 }).ScoreOutOf15;
        var mathARScore = scoresBySection.GetValueOrDefault("MathAR", new { CorrectAnswers = 0, AnsweredQuestions = 0, TotalQuestionsInSection = 0, Percentage = 0.0, ScoreOutOf15 = 0.0 }).ScoreOutOf15;
        
        // Use whichever score is available (Math or MathAR)
        results.ExamMathScore = (int)Math.Round(mathScore > 0 ? mathScore : mathARScore);
        
        results.ExamSoftwareScore = (int)Math.Round(scoresBySection.GetValueOrDefault("Software", new { CorrectAnswers = 0, AnsweredQuestions = 0, TotalQuestionsInSection = 0, Percentage = 0.0, ScoreOutOf15 = 0.0 }).ScoreOutOf15);

        await db.SaveChangesAsync();
        
        // Debug: Log final scores
        Console.WriteLine($"Final scores - Arabic: {results.ExamArabicScore}, English: {results.ExamEnglishScore}, Math: {results.ExamMathScore} (from {(mathScore > 0 ? "Math" : "MathAR")}), Software: {results.ExamSoftwareScore}");
    }

    // 7. Calculate/Recalculate Student Exam Results (Admin only)
    [HttpPost("calculate-results/{nationalId}")]
    [Authorize]
    public async Task<IActionResult> CalculateStudentResults(string nationalId)
    {
        // Check if user is SuperAdmin or Admin
        if (!await IsSuperAdmin())
            return Forbid("Only SuperAdmin users can recalculate exam results.");

        var account = await db.Accounts
            .FirstOrDefaultAsync(a => a.NationalId == nationalId);

        if (account == null)
            return NotFound("Student not found");

        try
        {
            // Calculate and update results
            await CalculateAndUpdateResults(account.Id);

            // Get the updated results
            var results = await db.StudentExamResults
                .FirstOrDefaultAsync(ser => ser.AccountId == account.Id);

            if (results == null)
                return NotFound("No exam results found for this student");

            return Ok(new {
                message = "Exam results calculated successfully",
                studentName = account.FullNameEn,
                nationalId = account.NationalId,
                scores = new {
                    arabic = results.ExamArabicScore,
                    english = results.ExamEnglishScore,
                    math = results.ExamMathScore,
                    software = results.ExamSoftwareScore,
                    total = results.ExamArabicScore + results.ExamEnglishScore + results.ExamMathScore + results.ExamSoftwareScore
                },
                scoringSystem = "Each section scored out of 15 points (total exam: 60 points)"
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error calculating results: {ex.Message}");
        }
    }

    // 8. Debug endpoint to check student answers (Admin only)
    [HttpGet("debug-answers/{nationalId}")]
    [Authorize]
    public async Task<IActionResult> DebugStudentAnswers(string nationalId)
    {
        // Check if user is SuperAdmin
        if (!await IsSuperAdmin())
            return Forbid("Only SuperAdmin users can access debug information.");

        var account = await db.Accounts
            .FirstOrDefaultAsync(a => a.NationalId == nationalId);

        if (account == null)
            return NotFound("Student not found");

        var studentAnswers = await db.StudentExamAnswers
            .Include(sea => sea.Exam)
            .ThenInclude(e => e.Section)
            .Where(sea => sea.AccountId == account.Id)
            .Select(sea => new {
                questionId = sea.ExamId,
                questionTitle = sea.Exam.QuestionTitle,
                sectionName = sea.Exam.Section.SectionName,
                chosenAnswer = sea.ChoosedAnswer,
                correctAnswer = sea.Exam.CorrectAnswer,
                choice1 = sea.Exam.Choice1,
                choice2 = sea.Exam.Choice2,
                choice3 = sea.Exam.Choice3,
                choice4 = sea.Exam.Choice4,
                score = sea.Score,
                isCorrect = sea.ChoosedAnswer == sea.Exam.CorrectAnswer
            })
            .ToListAsync();

        return Ok(new {
            studentName = account.FullNameEn,
            nationalId = account.NationalId,
            totalAnswers = studentAnswers.Count,
            answersWithScores = studentAnswers.Count(a => a.score),
            answersWithCorrectLogic = studentAnswers.Count(a => a.isCorrect),
            note = "If answersWithScores is 0 but answersWithCorrectLogic is higher, there's a data type mismatch issue",
            answers = studentAnswers
        });
    }

    // 9. Get All Students Results (Admin/Teacher view)
    [HttpGet("all-results")]
    [Authorize]
    public async Task<IActionResult> GetAllResults()
    {
        // Check if user is SuperAdmin
        if (!await IsSuperAdmin())
            return Forbid("Only SuperAdmin users can view all results.");

        var results = await db.StudentExamResults
            .Include(r => r.Account)
            .Select(r => new {
                accountId = r.AccountId,
                nationalId = r.Account.NationalId,
                studentName = r.Account.FullNameEn,
                arabicScore = r.ExamArabicScore,
                englishScore = r.ExamEnglishScore,
                mathScore = r.ExamMathScore,
                softwareScore = r.ExamSoftwareScore,
                totalScore = r.ExamArabicScore + r.ExamEnglishScore + r.ExamMathScore + r.ExamSoftwareScore
            })
            .OrderByDescending(r => r.totalScore)
            .ToListAsync();

        return Ok(results);
    }

    // 10. Request Time Extension (Teacher Authentication)
    [HttpPost("request-extension")]
    public async Task<IActionResult> RequestTimeExtension([FromBody] TimeExtensionDTO dto)
    {
        // Validate teacher credentials
        var teacher = await db.Accounts
            .Include(a => a.Role)
            .FirstOrDefaultAsync(a => a.Email == dto.TeacherEmail);

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
