using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LmsPortal.API.Data;
using LmsPortal.API.Services;
using LmsPortal.Core.Entities;

namespace LmsPortal.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class LeaderboardController : ControllerBase
    {
        private readonly LmsDbContext _context;
        private readonly IGamificationService _gamificationService;

        public LeaderboardController(LmsDbContext context, IGamificationService gamificationService)
        {
            _context = context;
            _gamificationService = gamificationService;
        }

        private async Task<Employee?> GetCurrentEmployeeAsync()
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(userIdStr, out int userId))
            {
                var emp = await _context.Employees
                    .Include(e => e.Department)
                    .Include(e => e.Designation)
                    .Include(e => e.Office)
                    .FirstOrDefaultAsync(e => e.UserId == userId && !e.IsDeleted);
                if (emp != null) return emp;
            }

            var empCode = User.FindFirst(ClaimTypes.Name)?.Value;
            if (!string.IsNullOrEmpty(empCode))
            {
                return await _context.Employees
                    .Include(e => e.Department)
                    .Include(e => e.Designation)
                    .Include(e => e.Office)
                    .FirstOrDefaultAsync(e => e.EmployeeCode == empCode && !e.IsDeleted);
            }

            return null;
        }

        [HttpGet("top10")]
        public async Task<IActionResult> GetTop10Leaderboard()
        {
            await _gamificationService.EnsureTablesExistAsync();
            var currentEmp = await GetCurrentEmployeeAsync();

            var top10List = await _context.EmployeeGamifications
                .Include(g => g.Employee)
                    .ThenInclude(e => e.Department)
                .Include(g => g.Employee)
                    .ThenInclude(e => e.Profile)
                .Where(g => !g.IsDeleted && !g.Employee.IsDeleted)
                .OrderBy(g => g.CurrentRank == 0 ? 999999 : g.CurrentRank)
                .ThenByDescending(g => g.TotalPoints)
                .Take(10)
                .Select(g => new
                {
                    rank = g.CurrentRank,
                    previousRank = g.PreviousRank,
                    employeeId = g.EmployeeId,
                    employeeCode = g.Employee.EmployeeCode,
                    employeeName = $"{g.Employee.FirstName} {g.Employee.LastName}",
                    department = g.Employee.Department.DepartmentName,
                    avatarUrl = g.Employee.Profile != null ? g.Employee.Profile.AvatarUrl : null,
                    totalPoints = g.TotalPoints,
                    coursesCompleted = g.CoursesCompleted,
                    avgAssessmentScore = g.AvgAssessmentScore,
                    badge = g.Badge,
                    isCurrentUser = currentEmp != null && g.EmployeeId == currentEmp.Id
                })
                .ToListAsync();

            object? currentUserRow = null;

            if (currentEmp != null && !top10List.Any(x => x.employeeId == currentEmp.Id))
            {
                var myGamification = await _context.EmployeeGamifications
                    .Include(g => g.Employee)
                        .ThenInclude(e => e.Department)
                    .Include(g => g.Employee)
                        .ThenInclude(e => e.Profile)
                    .FirstOrDefaultAsync(g => g.EmployeeId == currentEmp.Id && !g.IsDeleted);

                if (myGamification != null)
                {
                    currentUserRow = new
                    {
                        rank = myGamification.CurrentRank,
                        previousRank = myGamification.PreviousRank,
                        employeeId = myGamification.EmployeeId,
                        employeeCode = myGamification.Employee.EmployeeCode,
                        employeeName = $"{myGamification.Employee.FirstName} {myGamification.Employee.LastName}",
                        department = myGamification.Employee.Department.DepartmentName,
                        avatarUrl = myGamification.Employee.Profile != null ? myGamification.Employee.Profile.AvatarUrl : null,
                        totalPoints = myGamification.TotalPoints,
                        coursesCompleted = myGamification.CoursesCompleted,
                        avgAssessmentScore = myGamification.AvgAssessmentScore,
                        badge = myGamification.Badge,
                        isCurrentUser = true
                    };
                }
            }

            return Ok(new
            {
                success = true,
                top10 = top10List,
                currentUser = currentUserRow
            });
        }

        [HttpGet("top20")]
        public async Task<IActionResult> GetTop20Leaderboard(
            [FromQuery] int? departmentId,
            [FromQuery] int? officeId,
            [FromQuery] int? joiningYear,
            [FromQuery] string? sortBy = "points", // points | score | courses | department | office
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20
        )
        {
            await _gamificationService.EnsureTablesExistAsync();
            var query = _context.EmployeeGamifications
                .Include(g => g.Employee)
                    .ThenInclude(e => e.Department)
                .Include(g => g.Employee)
                    .ThenInclude(e => e.Office)
                .Include(g => g.Employee)
                    .ThenInclude(e => e.Designation)
                .Include(g => g.Employee)
                    .ThenInclude(e => e.Profile)
                .Where(g => !g.IsDeleted && !g.Employee.IsDeleted);

            if (departmentId.HasValue)
                query = query.Where(g => g.Employee.DepartmentId == departmentId.Value);

            if (officeId.HasValue)
                query = query.Where(g => g.Employee.OfficeId == officeId.Value);

            if (joiningYear.HasValue)
                query = query.Where(g => g.Employee.JoiningDate.Year == joiningYear.Value);

            query = sortBy?.ToLower() switch
            {
                "score" => query.OrderByDescending(g => g.AvgAssessmentScore).ThenByDescending(g => g.TotalPoints),
                "courses" => query.OrderByDescending(g => g.CoursesCompleted).ThenByDescending(g => g.TotalPoints),
                "department" => query.OrderBy(g => g.Employee.Department.DepartmentName).ThenByDescending(g => g.TotalPoints),
                "office" => query.OrderBy(g => g.Employee.Office.OfficeName).ThenByDescending(g => g.TotalPoints),
                _ => query.OrderBy(g => g.CurrentRank == 0 ? 999999 : g.CurrentRank).ThenByDescending(g => g.TotalPoints)
            };

            var totalRecords = await query.CountAsync();
            var totalPages = (int)Math.Ceiling((double)totalRecords / pageSize);

            var list = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(g => new
                {
                    rank = g.CurrentRank,
                    previousRank = g.PreviousRank,
                    employeeId = g.EmployeeId,
                    employeeCode = g.Employee.EmployeeCode,
                    employeeName = $"{g.Employee.FirstName} {g.Employee.LastName}",
                    department = g.Employee.Department.DepartmentName,
                    office = g.Employee.Office.OfficeName,
                    coursesCompleted = g.CoursesCompleted,
                    lessonsCompleted = g.LessonsCompleted,
                    avgAssessmentScore = g.AvgAssessmentScore,
                    totalPoints = g.TotalPoints,
                    badge = g.Badge,
                    currentStreak = g.CurrentStreak,
                    longestStreak = g.LongestStreak,
                    lastActivity = g.LastActivityAt != null ? g.LastActivityAt.Value.ToString("yyyy-MM-dd HH:mm") : "N/A"
                })
                .ToListAsync();

            return Ok(new
            {
                success = true,
                data = list,
                page,
                pageSize,
                totalPages,
                totalRecords
            });
        }

        [HttpGet("me")]
        public async Task<IActionResult> GetMyGamificationProfile()
        {
            var employee = await GetCurrentEmployeeAsync();
            if (employee == null) return NotFound(new { success = false, message = "Employee profile not found." });

            var gamification = await _context.EmployeeGamifications
                .FirstOrDefaultAsync(g => g.EmployeeId == employee.Id && !g.IsDeleted);

            var totalPoints = gamification?.TotalPoints ?? 0;
            var currentBadge = _gamificationService.GetBadgeForPoints(totalPoints);

            string nextBadge = "Legend";
            int pointsForNextBadge = 3500;
            int pointsNeeded = 0;
            double progressPercentage = 100;

            if (totalPoints < 500)
            {
                nextBadge = "Performer";
                pointsForNextBadge = 501;
                pointsNeeded = pointsForNextBadge - totalPoints;
                progressPercentage = (double)totalPoints / 501 * 100;
            }
            else if (totalPoints < 1000)
            {
                nextBadge = "Achiever";
                pointsForNextBadge = 1001;
                pointsNeeded = pointsForNextBadge - totalPoints;
                progressPercentage = (double)(totalPoints - 500) / (1001 - 500) * 100;
            }
            else if (totalPoints < 2000)
            {
                nextBadge = "Champion";
                pointsForNextBadge = 2001;
                pointsNeeded = pointsForNextBadge - totalPoints;
                progressPercentage = (double)(totalPoints - 1000) / (2001 - 1000) * 100;
            }
            else if (totalPoints < 3500)
            {
                nextBadge = "Legend";
                pointsForNextBadge = 3500;
                pointsNeeded = pointsForNextBadge - totalPoints;
                progressPercentage = (double)(totalPoints - 2000) / (3500 - 2000) * 100;
            }

            var streak = await _context.LearningStreaks
                .FirstOrDefaultAsync(s => s.EmployeeId == employee.Id && !s.IsDeleted);

            var recentAchievements = await _context.EmployeeAchievements
                .Where(a => a.EmployeeId == employee.Id && !a.IsDeleted)
                .OrderByDescending(a => a.EarnedAt)
                .Take(5)
                .Select(a => new
                {
                    id = a.Id,
                    type = a.AchievementType,
                    points = a.PointsAwarded,
                    title = a.Title,
                    description = a.Description,
                    earnedAt = a.EarnedAt.ToString("yyyy-MM-dd HH:mm")
                })
                .ToListAsync();

            return Ok(new
            {
                success = true,
                profile = new
                {
                    rank = gamification?.CurrentRank ?? 0,
                    previousRank = gamification?.PreviousRank ?? 0,
                    totalPoints,
                    badge = currentBadge,
                    nextBadge,
                    pointsNeededForNextBadge = Math.Max(0, pointsNeeded),
                    progressPercentage = Math.Min(100.0, Math.Round(progressPercentage, 1)),
                    lessonsCompleted = gamification?.LessonsCompleted ?? 0,
                    coursesCompleted = gamification?.CoursesCompleted ?? 0,
                    avgAssessmentScore = gamification?.AvgAssessmentScore ?? 0,
                    currentStreak = streak?.CurrentStreakDays ?? 0,
                    longestStreak = streak?.LongestStreakDays ?? 0
                },
                recentAchievements
            });
        }

        [HttpGet("dashboard-cards")]
        public async Task<IActionResult> GetDashboardHighlightCards()
        {
            var topScorer = await _context.EmployeeGamifications
                .Include(g => g.Employee)
                .Where(g => !g.IsDeleted && !g.Employee.IsDeleted)
                .OrderByDescending(g => g.TotalPoints)
                .Select(g => new
                {
                    name = $"{g.Employee.FirstName} {g.Employee.LastName}",
                    code = g.Employee.EmployeeCode,
                    value = $"{g.TotalPoints} pts"
                })
                .FirstOrDefaultAsync();

            var mostCourses = await _context.EmployeeGamifications
                .Include(g => g.Employee)
                .Where(g => !g.IsDeleted && !g.Employee.IsDeleted)
                .OrderByDescending(g => g.CoursesCompleted)
                .ThenByDescending(g => g.TotalPoints)
                .Select(g => new
                {
                    name = $"{g.Employee.FirstName} {g.Employee.LastName}",
                    code = g.Employee.EmployeeCode,
                    value = $"{g.CoursesCompleted} Courses"
                })
                .FirstOrDefaultAsync();

            var highestAssessment = await _context.EmployeeGamifications
                .Include(g => g.Employee)
                .Where(g => !g.IsDeleted && !g.Employee.IsDeleted)
                .OrderByDescending(g => g.AvgAssessmentScore)
                .ThenByDescending(g => g.TotalPoints)
                .Select(g => new
                {
                    name = $"{g.Employee.FirstName} {g.Employee.LastName}",
                    code = g.Employee.EmployeeCode,
                    value = $"{g.AvgAssessmentScore:F0}% Score"
                })
                .FirstOrDefaultAsync();

            var longestStreak = await _context.LearningStreaks
                .Include(s => s.Employee)
                .Where(s => !s.IsDeleted && !s.Employee.IsDeleted)
                .OrderByDescending(s => s.LongestStreakDays)
                .Select(s => new
                {
                    name = $"{s.Employee.FirstName} {s.Employee.LastName}",
                    code = s.Employee.EmployeeCode,
                    value = $"{s.LongestStreakDays} Days Streak"
                })
                .FirstOrDefaultAsync();

            var fastestCompletion = await _context.AssessmentAttempts
                .Include(a => a.Employee)
                .Where(a => !a.IsDeleted && a.Passed && !a.Employee.IsDeleted)
                .OrderBy(a => a.TimeTakenSeconds)
                .Select(a => new
                {
                    name = $"{a.Employee.FirstName} {a.Employee.LastName}",
                    code = a.Employee.EmployeeCode,
                    value = $"{a.TimeTakenSeconds / 60}m {a.TimeTakenSeconds % 60}s"
                })
                .FirstOrDefaultAsync();

            return Ok(new
            {
                success = true,
                cards = new
                {
                    highestScorer = topScorer ?? new { name = "N/A", code = "-", value = "0 pts" },
                    mostCoursesCompleted = mostCourses ?? new { name = "N/A", code = "-", value = "0 Courses" },
                    highestAssessmentScore = highestAssessment ?? new { name = "N/A", code = "-", value = "0%" },
                    longestStreak = longestStreak ?? new { name = "N/A", code = "-", value = "0 Days" },
                    fastestCompletion = fastestCompletion ?? new { name = "N/A", code = "-", value = "0s" }
                }
            });
        }

        [HttpPost("recalculate")]
        [Authorize(Policy = "RequireHRAdmin")]
        public async Task<IActionResult> RecalculateLeaderboard()
        {
            await _gamificationService.RecalculateAllGamificationAsync();
            return Ok(new { success = true, message = "Leaderboard recalculated successfully." });
        }
    }
}
