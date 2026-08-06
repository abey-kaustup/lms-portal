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
    public class CoursesController : ControllerBase
    {
        private readonly LmsDbContext _context;

        public CoursesController(LmsDbContext context)
        {
            _context = context;
        }

        public record UpsertModuleDto(
            int? Id,
            int CourseId,
            string Title,
            string? Description,
            string? ModuleType,
            int? TargetDepartmentId,
            int? SortOrder
        );

        public record UpsertLessonDto(
            int? Id,
            int ModuleId,
            string Title,
            string? Description,
            string? ContentType,
            string? VideoUrl,
            string? PdfUrl,
            int? MinDurationSeconds,
            int? SortOrder
        );

        [HttpGet("structure")]
        [AllowAnonymous]
        public async Task<IActionResult> GetCourseWithStructure()
        {
            var course = await _context.Courses
                .Include(c => c.Modules.Where(m => !m.IsDeleted).OrderBy(m => m.SortOrder))
                    .ThenInclude(m => m.TargetDepartment)
                .Include(c => c.Modules.Where(m => !m.IsDeleted).OrderBy(m => m.SortOrder))
                    .ThenInclude(m => m.Lessons.Where(l => !l.IsDeleted).OrderBy(l => l.SortOrder))
                        .ThenInclude(l => l.Files.Where(f => !f.IsDeleted))
                .Include(c => c.Assessments.Where(a => !a.IsDeleted))
                    .ThenInclude(a => a.Questions.Where(q => !q.IsDeleted))
                .FirstOrDefaultAsync(c => !c.IsDeleted);

            if (course == null)
            {
                course = new Course
                {
                    CourseCode = "C0001",
                    Title = "General Corporate Induction 2026",
                    Description = "Mandatory Induction Course",
                    PassingScorePercentage = 80.00m,
                    IsPublished = true
                };
                _context.Courses.Add(course);
                await _context.SaveChangesAsync();

                // Re-query to get navigation properties initialized
                course = await _context.Courses
                    .Include(c => c.Modules)
                    .Include(c => c.Assessments)
                    .FirstAsync(c => c.Id == course.Id);
            }

            var result = new
            {
                id = course.Id.ToString(),
                code = course.CourseCode,
                title = course.Title,
                description = course.Description,
                passingScore = course.PassingScorePercentage,
                modules = course.Modules.Where(m => !m.IsDeleted).OrderBy(m => m.SortOrder).Select(m => new
                {
                    id = m.Id.ToString(),
                    courseId = m.CourseId.ToString(),
                    code = m.ModuleCode,
                    title = m.Title,
                    description = m.Description,
                    moduleType = string.Equals(m.ModuleType, "DEPARTMENT", StringComparison.OrdinalIgnoreCase) ? "DEPARTMENT" : "COMMON",
                    targetDepartmentId = m.TargetDepartmentId,
                    targetDepartmentName = m.TargetDepartment?.DepartmentName,
                    sortOrder = m.SortOrder,
                    lessons = m.Lessons.Where(l => !l.IsDeleted).OrderBy(l => l.SortOrder).Select(l => new
                    {
                        id = l.Id.ToString(),
                        moduleId = l.ModuleId.ToString(),
                        code = l.LessonCode,
                        title = l.Title,
                        description = l.Description,
                        contentType = l.ContentType,
                        videoUrl = l.Files.FirstOrDefault(f => f.FileType == "VIDEO" && !f.IsDeleted)?.SharePointUrl,
                        pdfUrl = l.Files.FirstOrDefault(f => f.FileType == "PDF" && !f.IsDeleted)?.SharePointUrl,
                        minDurationSeconds = l.MinDurationSeconds,
                        sortOrder = l.SortOrder,
                        files = l.Files.Where(f => !f.IsDeleted).Select(f => new
                        {
                            id = f.Id.ToString(),
                            fileName = f.FileName,
                            fileUrl = f.SharePointUrl,
                            fileType = f.FileType,
                            fileSizeBytes = f.FileSizeByte
                        })
                    })
                }),
                assessment = course.Assessments.FirstOrDefault(a => !a.IsDeleted) == null ? null : new
                {
                    id = course.Assessments.First(a => !a.IsDeleted).Id.ToString(),
                    title = course.Assessments.First(a => !a.IsDeleted).Title,
                    totalQuestions = course.Assessments.First(a => !a.IsDeleted).Questions.Count(q => !q.IsDeleted),
                    passingPercentage = course.Assessments.First(a => !a.IsDeleted).PassingScorePercentage,
                    timeLimitMinutes = course.Assessments.First(a => !a.IsDeleted).TimeLimitMinutes,
                    questions = course.Assessments.First(a => !a.IsDeleted).Questions.Where(q => !q.IsDeleted).Select(q => new
                    {
                        id = q.Id.ToString(),
                        questionText = q.QuestionText,
                        points = q.Points,
                        sortOrder = q.SortOrder
                    })
                }
            };

            return Ok(new { success = true, data = result });
        }

        [HttpPost("modules")]
        [Authorize(Policy = "RequireHRAdmin")]
        public async Task<IActionResult> UpsertModule([FromBody] UpsertModuleDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Title))
                return BadRequest(new { success = false, message = "Title is required." });

            Module? module = null;
            if (dto.Id.HasValue && dto.Id.Value > 0)
            {
                module = await _context.Modules.FirstOrDefaultAsync(m => m.Id == dto.Id.Value && !m.IsDeleted);
            }

            int courseId = dto.CourseId;
            var existingCourse = courseId > 0 
                ? await _context.Courses.FirstOrDefaultAsync(c => c.Id == courseId && !c.IsDeleted) 
                : null;

            if (existingCourse == null)
            {
                existingCourse = await _context.Courses.FirstOrDefaultAsync(c => !c.IsDeleted);
                if (existingCourse == null)
                {
                    existingCourse = new Course
                    {
                        CourseCode = "C0001",
                        Title = "General Corporate Induction 2026",
                        Description = "Mandatory Induction Course",
                        PassingScorePercentage = 80.00m,
                        IsPublished = true
                    };
                    _context.Courses.Add(existingCourse);
                    await _context.SaveChangesAsync();
                }
                courseId = existingCourse.Id;
            }

            if (module == null)
            {
                var count = await _context.Modules.CountAsync(m => m.CourseId == courseId && !m.IsDeleted);
                var maxId = await _context.Modules.MaxAsync(m => (int?)m.Id) ?? 0;
                int nextNum = maxId + 1;
                while (await _context.Modules.AnyAsync(m => m.ModuleCode == $"M{nextNum:D4}"))
                {
                    nextNum++;
                }

                module = new Module
                {
                    CourseId = courseId,
                    ModuleCode = $"M{nextNum:D4}",
                    Title = dto.Title.Trim(),
                    Description = dto.Description?.Trim(),
                    ModuleType = dto.ModuleType ?? "COMMON",
                    TargetDepartmentId = dto.ModuleType == "DEPARTMENT" ? dto.TargetDepartmentId : null,
                    SortOrder = dto.SortOrder ?? count + 1
                };
                _context.Modules.Add(module);
            }
            else
            {
                module.Title = dto.Title.Trim();
                module.Description = dto.Description?.Trim();
                module.ModuleType = dto.ModuleType ?? "COMMON";
                module.TargetDepartmentId = dto.ModuleType == "DEPARTMENT" ? dto.TargetDepartmentId : null;
                if (dto.SortOrder.HasValue) module.SortOrder = dto.SortOrder.Value;
                module.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return Ok(new { success = true, data = module, message = "Module saved successfully." });
        }

        [HttpDelete("modules/{id}")]
        [Authorize(Policy = "RequireHRAdmin")]
        public async Task<IActionResult> DeleteModule(int id)
        {
            var module = await _context.Modules.FirstOrDefaultAsync(m => m.Id == id && !m.IsDeleted);
            if (module == null) return NotFound(new { success = false, message = "Module not found." });

            module.IsDeleted = true;
            module.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return Ok(new { success = true, message = "Module deleted successfully." });
        }

        [HttpPost("lessons")]
        [Authorize(Policy = "RequireHRAdmin")]
        public async Task<IActionResult> UpsertLesson([FromBody] UpsertLessonDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Title))
                return BadRequest(new { success = false, message = "Lesson Title is required." });

            Lesson? lesson = null;
            if (dto.Id.HasValue && dto.Id.Value > 0)
            {
                lesson = await _context.Lessons
                    .Include(l => l.Files)
                    .FirstOrDefaultAsync(l => l.Id == dto.Id.Value && !l.IsDeleted);
            }

            if (lesson == null)
            {
                var count = await _context.Lessons.CountAsync(l => l.ModuleId == dto.ModuleId && !l.IsDeleted);
                var maxId = await _context.Lessons.MaxAsync(l => (int?)l.Id) ?? 0;
                int nextNum = maxId + 1;
                while (await _context.Lessons.AnyAsync(l => l.LessonCode == $"L{nextNum:D4}"))
                {
                    nextNum++;
                }

                lesson = new Lesson
                {
                    ModuleId = dto.ModuleId,
                    LessonCode = $"L{nextNum:D4}",
                    Title = dto.Title.Trim(),
                    Description = dto.Description?.Trim(),
                    ContentType = dto.ContentType ?? "VIDEO",
                    MinDurationSeconds = dto.MinDurationSeconds ?? 0,
                    SortOrder = dto.SortOrder ?? count + 1
                };
                _context.Lessons.Add(lesson);
                await _context.SaveChangesAsync();

                if (!string.IsNullOrWhiteSpace(dto.VideoUrl))
                {
                    _context.LessonFiles.Add(new LessonFile
                    {
                        LessonId = lesson.Id,
                        FileName = $"{dto.Title}_video",
                        FileType = "VIDEO",
                        MimeType = "video/mp4",
                        SharePointUrl = dto.VideoUrl.Trim(),
                        IsPrimary = true
                    });
                }

                if (!string.IsNullOrWhiteSpace(dto.PdfUrl))
                {
                    _context.LessonFiles.Add(new LessonFile
                    {
                        LessonId = lesson.Id,
                        FileName = $"{dto.Title}_pdf",
                        FileType = "PDF",
                        MimeType = "application/pdf",
                        SharePointUrl = dto.PdfUrl.Trim(),
                        IsPrimary = false
                    });
                }
            }
            else
            {
                lesson.Title = dto.Title.Trim();
                lesson.Description = dto.Description?.Trim();
                lesson.ContentType = dto.ContentType ?? "VIDEO";
                lesson.MinDurationSeconds = dto.MinDurationSeconds ?? 0;
                if (dto.SortOrder.HasValue) lesson.SortOrder = dto.SortOrder.Value;
                lesson.UpdatedAt = DateTime.UtcNow;

                var videoFile = lesson.Files.FirstOrDefault(f => f.FileType == "VIDEO");
                if (videoFile != null && !string.IsNullOrWhiteSpace(dto.VideoUrl))
                {
                    videoFile.SharePointUrl = dto.VideoUrl.Trim();
                }

                var pdfFile = lesson.Files.FirstOrDefault(f => f.FileType == "PDF");
                if (pdfFile != null && !string.IsNullOrWhiteSpace(dto.PdfUrl))
                {
                    pdfFile.SharePointUrl = dto.PdfUrl.Trim();
                }
            }

            await _context.SaveChangesAsync();
            return Ok(new { success = true, data = lesson, message = "Lesson saved successfully." });
        }

        [HttpDelete("lessons/{id}")]
        [Authorize(Policy = "RequireHRAdmin")]
        public async Task<IActionResult> DeleteLesson(int id)
        {
            var lesson = await _context.Lessons.FirstOrDefaultAsync(l => l.Id == id && !l.IsDeleted);
            if (lesson == null) return NotFound(new { success = false, message = "Lesson not found." });

            lesson.IsDeleted = true;
            lesson.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return Ok(new { success = true, message = "Lesson deleted successfully." });
        }
    }
}
