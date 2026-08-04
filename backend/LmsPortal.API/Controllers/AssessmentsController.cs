using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LmsPortal.API.Data;
using LmsPortal.Core.Entities;

namespace LmsPortal.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AssessmentsController : ControllerBase
    {
        private readonly LmsDbContext _context;

        public AssessmentsController(LmsDbContext context)
        {
            _context = context;
        }

        public record UpsertQuestionDto(
            int? Id,
            int CourseId,
            int? ModuleId,
            string QuestionText,
            List<string> Options,
            int CorrectOptionIndex,
            string? Explanation,
            decimal? Points,
            int? SortOrder
        );

        public record SubmitAttemptDto(
            int CourseId,
            Dictionary<int, int> Answers,
            int TimeTakenSeconds
        );

        [HttpGet("questions/{courseId}")]
        public async Task<IActionResult> GetQuestions(int courseId)
        {
            var userIdStr = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            int.TryParse(userIdStr, out int userId);
            var employee = await _context.Employees.FirstOrDefaultAsync(e => e.UserId == userId && !e.IsDeleted);

            var lastAttempt = employee != null
                ? await _context.AssessmentAttempts
                    .Where(a => a.EmployeeId == employee.Id && !a.IsDeleted)
                    .OrderByDescending(a => a.SubmittedAt)
                    .FirstOrDefaultAsync()
                : null;

            bool isCooldownActive = false;
            DateTime? cooldownExpiresAt = null;
            int cooldownRemainingMinutes = 0;

            if (lastAttempt != null && !lastAttempt.Passed && (employee == null || !employee.IsMasterTester))
            {
                var nextEligible = lastAttempt.SubmittedAt.AddHours(5);
                if (DateTime.UtcNow < nextEligible)
                {
                    isCooldownActive = true;
                    cooldownExpiresAt = nextEligible;
                    cooldownRemainingMinutes = (int)Math.Ceiling((nextEligible - DateTime.UtcNow).TotalMinutes);
                }
            }

            var questions = await _context.AssessmentQuestions
                .Include(q => q.Module)
                    .ThenInclude(m => m!.TargetDepartment)
                .Include(q => q.Options.Where(o => !o.IsDeleted))
                .Where(q => q.Assessment.CourseId == courseId && !q.IsDeleted)
                .OrderBy(q => q.SortOrder)
                .ToListAsync();

            if (questions.Count == 0)
            {
                questions = await _context.AssessmentQuestions
                    .Include(q => q.Module)
                        .ThenInclude(m => m!.TargetDepartment)
                    .Include(q => q.Options.Where(o => !o.IsDeleted))
                    .Where(q => !q.IsDeleted)
                    .OrderBy(q => q.SortOrder)
                    .ToListAsync();
            }

            // Phase 2 Requirement: Question & Option Shuffling
            var rng = new Random();
            var shuffledQuestions = questions.OrderBy(_ => rng.Next()).ToList();

            var result = shuffledQuestions.Select(q => {
                var shuffledOptions = q.Options.Select(o => new
                {
                    id = o.Id,
                    optionText = o.OptionText,
                    sortOrder = o.SortOrder
                }).OrderBy(_ => rng.Next()).ToList();

                return new
                {
                    id = q.Id.ToString(),
                    moduleId = q.ModuleId?.ToString(),
                    moduleTitle = q.Module?.Title,
                    moduleType = q.Module?.ModuleType ?? "COMMON",
                    departmentName = q.Module?.TargetDepartment?.DepartmentName ?? "Common",
                    questionText = q.QuestionText,
                    options = shuffledOptions.Select(o => o.optionText).ToList(),
                    optionDetails = shuffledOptions.Select(o => new { id = o.id, text = o.optionText }).ToList(),
                    explanation = q.Explanation,
                    points = q.Points,
                    sortOrder = q.SortOrder
                };
            }).ToList();

            return Ok(new
            {
                success = true,
                isCooldownActive,
                cooldownExpiresAt,
                cooldownRemainingMinutes,
                lastAttemptScore = lastAttempt?.ScorePercentage,
                data = result
            });
        }

        [HttpPost("questions")]
        [Authorize(Policy = "RequireHRAdmin")]
        public async Task<IActionResult> UpsertQuestion([FromBody] UpsertQuestionDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.QuestionText) || dto.Options == null || dto.Options.Count == 0)
                return BadRequest(new { success = false, message = "Question text and options are required." });

            var assessment = await _context.Assessments.FirstOrDefaultAsync(a => a.CourseId == dto.CourseId && !a.IsDeleted);
            if (assessment == null)
            {
                assessment = new Assessment
                {
                    CourseId = dto.CourseId,
                    AssessmentCode = $"A{dto.CourseId:D4}",
                    Title = "Course End Assessment",
                    TimeLimitMinutes = 30,
                    PassingScorePercentage = 80.00m
                };
                _context.Assessments.Add(assessment);
                await _context.SaveChangesAsync();
            }

            AssessmentQuestion? question = null;
            if (dto.Id.HasValue && dto.Id.Value > 0)
            {
                question = await _context.AssessmentQuestions
                    .Include(q => q.Options)
                    .FirstOrDefaultAsync(q => q.Id == dto.Id.Value && !q.IsDeleted);
            }

            if (question == null)
            {
                var count = await _context.AssessmentQuestions.CountAsync(q => q.AssessmentId == assessment.Id && !q.IsDeleted);
                question = new AssessmentQuestion
                {
                    AssessmentId = assessment.Id,
                    ModuleId = dto.ModuleId,
                    QuestionText = dto.QuestionText.Trim(),
                    Explanation = dto.Explanation?.Trim(),
                    Points = dto.Points ?? 1.0m,
                    SortOrder = dto.SortOrder ?? count + 1
                };
                _context.AssessmentQuestions.Add(question);
                await _context.SaveChangesAsync();

                for (int i = 0; i < dto.Options.Count; i++)
                {
                    _context.QuestionOptions.Add(new QuestionOption
                    {
                        QuestionId = question.Id,
                        OptionText = dto.Options[i].Trim(),
                        SortOrder = i + 1,
                        IsCorrect = i == dto.CorrectOptionIndex
                    });
                }
            }
            else
            {
                question.QuestionText = dto.QuestionText.Trim();
                question.ModuleId = dto.ModuleId;
                question.Explanation = dto.Explanation?.Trim();
                question.Points = dto.Points ?? 1.0m;
                if (dto.SortOrder.HasValue) question.SortOrder = dto.SortOrder.Value;
                question.UpdatedAt = DateTime.UtcNow;

                _context.QuestionOptions.RemoveRange(question.Options);
                for (int i = 0; i < dto.Options.Count; i++)
                {
                    _context.QuestionOptions.Add(new QuestionOption
                    {
                        QuestionId = question.Id,
                        OptionText = dto.Options[i].Trim(),
                        SortOrder = i + 1,
                        IsCorrect = i == dto.CorrectOptionIndex
                    });
                }
            }

            await _context.SaveChangesAsync();
            return Ok(new { success = true, data = question, message = "Assessment question saved successfully." });
        }

        [HttpDelete("questions/{id}")]
        [Authorize(Policy = "RequireHRAdmin")]
        public async Task<IActionResult> DeleteQuestion(int id)
        {
            var question = await _context.AssessmentQuestions.FirstOrDefaultAsync(q => q.Id == id && !q.IsDeleted);
            if (question == null) return NotFound(new { success = false, message = "Question not found." });

            question.IsDeleted = true;
            question.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return Ok(new { success = true, message = "Question deleted successfully." });
        }

        [HttpPost("submit")]
        public async Task<IActionResult> SubmitAttempt([FromBody] SubmitAttemptDto dto)
        {
            var userIdStr = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdStr, out int userId)) return Unauthorized();

            var employee = await _context.Employees.FirstOrDefaultAsync(e => e.UserId == userId && !e.IsDeleted);
            if (employee == null)
            {
                var empCode = User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value;
                employee = await _context.Employees.FirstOrDefaultAsync(e => e.EmployeeCode == empCode && !e.IsDeleted);
            }

            if (employee == null) return NotFound(new { success = false, message = "Employee not found." });

            // Enforce 5-Hour Retake Cooldown Rule
            var lastAttempt = await _context.AssessmentAttempts
                .Where(a => a.EmployeeId == employee.Id && !a.IsDeleted)
                .OrderByDescending(a => a.SubmittedAt)
                .FirstOrDefaultAsync();

            if (lastAttempt != null && !lastAttempt.Passed && !employee.IsMasterTester)
            {
                var nextEligible = lastAttempt.SubmittedAt.AddHours(5);
                if (DateTime.UtcNow < nextEligible)
                {
                    var rem = nextEligible - DateTime.UtcNow;
                    int remHours = (int)rem.TotalHours;
                    int remMins = rem.Minutes;
                    return BadRequest(new
                    {
                        success = false,
                        isCooldownActive = true,
                        cooldownExpiresAt = nextEligible,
                        message = $"Retake cooldown active. You can retake the assessment after {remHours} hours and {remMins} minutes."
                    });
                }
            }

            var assessment = await _context.Assessments
                .Include(a => a.Questions.Where(q => !q.IsDeleted))
                    .ThenInclude(q => q.Options.Where(o => !o.IsDeleted))
                .FirstOrDefaultAsync(a => a.CourseId == dto.CourseId && !a.IsDeleted);

            var questions = assessment?.Questions?.ToList() ?? await _context.AssessmentQuestions
                .Include(q => q.Options.Where(o => !o.IsDeleted))
                .Where(q => !q.IsDeleted)
                .ToListAsync();

            int totalQuestions = questions.Count;
            int correctAnswers = 0;

            foreach (var q in questions)
            {
                if (dto.Answers.TryGetValue(q.Id, out int selectedVal))
                {
                    // Check if selectedVal matches option ID or option index
                    var matchedOpt = q.Options.FirstOrDefault(o => o.Id == selectedVal)
                                  ?? (selectedVal >= 0 && selectedVal < q.Options.Count ? q.Options.OrderBy(o => o.SortOrder).ElementAtOrDefault(selectedVal) : null);

                    if (matchedOpt != null && matchedOpt.IsCorrect)
                    {
                        correctAnswers++;
                    }
                }
            }

            decimal scorePercentage = totalQuestions > 0 ? Math.Round((decimal)correctAnswers / totalQuestions * 100, 2) : 0m;
            decimal passingRequired = assessment?.PassingScorePercentage ?? 80.00m;

            // Strict Compliance Rule: Certificate is ONLY issued if score >= 80.00%
            bool passed = scorePercentage >= passingRequired;

            var attempt = new AssessmentAttempt
            {
                EmployeeId = employee.Id,
                AssessmentId = assessment?.Id ?? 1,
                TotalQuestions = totalQuestions,
                CorrectAnswersCount = correctAnswers,
                ScorePercentage = scorePercentage,
                Passed = passed,
                TimeTakenSeconds = dto.TimeTakenSeconds,
                StartedAt = DateTime.UtcNow.AddSeconds(-dto.TimeTakenSeconds),
                SubmittedAt = DateTime.UtcNow
            };

            _context.AssessmentAttempts.Add(attempt);
            await _context.SaveChangesAsync();

            Certificate? cert = null;
            if (passed)
            {
                cert = await _context.Certificates.FirstOrDefaultAsync(c => c.EmployeeId == employee.Id && c.CourseId == dto.CourseId && !c.IsDeleted);
                if (cert == null)
                {
                    string certNo = $"CERT-{DateTime.UtcNow:yyyyMM}-{employee.EmployeeCode}-{Guid.NewGuid().ToString("N")[..6].ToUpper()}";
                    string verifyCode = $"VERIFY-{Guid.NewGuid().ToString("N")[..12].ToUpper()}";

                    cert = new Certificate
                    {
                        EmployeeId = employee.Id,
                        CourseId = dto.CourseId,
                        CertificateCode = $"T{employee.Id:D4}",
                        CertificateNumber = certNo,
                        VerificationCode = verifyCode,
                        VerificationUrl = $"/verify?cert={certNo}",
                        IssueDate = DateTime.UtcNow
                    };
                    _context.Certificates.Add(cert);
                    await _context.SaveChangesAsync();
                }
            }

            return Ok(new
            {
                success = true,
                scorePercentage,
                passed,
                correctAnswersCount = correctAnswers,
                totalQuestions,
                passingScore = passingRequired,
                certificate = cert != null ? new
                {
                    id = cert.Id.ToString(),
                    certificateNumber = cert.CertificateNumber,
                    issueDate = cert.IssueDate,
                    qrVerificationCode = cert.VerificationCode
                } : null
            });
        }
    }
}
