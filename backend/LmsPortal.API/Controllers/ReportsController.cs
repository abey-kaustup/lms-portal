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
    public class ReportsController : ControllerBase
    {
        private readonly LmsDbContext _context;

        public ReportsController(LmsDbContext context)
        {
            _context = context;
        }

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboardStats()
        {
            var totalEmployees = await _context.Employees.CountAsync(e => !e.IsDeleted);
            var activeEmployees = await _context.Employees.CountAsync(e => !e.IsDeleted && e.EmploymentStatus == "ACTIVE");
            var certificatesCount = await _context.Certificates.CountAsync(c => !c.IsDeleted);
            var totalLessonsCount = await _context.Lessons.CountAsync(l => !l.IsDeleted);

            var attempts = await _context.AssessmentAttempts
                .Where(a => !a.IsDeleted)
                .Select(a => new { a.ScorePercentage, a.Passed })
                .ToListAsync();

            double avgAssessmentScore = 0;
            if (attempts.Any())
            {
                avgAssessmentScore = Math.Round((double)attempts.Average(a => a.ScorePercentage), 1);
            }

            var recentActivityLogs = await _context.ActivityLogs
                .OrderByDescending(a => a.CreatedAt)
                .Take(15)
                .Select(a => new
                {
                    a.Id,
                    a.Action,
                    a.Details,
                    a.Role,
                    a.CreatedAt,
                    employee = (object?)null,
                    hrUser = (object?)null
                })
                .ToListAsync();

            var departments = await _context.Departments
                .Where(d => !d.IsDeleted)
                .Select(d => new
                {
                    d.Id,
                    d.DepartmentCode,
                    d.DepartmentName,
                    d.Description,
                    employeeCount = d.Employees.Count(e => !e.IsDeleted),
                    moduleCount = d.Modules.Count(m => !m.IsDeleted)
                })
                .ToListAsync();

            return Ok(new
            {
                success = true,
                totalEmployees,
                activeEmployees,
                completedEmployeesCount = certificatesCount,
                pendingEmployeesCount = Math.Max(0, totalEmployees - certificatesCount),
                certificatesCount,
                avgAssessmentScore,
                recentActivityLogs,
                totalLessonsCount,
                departments
            });
        }

        [HttpGet("detailed")]
        public async Task<IActionResult> GetDetailedReport([FromQuery] string? departmentFilter = null)
        {
            var query = _context.Employees
                .Include(e => e.Department)
                .Include(e => e.Designation)
                .Include(e => e.Office)
                .Include(e => e.LessonProgresses.Where(lp => lp.IsCompleted && !lp.IsDeleted))
                .Include(e => e.AssessmentAttempts.Where(aa => !aa.IsDeleted))
                .Include(e => e.Certificates.Where(c => !c.IsDeleted))
                .Where(e => !e.IsDeleted);

            if (!string.IsNullOrWhiteSpace(departmentFilter) && departmentFilter != "ALL")
            {
                if (int.TryParse(departmentFilter, out int deptId))
                {
                    query = query.Where(e => e.DepartmentId == deptId);
                }
                else
                {
                    query = query.Where(e => e.Department.DepartmentName == departmentFilter || e.DepartmentCode == departmentFilter);
                }
            }

            var employees = await query.OrderBy(e => e.EmployeeCode).ToListAsync();

            var allModules = await _context.Modules
                .Include(m => m.Lessons.Where(l => !l.IsDeleted))
                .Where(m => !m.IsDeleted)
                .ToListAsync();

            var reportRows = employees.Select(emp =>
            {
                var assignedModules = allModules.Where(m =>
                    m.ModuleType == "COMMON" ||
                    (m.ModuleType == "DEPARTMENT" && m.TargetDepartmentId == emp.DepartmentId)
                ).ToList();

                int totalAssignedLessons = assignedModules.Sum(m => m.Lessons.Count);
                int completedLessonsCount = emp.LessonProgresses.Count;
                int progressPercent = totalAssignedLessons > 0
                    ? Math.Min(100, (int)Math.Round((double)completedLessonsCount / totalAssignedLessons * 100))
                    : 0;

                bool isCompleted = emp.Certificates.Any();
                int attemptsCount = emp.AssessmentAttempts.Count;
                double bestAttempt = attemptsCount > 0 ? (double)emp.AssessmentAttempts.Max(a => a.ScorePercentage) : 0;
                var lastAttempt = emp.AssessmentAttempts.OrderByDescending(a => a.SubmittedAt).FirstOrDefault();

                var joiningDate = emp.JoiningDate;
                var deadlineDate = joiningDate.AddDays(7);
                bool isOverdue = !isCompleted && DateTime.UtcNow > deadlineDate;
                int overdueDays = isOverdue ? Math.Max(1, (int)Math.Floor((DateTime.UtcNow - deadlineDate).TotalDays)) : 0;
                string complianceStatus = isCompleted ? "Completed" : isOverdue ? $"Overdue ({overdueDays}d)" : "On Track";

                return new
                {
                    id = emp.Id,
                    employeeId = emp.EmployeeCode,
                    name = $"{emp.FirstName} {emp.LastName}".Trim(),
                    department = emp.Department?.DepartmentName ?? emp.DepartmentCode,
                    designation = emp.Designation?.Title ?? emp.DesignationCode,
                    office = emp.Office?.OfficeName ?? emp.OfficeCode,
                    joiningDate = joiningDate.ToString("yyyy-MM-dd"),
                    deadlineDate = deadlineDate.ToString("yyyy-MM-dd"),
                    isOverdue,
                    overdueDays,
                    complianceStatus,
                    progressPercent,
                    completedLessonsCount,
                    totalLessons = totalAssignedLessons,
                    isCompleted,
                    attemptsCount,
                    hasAttempt = attemptsCount > 0,
                    bestScoreNum = attemptsCount > 0 ? (int?)Math.Round(bestAttempt) : null,
                    bestScore = attemptsCount > 0 ? $"{Math.Round(bestAttempt)}%" : "N/A",
                    lastAttemptDate = lastAttempt != null ? lastAttempt.SubmittedAt.ToString("yyyy-MM-dd") : "N/A",
                    certificateStatus = isCompleted ? "Issued" : "Pending"
                };
            }).ToList();

            return Ok(new { success = true, data = reportRows });
        }

        [HttpPost("send-reminder/{employeeId}")]
        [Authorize(Policy = "RequireHRAdmin")]
        public async Task<IActionResult> SendReminder(string employeeId)
        {
            Employee? emp = null;
            if (int.TryParse(employeeId, out int id))
            {
                emp = await _context.Employees.FirstOrDefaultAsync(e => e.Id == id && !e.IsDeleted);
            }
            if (emp == null)
            {
                emp = await _context.Employees.FirstOrDefaultAsync(e => e.EmployeeCode == employeeId && !e.IsDeleted);
            }

            if (emp == null) return NotFound(new { success = false, message = "Employee not found." });

            var deadline = emp.JoiningDate.AddDays(7);
            int overdueDays = Math.Max(0, (int)Math.Floor((DateTime.UtcNow - deadline).TotalDays));

            _context.ActivityLogs.Add(new ActivityLog
            {
                UserId = emp.UserId,
                Role = "HR_ADMIN",
                Action = "OVERDUE_REMINDER_SENT",
                Details = $"Sent automated 7-day induction overdue reminder to {emp.EmployeeCode} ({emp.FirstName} {emp.LastName}). Overdue Days: {overdueDays}.",
                CreatedAt = DateTime.UtcNow
            });
            await _context.SaveChangesAsync();

            return Ok(new
            {
                success = true,
                message = $"Overdue reminder sent successfully to {emp.FirstName} {emp.LastName} ({emp.EmployeeCode})."
            });
        }

        [HttpPost("send-overdue-reminders-bulk")]
        [Authorize(Policy = "RequireHRAdmin")]
        public async Task<IActionResult> SendBulkOverdueReminders()
        {
            var allEmployees = await _context.Employees
                .Include(e => e.Certificates.Where(c => !c.IsDeleted))
                .Where(e => !e.IsDeleted)
                .ToListAsync();

            var overdueEmps = allEmployees
                .Where(e => !e.Certificates.Any() && DateTime.UtcNow > e.JoiningDate.AddDays(7))
                .ToList();

            foreach (var emp in overdueEmps)
            {
                int overdueDays = Math.Max(1, (int)Math.Floor((DateTime.UtcNow - emp.JoiningDate.AddDays(7)).TotalDays));
                _context.ActivityLogs.Add(new ActivityLog
                {
                    UserId = emp.UserId,
                    Role = "HR_ADMIN",
                    Action = "OVERDUE_REMINDER_SENT",
                    Details = $"Automated 7-Day Overdue Induction Reminder sent to {emp.EmployeeCode} ({emp.FirstName} {emp.LastName}). Overdue Days: {overdueDays}.",
                    CreatedAt = DateTime.UtcNow
                });
            }

            if (overdueEmps.Count > 0)
            {
                _context.ActivityLogs.Add(new ActivityLog
                {
                    Role = "HR_ADMIN",
                    Action = "BULK_REMINDERS_DISPATCHED",
                    Details = $"Automated Overdue Reminder Run: Sent induction reminders to {overdueEmps.Count} overdue employee(s).",
                    CreatedAt = DateTime.UtcNow
                });
                await _context.SaveChangesAsync();
            }

            return Ok(new
            {
                success = true,
                count = overdueEmps.Count,
                message = overdueEmps.Count > 0
                    ? $"Automated reminders dispatched to {overdueEmps.Count} overdue employee(s)."
                    : "No overdue employees found."
            });
        }
    }
}
