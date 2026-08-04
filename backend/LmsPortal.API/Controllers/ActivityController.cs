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
    public class ActivityController : ControllerBase
    {
        private readonly LmsDbContext _context;

        public ActivityController(LmsDbContext context)
        {
            _context = context;
        }

        public record LogActivityDto(string Action, string? Details);

        [HttpPost("log")]
        public async Task<IActionResult> LogActivity([FromBody] LogActivityDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Action)) return BadRequest();

            var userIdStr = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value ?? "EMPLOYEE";

            int? uId = null;
            if (int.TryParse(userIdStr, out int parsedId)) uId = parsedId;

            var log = new ActivityLog
            {
                UserId = uId,
                Role = role,
                Action = dto.Action,
                Details = dto.Details
            };

            _context.ActivityLogs.Add(log);
            await _context.SaveChangesAsync();
            return Ok(new { success = true });
        }

        [HttpGet("logs")]
        [Authorize(Policy = "RequireHRAdmin")]
        public async Task<IActionResult> GetLogs(
            [FromQuery] string? role,
            [FromQuery] string? action,
            [FromQuery] string? search,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20
        )
        {
            var query = _context.ActivityLogs.AsQueryable();

            if (!string.IsNullOrWhiteSpace(role) && role != "ALL")
                query = query.Where(a => a.Role == role);

            if (!string.IsNullOrWhiteSpace(action) && action != "ALL")
                query = query.Where(a => a.Action == action);

            if (!string.IsNullOrWhiteSpace(search))
            {
                var s = search.Trim().ToLower();
                query = query.Where(a =>
                    (a.Action != null && a.Action.ToLower().Contains(s)) ||
                    (a.Details != null && a.Details.ToLower().Contains(s))
                );
            }

            var total = await query.CountAsync();
            var totalPages = (int)Math.Ceiling((double)total / pageSize);

            var logs = await query
                .OrderByDescending(a => a.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(a => new
                {
                    a.Id,
                    userId = a.UserId.ToString(),
                    a.Role,
                    a.Action,
                    a.Details,
                    a.CreatedAt,
                    employee = (object?)null,
                    hrUser = (object?)null
                })
                .ToListAsync();

            return Ok(new
            {
                success = true,
                logs,
                total,
                totalPages,
                page
            });
        }
    }
}
