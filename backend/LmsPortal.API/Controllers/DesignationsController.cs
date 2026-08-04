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
    public class DesignationsController : ControllerBase
    {
        private readonly LmsDbContext _context;

        public DesignationsController(LmsDbContext context)
        {
            _context = context;
        }

        public record UpsertDesignationDto(int? Id, string Title, string? GradeLevel);

        [HttpGet]
        public async Task<IActionResult> GetDesignations()
        {
            var designations = await _context.Designations
                .Where(d => !d.IsDeleted)
                .Select(d => new
                {
                    d.Id,
                    d.DesignationCode,
                    d.Title,
                    d.GradeLevel,
                    d.IsActive,
                    d.CreatedAt,
                    EmployeeCount = _context.Employees.Count(e => e.DesignationId == d.Id && !e.IsDeleted)
                })
                .OrderBy(d => d.Title)
                .ToListAsync();

            return Ok(new { success = true, data = designations });
        }

        [HttpPost]
        [Authorize(Policy = "RequireHRAdmin")]
        public async Task<IActionResult> UpsertDesignation([FromBody] UpsertDesignationDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Title))
                return BadRequest(new { success = false, message = "Designation Title is required." });

            Designation? designation = null;
            if (dto.Id.HasValue)
                designation = await _context.Designations.FirstOrDefaultAsync(d => d.Id == dto.Id.Value && !d.IsDeleted);

            if (designation == null)
            {
                designation = new Designation
                {
                    DesignationCode = "TEMP",
                    Title = dto.Title.Trim(),
                    GradeLevel = dto.GradeLevel?.Trim()
                };
                _context.Designations.Add(designation);
                await _context.SaveChangesAsync();

                // Auto-generate display code G0001
                designation.DesignationCode = $"G{designation.Id:D4}";
            }
            else
            {
                designation.Title = dto.Title.Trim();
                designation.GradeLevel = dto.GradeLevel?.Trim();
                designation.UpdatedAt = IstDateTime.Now;
            }

            await _context.SaveChangesAsync();
            return Ok(new { success = true, data = designation, message = "Designation saved successfully." });
        }

        [HttpDelete("{id}")]
        [Authorize(Policy = "RequireHRAdmin")]
        public async Task<IActionResult> DeleteDesignation(int id)
        {
            var designation = await _context.Designations.FirstOrDefaultAsync(d => d.Id == id && !d.IsDeleted);
            if (designation == null)
                return NotFound(new { success = false, message = "Designation not found." });

            designation.IsDeleted = true;
            designation.UpdatedAt = IstDateTime.Now;

            await _context.SaveChangesAsync();
            return Ok(new { success = true, message = "Designation deleted successfully." });
        }
    }
}
