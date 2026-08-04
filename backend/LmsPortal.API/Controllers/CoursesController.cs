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
                return Ok(new { success = true, data = (object?)null });
            }

            var result = new
            {
                id = course.Id.ToString(),
                code = course.CourseCode,
                title = course.Title,
                description = course.Description,
                passingScore = course.PassingScorePercentage,
                modules = course.Modules.OrderBy(m => m.SortOrder).Select(m => new
                {
                    id = m.Id.ToString(),
                    courseId = m.CourseId.ToString(),
                    title = m.Title,
                    description = m.Description,
                    moduleType = m.ModuleType,
                    departmentId = m.TargetDepartmentId?.ToString(),
                    department = m.TargetDepartment != null ? new
                    {
                        id = m.TargetDepartment.Id.ToString(),
                        name = m.TargetDepartment.DepartmentName,
                        code = m.TargetDepartment.DepartmentCode
                    } : null,
                    sortOrder = m.SortOrder,
                    lessons = m.Lessons.OrderBy(l => l.SortOrder).Select(l => new
                    {
                        id = l.Id.ToString(),
                        moduleId = l.ModuleId.ToString(),
                        title = l.Title,
                        description = l.Description,
                        contentType = l.ContentType,
                        videoUrl = l.Files.FirstOrDefault(f => f.FileType == "VIDEO")?.SharePointUrl,
                        pdfUrl = l.Files.FirstOrDefault(f => f.FileType == "PDF")?.SharePointUrl,
                        minDurationSeconds = l.MinDurationSeconds,
                        sortOrder = l.SortOrder
                    })
                }),
                assessmentQuestions = course.Assessments.SelectMany(a => a.Questions).Select(q => new
                {
                    id = q.Id.ToString(),
                    courseId = course.Id.ToString(),
                    moduleId = q.ModuleId?.ToString(),
                    questionText = q.QuestionText,
                    points = q.Points,
                    sortOrder = q.SortOrder
                })
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

            if (module == null)
            {
                var count = await _context.Modules.CountAsync(m => m.CourseId == dto.CourseId && !m.IsDeleted);
                module = new Module
                {
                    CourseId = dto.CourseId,
                    ModuleCode = $"M{count + 1:D4}",
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
                lesson = new Lesson
                {
                    ModuleId = dto.ModuleId,
                    LessonCode = $"L{count + 1:D4}",
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
