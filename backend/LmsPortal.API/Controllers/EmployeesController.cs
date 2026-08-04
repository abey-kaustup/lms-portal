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
    public class EmployeesController : ControllerBase
    {
        private readonly LmsDbContext _context;

        public EmployeesController(LmsDbContext context)
        {
            _context = context;
        }

        public class UpsertEmployeeDto
        {
            public int? Id { get; set; }
            public string EmployeeCode { get; set; } = string.Empty;
            public string FirstName { get; set; } = string.Empty;
            public string? MiddleName { get; set; }
            public string LastName { get; set; } = string.Empty;
            public string OfficialEmail { get; set; } = string.Empty;
            public int DepartmentId { get; set; }
            public int DesignationId { get; set; }
            public int OfficeId { get; set; }
            public DateTime JoiningDate { get; set; }
            public string? EmploymentStatus { get; set; }
            public bool IsMasterTester { get; set; }
        }

        [HttpGet]
        public async Task<IActionResult> GetEmployees(
            [FromQuery] string? search,
            [FromQuery] int? departmentId,
            [FromQuery] string? status,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10
        )
        {
            var query = _context.Employees
                .Include(e => e.Department)
                .Include(e => e.Designation)
                .Include(e => e.Office)
                .Where(e => !e.IsDeleted);

            if (!string.IsNullOrWhiteSpace(search))
            {
                var s = search.Trim().ToLower();
                query = query.Where(e =>
                    e.EmployeeCode.ToLower().Contains(s) ||
                    e.FirstName.ToLower().Contains(s) ||
                    e.LastName.ToLower().Contains(s) ||
                    e.OfficialEmail.ToLower().Contains(s)
                );
            }

            if (departmentId.HasValue)
                query = query.Where(e => e.DepartmentId == departmentId.Value);

            if (!string.IsNullOrWhiteSpace(status))
                query = query.Where(e => e.EmploymentStatus == status);

            var totalRecords = await query.CountAsync();
            var totalPages = (int)Math.Ceiling((double)totalRecords / pageSize);

            var employees = await query
                .OrderByDescending(e => e.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return Ok(new
            {
                success = true,
                data = employees,
                page,
                pageSize,
                totalPages,
                totalRecords
            });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetEmployeeById(int id)
        {
            var employee = await _context.Employees
                .Include(e => e.Department)
                .Include(e => e.Designation)
                .Include(e => e.Office)
                .Include(e => e.LessonProgresses)
                .Include(e => e.AssessmentAttempts)
                .Include(e => e.Certificates)
                .FirstOrDefaultAsync(e => e.Id == id && !e.IsDeleted);

            if (employee == null)
                return NotFound(new { success = false, message = "Employee not found." });

            return Ok(new { success = true, data = employee });
        }

        [HttpPost]
        [Authorize(Policy = "RequireHRAdmin")]
        public async Task<IActionResult> UpsertEmployee([FromBody] UpsertEmployeeDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.EmployeeCode) || string.IsNullOrWhiteSpace(dto.FirstName) || string.IsNullOrWhiteSpace(dto.LastName) || string.IsNullOrWhiteSpace(dto.OfficialEmail))
                return BadRequest(new { success = false, message = "Employee Code, First Name, Last Name, and Official Email are required." });

            var cleanEmpCode = dto.EmployeeCode.Trim().ToUpper();
            var cleanEmail = dto.OfficialEmail.Trim().ToLower();

            // 1. Check for Duplicate Employee Code (HTTP 409 Conflict)
            var duplicateCode = await _context.Employees.AnyAsync(e =>
                !e.IsDeleted &&
                e.EmployeeCode.ToUpper() == cleanEmpCode &&
                (!dto.Id.HasValue || e.Id != dto.Id.Value));

            if (duplicateCode)
            {
                return StatusCode(StatusCodes.Status409Conflict, new
                {
                    success = false,
                    message = "Employee Code already exists."
                });
            }

            // 2. Check for Duplicate Official Email (HTTP 409 Conflict)
            var duplicateEmail = await _context.Employees.AnyAsync(e =>
                !e.IsDeleted &&
                e.OfficialEmail.ToLower() == cleanEmail &&
                (!dto.Id.HasValue || e.Id != dto.Id.Value));

            if (duplicateEmail)
            {
                return StatusCode(StatusCodes.Status409Conflict, new
                {
                    success = false,
                    message = "Official Email already exists."
                });
            }

            // 3. Verify Foreign Keys (HTTP 404 Not Found) & Retrieve Display Codes
            var dept = await _context.Departments.FirstOrDefaultAsync(d => d.Id == dto.DepartmentId && !d.IsDeleted);
            if (dept == null)
                return NotFound(new { success = false, message = "Department not found." });

            var desig = await _context.Designations.FirstOrDefaultAsync(d => d.Id == dto.DesignationId && !d.IsDeleted);
            if (desig == null)
                return NotFound(new { success = false, message = "Designation not found." });

            var office = await _context.Offices.FirstOrDefaultAsync(o => o.Id == dto.OfficeId && !o.IsDeleted);
            if (office == null)
                return NotFound(new { success = false, message = "Office location not found." });

            var employeeRole = await _context.Roles.FirstOrDefaultAsync(r => r.NormalizedRoleName == "EMPLOYEE");
            int roleId = employeeRole?.Id ?? 2;

            Employee? employee = null;
            if (dto.Id.HasValue)
                employee = await _context.Employees.FirstOrDefaultAsync(e => e.Id == dto.Id.Value && !e.IsDeleted);

            if (employee == null)
            {
                // Create New User for ASP.NET Identity link
                var user = new User
                {
                    Username = cleanEmpCode,
                    NormalizedUsername = cleanEmpCode,
                    Email = cleanEmail,
                    NormalizedEmail = cleanEmail.ToUpper(),
                    PasswordHash = "AQAAAAIAAYagAAAAEGx2yH8aKz8w9b5c...",
                    RoleId = roleId
                };
                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                // Create Employee
                employee = new Employee
                {
                    UserId = user.Id,
                    EmployeeCode = cleanEmpCode,
                    FirstName = dto.FirstName.Trim(),
                    MiddleName = dto.MiddleName?.Trim(),
                    LastName = dto.LastName.Trim(),
                    OfficialEmail = cleanEmail,
                    DepartmentId = dept.Id,
                    DepartmentCode = dept.DepartmentCode,
                    DesignationId = desig.Id,
                    DesignationCode = desig.DesignationCode,
                    OfficeId = office.Id,
                    OfficeCode = office.OfficeCode,
                    JoiningDate = dto.JoiningDate,
                    EmploymentStatus = dto.EmploymentStatus ?? "ACTIVE",
                    IsMasterTester = dto.IsMasterTester
                };
                _context.Employees.Add(employee);
            }
            else
            {
                // Update Existing Employee
                employee.EmployeeCode = cleanEmpCode;
                employee.FirstName = dto.FirstName.Trim();
                employee.MiddleName = dto.MiddleName?.Trim();
                employee.LastName = dto.LastName.Trim();
                employee.OfficialEmail = cleanEmail;
                employee.DepartmentId = dept.Id;
                employee.DepartmentCode = dept.DepartmentCode;
                employee.DesignationId = desig.Id;
                employee.DesignationCode = desig.DesignationCode;
                employee.OfficeId = office.Id;
                employee.OfficeCode = office.OfficeCode;
                employee.JoiningDate = dto.JoiningDate;
                if (!string.IsNullOrWhiteSpace(dto.EmploymentStatus)) employee.EmploymentStatus = dto.EmploymentStatus;
                employee.IsMasterTester = dto.IsMasterTester;
                employee.UpdatedAt = IstDateTime.Now;
            }

            await _context.SaveChangesAsync();
            return Ok(new
            {
                success = true,
                data = new
                {
                    id = employee.Id,
                    employeeCode = employee.EmployeeCode,
                    firstName = employee.FirstName,
                    lastName = employee.LastName,
                    officialEmail = employee.OfficialEmail,
                    departmentId = employee.DepartmentId,
                    designationId = employee.DesignationId,
                    officeId = employee.OfficeId,
                    joiningDate = employee.JoiningDate,
                    employmentStatus = employee.EmploymentStatus,
                    isMasterTester = employee.IsMasterTester
                },
                message = "Employee saved successfully."
            });
        }

        [HttpPatch("{id}/toggle-status")]
        [Authorize(Policy = "RequireHRAdmin")]
        public async Task<IActionResult> ToggleEmployeeStatus(int id)
        {
            var employee = await _context.Employees.FirstOrDefaultAsync(e => e.Id == id && !e.IsDeleted);
            if (employee == null)
                return NotFound(new { success = false, message = "Employee not found." });

            employee.EmploymentStatus = employee.EmploymentStatus == "ACTIVE" ? "INACTIVE" : "ACTIVE";
            employee.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(new { success = true, data = employee, message = $"Employee status set to {employee.EmploymentStatus}." });
        }

        [HttpDelete("{id}")]
        [Authorize(Policy = "RequireHRAdmin")]
        public async Task<IActionResult> DeleteEmployee(int id)
        {
            var employee = await _context.Employees.FirstOrDefaultAsync(e => e.Id == id && !e.IsDeleted);
            if (employee == null)
                return NotFound(new { success = false, message = "Employee not found." });

            employee.IsDeleted = true;
            employee.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(new { success = true, message = "Employee deleted successfully." });
        }
    }
}
