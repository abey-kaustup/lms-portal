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
    public class LearningController : ControllerBase
    {
        private readonly LmsDbContext _context;
        private readonly LmsPortal.API.Services.IGamificationService _gamificationService;

        public LearningController(LmsDbContext context, LmsPortal.API.Services.IGamificationService gamificationService)
        {
            _context = context;
            _gamificationService = gamificationService;
        }

        public record SaveProgressDto(int LessonId, bool IsCompleted, decimal WatchedSeconds, decimal TotalSeconds);

        [HttpGet("state")]
        public async Task<IActionResult> GetLearningState()
        {
            var userIdStr = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdStr, out int userId)) return Unauthorized();

            var employee = await _context.Employees
                .Include(e => e.Department)
                .Include(e => e.Designation)
                .Include(e => e.Office)
                .FirstOrDefaultAsync(e => e.UserId == userId && !e.IsDeleted);

            if (employee == null)
            {
                var empCode = User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value;
                employee = await _context.Employees
                    .Include(e => e.Department)
                    .Include(e => e.Designation)
                    .Include(e => e.Office)
                    .FirstOrDefaultAsync(e => e.EmployeeCode == empCode && !e.IsDeleted);
            }

            if (employee == null) return NotFound(new { success = false, message = "Employee profile not found." });

            var course = await _context.Courses
                .Include(c => c.Modules.Where(m => !m.IsDeleted).OrderBy(m => m.SortOrder))
                    .ThenInclude(m => m.TargetDepartment)
                .Include(c => c.Modules.Where(m => !m.IsDeleted).OrderBy(m => m.SortOrder))
                    .ThenInclude(m => m.Lessons.Where(l => !l.IsDeleted).OrderBy(l => l.SortOrder))
                        .ThenInclude(l => l.Files.Where(f => !f.IsDeleted))
                .Include(c => c.Assessments.Where(a => !a.IsDeleted))
                    .ThenInclude(a => a.Questions.Where(q => !q.IsDeleted))
                        .ThenInclude(q => q.Options.Where(o => !o.IsDeleted))
                .FirstOrDefaultAsync(c => !c.IsDeleted);

            if (course == null) return Ok(new { success = true, data = (object?)null });

            var progressList = await _context.LessonProgresses
                .Where(lp => lp.EmployeeId == employee.Id && !lp.IsDeleted)
                .Select(lp => new
                {
                    id = lp.Id.ToString(),
                    employeeId = lp.EmployeeId.ToString(),
                    lessonId = lp.LessonId.ToString(),
                    isCompleted = lp.IsCompleted,
                    watchedSeconds = lp.WatchedSeconds,
                    totalSeconds = lp.TotalSeconds,
                    completedAt = lp.CompletedAt
                })
                .ToListAsync();

            var attempts = await _context.AssessmentAttempts
                .Where(aa => aa.EmployeeId == employee.Id && !aa.IsDeleted)
                .OrderByDescending(aa => aa.SubmittedAt)
                .Select(aa => new
                {
                    id = aa.Id.ToString(),
                    employeeId = aa.EmployeeId.ToString(),
                    courseId = aa.AssessmentId.ToString(),
                    score = aa.ScorePercentage,
                    passed = aa.Passed,
                    totalQuestions = aa.TotalQuestions,
                    correctAnswers = aa.CorrectAnswersCount,
                    timeTakenSeconds = aa.TimeTakenSeconds,
                    startedAt = aa.StartedAt,
                    submittedAt = aa.SubmittedAt
                })
                .ToListAsync();

            var certificate = await _context.Certificates
                .FirstOrDefaultAsync(c => c.EmployeeId == employee.Id && !c.IsDeleted);

            var filteredModules = course.Modules.Where(m =>
                m.ModuleType == "COMMON" ||
                (m.ModuleType == "DEPARTMENT" && m.TargetDepartmentId == employee.DepartmentId)
            ).OrderBy(m => m.SortOrder).ToList();

            // Calculate 7-Day Compliance Deadline Metrics
            var joiningDate = employee.JoiningDate;
            var deadlineDate = joiningDate.AddDays(7);
            var isCourseFullyCompleted = certificate != null || attempts.Any(a => a.passed);
            var isOverdue = DateTime.UtcNow > deadlineDate && !isCourseFullyCompleted;
            var daysRemaining = isOverdue ? 0 : Math.Max(0, (int)Math.Ceiling((deadlineDate - DateTime.UtcNow).TotalDays));
            var overdueDays = isOverdue ? Math.Max(1, (int)Math.Floor((DateTime.UtcNow - deadlineDate).TotalDays)) : 0;

            var result = new
            {
                employee = new
                {
                    id = employee.Id.ToString(),
                    employeeId = employee.EmployeeCode,
                    firstName = employee.FirstName,
                    lastName = employee.LastName,
                    email = employee.OfficialEmail,
                    department = employee.Department?.DepartmentName ?? employee.DepartmentCode,
                    departmentId = employee.DepartmentId.ToString(),
                    designation = employee.Designation?.Title ?? employee.DesignationCode,
                    office = employee.Office?.OfficeName ?? employee.OfficeCode,
                    status = employee.EmploymentStatus,
                    isMasterTester = employee.IsMasterTester,
                    joiningDate = joiningDate.ToString("yyyy-MM-dd"),
                    deadlineDate = deadlineDate.ToString("yyyy-MM-dd"),
                    daysRemaining,
                    isOverdue,
                    overdueDays
                },
                course = new
                {
                    id = course.Id.ToString(),
                    title = course.Title,
                    code = course.CourseCode,
                    description = course.Description,
                    passingScore = course.PassingScorePercentage,
                    isPublished = course.IsPublished,
                    modules = filteredModules.Select(m => new
                    {
                        id = m.Id.ToString(),
                        title = m.Title,
                        description = m.Description,
                        moduleType = m.ModuleType,
                        departmentId = m.TargetDepartmentId?.ToString(),
                        department = m.TargetDepartment != null ? new
                        {
                            id = m.TargetDepartment.Id.ToString(),
                            name = m.TargetDepartment.DepartmentName
                        } : null,
                        sortOrder = m.SortOrder,
                        lessons = m.Lessons.OrderBy(l => l.SortOrder).Select(l => new
                        {
                            id = l.Id.ToString(),
                            title = l.Title,
                            description = l.Description,
                            contentType = l.ContentType,
                            videoUrl = l.Files.FirstOrDefault(f => f.FileType == "VIDEO")?.SharePointUrl,
                            pdfUrl = l.Files.FirstOrDefault(f => f.FileType != "VIDEO")?.SharePointUrl,
                            files = l.Files.OrderBy(f => f.DisplayOrder).Select(f => new
                            {
                                id = f.Id.ToString(),
                                fileName = f.FileName,
                                fileType = f.FileType,
                                mimeType = f.MimeType,
                                sharePointUrl = f.SharePointUrl
                            }),
                            minDurationSeconds = l.MinDurationSeconds,
                            sortOrder = l.SortOrder
                        })
                    })
                },
                progressList,
                assessmentAttempts = attempts,
                passedAttempt = attempts.FirstOrDefault(a => a.passed),
                certificate = certificate != null ? new
                {
                    id = certificate.Id.ToString(),
                    certificateNumber = certificate.CertificateNumber,
                    issueDate = certificate.IssueDate,
                    qrVerificationCode = certificate.VerificationCode
                } : null
            };

            return Ok(new { success = true, data = result });
        }

        [HttpPost("progress")]
        public async Task<IActionResult> SaveLessonProgress([FromBody] SaveProgressDto dto)
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

            var lesson = await _context.Lessons.FirstOrDefaultAsync(l => l.Id == dto.LessonId && !l.IsDeleted);
            if (lesson == null) return NotFound(new { success = false, message = "Lesson not found." });

            // Enforce 90% Watch Threshold for Video Content (unless Master Tester)
            bool isCompletedRequested = dto.IsCompleted;
            if (isCompletedRequested && !employee.IsMasterTester)
            {
                decimal requiredSeconds = lesson.ContentType == "VIDEO"
                    ? (decimal)(lesson.MinDurationSeconds * 0.90) // 90% video watch requirement
                    : (decimal)lesson.MinDurationSeconds;

                if (dto.WatchedSeconds < requiredSeconds && requiredSeconds > 0)
                {
                    int reqInt = (int)Math.Ceiling(requiredSeconds);
                    return BadRequest(new
                    {
                        success = false,
                        message = $"Minimum required watch duration of {reqInt} seconds (90% completion requirement) not met."
                    });
                }
            }

            var progress = await _context.LessonProgresses
                .FirstOrDefaultAsync(lp => lp.EmployeeId == employee.Id && lp.LessonId == dto.LessonId && !lp.IsDeleted);

            if (progress == null)
            {
                progress = new LessonProgress
                {
                    EmployeeId = employee.Id,
                    LessonId = dto.LessonId,
                    IsCompleted = isCompletedRequested,
                    WatchedSeconds = dto.WatchedSeconds,
                    TotalSeconds = dto.TotalSeconds,
                    CompletedAt = isCompletedRequested ? DateTime.UtcNow : null
                };
                _context.LessonProgresses.Add(progress);
            }
            else
            {
                if (dto.WatchedSeconds > progress.WatchedSeconds)
                    progress.WatchedSeconds = dto.WatchedSeconds;
                if (dto.TotalSeconds > 0)
                    progress.TotalSeconds = dto.TotalSeconds;

                if (isCompletedRequested && !progress.IsCompleted)
                {
                    progress.IsCompleted = true;
                    progress.CompletedAt = DateTime.UtcNow;
                }
                progress.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            if (isCompletedRequested)
            {
                await _gamificationService.TriggerLessonCompletionAsync(employee.Id, dto.LessonId);
            }

            return Ok(new { success = true, data = progress });
        }
    }
}
