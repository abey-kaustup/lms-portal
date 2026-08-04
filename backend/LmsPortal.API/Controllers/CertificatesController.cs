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
    public class CertificatesController : ControllerBase
    {
        private readonly LmsDbContext _context;

        public CertificatesController(LmsDbContext context)
        {
            _context = context;
        }

        [HttpGet("my-certificate")]
        [Authorize]
        public async Task<IActionResult> GetEmployeeCertificate()
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

            if (employee == null) return NotFound(new { success = false, message = "Employee not found." });

            var bestPassedAttempt = await _context.AssessmentAttempts
                .Where(a => a.EmployeeId == employee.Id && a.ScorePercentage >= 80.00m && !a.IsDeleted)
                .OrderByDescending(a => a.ScorePercentage)
                .FirstOrDefaultAsync();

            if (bestPassedAttempt == null)
            {
                return Ok(new { success = true, data = (object?)null, message = "Certificate not issued. Minimum 80% score required on final assessment." });
            }

            var certificate = await _context.Certificates
                .Include(c => c.Course)
                .FirstOrDefaultAsync(c => c.EmployeeId == employee.Id && !c.IsDeleted);

            if (certificate == null)
            {
                var course = await _context.Courses.FirstOrDefaultAsync(c => !c.IsDeleted);
                if (course != null)
                {
                    string certNo = $"CERT-{DateTime.UtcNow:yyyyMM}-{employee.EmployeeCode}-{Guid.NewGuid().ToString("N")[..6].ToUpper()}";
                    string verifyCode = $"VERIFY-{Guid.NewGuid().ToString("N")[..12].ToUpper()}";

                    certificate = new Certificate
                    {
                        EmployeeId = employee.Id,
                        CourseId = course.Id,
                        CertificateCode = $"T{employee.Id:D4}",
                        CertificateNumber = certNo,
                        VerificationCode = verifyCode,
                        VerificationUrl = $"/verify?cert={certNo}",
                        IssueDate = DateTime.UtcNow
                    };
                    _context.Certificates.Add(certificate);
                    await _context.SaveChangesAsync();

                    certificate = await _context.Certificates
                        .Include(c => c.Course)
                        .FirstOrDefaultAsync(c => c.Id == certificate.Id);
                }
            }

            if (certificate == null) return Ok(new { success = true, data = (object?)null });

            var result = new
            {
                id = certificate.Id.ToString(),
                certificateNumber = certificate.CertificateNumber,
                issueDate = certificate.IssueDate,
                qrVerificationCode = certificate.VerificationCode,
                employee = new
                {
                    id = employee.Id.ToString(),
                    employeeId = employee.EmployeeCode,
                    firstName = employee.FirstName,
                    lastName = employee.LastName,
                    department = employee.Department?.DepartmentName ?? employee.DepartmentCode,
                    designation = employee.Designation?.Title ?? employee.DesignationCode,
                    office = employee.Office?.OfficeName ?? employee.OfficeCode
                },
                course = new
                {
                    id = certificate.CourseId.ToString(),
                    title = certificate.Course?.Title ?? "Corporate Employee Induction Course",
                    code = certificate.Course?.CourseCode ?? "IND-2026"
                },
                passedAttempt = bestPassedAttempt != null ? new
                {
                    score = bestPassedAttempt.ScorePercentage,
                    submittedAt = bestPassedAttempt.SubmittedAt
                } : null
            };

            return Ok(new { success = true, data = result });
        }

        [HttpGet("verify/{certificateNumber}")]
        [AllowAnonymous]
        public async Task<IActionResult> VerifyCertificate(string certificateNumber)
        {
            var certificate = await _context.Certificates
                .Include(c => c.Employee)
                    .ThenInclude(e => e.Department)
                .Include(c => c.Course)
                .FirstOrDefaultAsync(c => c.CertificateNumber.ToLower() == certificateNumber.Trim().ToLower() && !c.IsDeleted);

            if (certificate == null) return NotFound(new { success = false, message = "Invalid or unverified certificate number." });

            var bestAttempt = await _context.AssessmentAttempts
                .Where(a => a.EmployeeId == certificate.EmployeeId && a.Passed && !a.IsDeleted)
                .OrderByDescending(a => a.ScorePercentage)
                .FirstOrDefaultAsync();

            var result = new
            {
                id = certificate.Id.ToString(),
                certificateNumber = certificate.CertificateNumber,
                issueDate = certificate.IssueDate,
                qrVerificationCode = certificate.VerificationCode,
                employee = new
                {
                    id = certificate.Employee.Id.ToString(),
                    employeeId = certificate.Employee.EmployeeCode,
                    firstName = certificate.Employee.FirstName,
                    lastName = certificate.Employee.LastName,
                    department = certificate.Employee.Department?.DepartmentName ?? certificate.Employee.DepartmentCode
                },
                course = new
                {
                    id = certificate.CourseId.ToString(),
                    title = certificate.Course?.Title ?? "Corporate Employee Induction Course",
                    code = certificate.Course?.CourseCode ?? "IND-2026"
                },
                passedAttempt = bestAttempt != null ? new
                {
                    score = bestAttempt.ScorePercentage,
                    submittedAt = bestAttempt.SubmittedAt
                } : null
            };

            return Ok(new { success = true, data = result });
        }
    }
}
