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
    public class DepartmentsController : ControllerBase
    {
        private readonly LmsDbContext _context;

        public DepartmentsController(LmsDbContext context)
        {
            _context = context;
        }

        public record UpsertDepartmentDto(int? Id, string DepartmentName, string? DepartmentCode, string? Description);

        [HttpGet]
        public async Task<IActionResult> GetDepartments()
        {
            var departments = await _context.Departments
                .Where(d => !d.IsDeleted)
                .Select(d => new
                {
                    d.Id,
                    d.DepartmentName,
                    d.DepartmentCode,
                    d.Description,
                    d.CreatedAt,
                    d.UpdatedAt,
                    EmployeeCount = _context.Employees.Count(e => e.DepartmentId == d.Id && !e.IsDeleted),
                    ModuleCount = _context.Modules.Count(m => m.TargetDepartmentId == d.Id && !m.IsDeleted)
                })
                .OrderBy(d => d.DepartmentName)
                .ToListAsync();

            return Ok(new { success = true, data = departments });
        }

        [HttpPost]
        [Authorize(Policy = "RequireHRAdmin")]
        public async Task<IActionResult> UpsertDepartment([FromBody] UpsertDepartmentDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.DepartmentName))
                return BadRequest(new { success = false, message = "Department Name is required." });

            Department? department = null;
            if (dto.Id.HasValue)
                department = await _context.Departments.FirstOrDefaultAsync(d => d.Id == dto.Id.Value && !d.IsDeleted);

            if (department == null)
            {
                department = new Department
                {
                    DepartmentName = dto.DepartmentName.Trim(),
                    DepartmentCode = "TEMP",
                    Description = dto.Description?.Trim()
                };
                _context.Departments.Add(department);
                await _context.SaveChangesAsync();

                // Auto-generate display code D0001
                department.DepartmentCode = $"D{department.Id:D4}";
            }
            else
            {
                department.DepartmentName = dto.DepartmentName.Trim();
                if (!string.IsNullOrWhiteSpace(dto.DepartmentCode))
                    department.DepartmentCode = dto.DepartmentCode.Trim().ToUpper();
                department.Description = dto.Description?.Trim();
                department.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return Ok(new { success = true, data = department, message = "Department saved successfully." });
        }

        [HttpDelete("{id}")]
        [Authorize(Policy = "RequireHRAdmin")]
        public async Task<IActionResult> DeleteDepartment(int id)
        {
            var department = await _context.Departments.FirstOrDefaultAsync(d => d.Id == id && !d.IsDeleted);
            if (department == null)
                return NotFound(new { success = false, message = "Department not found." });

            department.IsDeleted = true;
            department.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(new { success = true, message = "Department deleted successfully." });
        }
    }
}
