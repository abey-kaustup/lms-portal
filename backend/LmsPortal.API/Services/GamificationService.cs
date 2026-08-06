using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using LmsPortal.API.Data;
using LmsPortal.Core.Entities;

namespace LmsPortal.API.Services
{
    public interface IGamificationService
    {
        Task EnsureTablesExistAsync();
        Task TriggerLessonCompletionAsync(int employeeId, int lessonId);
        Task TriggerAssessmentSubmitAsync(int employeeId, int assessmentId, decimal scorePercentage, bool passed);
        Task TriggerCertificateGeneratedAsync(int employeeId, int certificateId);
        Task RecalculateAllGamificationAsync();
        string GetBadgeForPoints(int points);
    }

    public class GamificationService : IGamificationService
    {
        private readonly LmsDbContext _context;

        public GamificationService(LmsDbContext context)
        {
            _context = context;
        }

        public async Task EnsureTablesExistAsync()
        {
            try
            {
                var sql = @"
                IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'lms') EXEC('CREATE SCHEMA lms');

                IF OBJECT_ID('lms.EmployeeGamification', 'U') IS NULL
                BEGIN
                    CREATE TABLE lms.EmployeeGamification (
                        Id INT IDENTITY(1,1) PRIMARY KEY,
                        EmployeeId INT NOT NULL FOREIGN KEY REFERENCES emp.Employees(Id),
                        TotalPoints INT NOT NULL DEFAULT 0,
                        CurrentRank INT NOT NULL DEFAULT 0,
                        PreviousRank INT NOT NULL DEFAULT 0,
                        Badge NVARCHAR(50) NOT NULL DEFAULT 'Learner',
                        LessonsCompleted INT NOT NULL DEFAULT 0,
                        CoursesCompleted INT NOT NULL DEFAULT 0,
                        AvgAssessmentScore DECIMAL(5,2) NOT NULL DEFAULT 0.00,
                        CurrentStreak INT NOT NULL DEFAULT 0,
                        LongestStreak INT NOT NULL DEFAULT 0,
                        LastActivityAt DATETIME2 NULL,
                        CreatedAt DATETIME2 NOT NULL DEFAULT DATEADD(MINUTE, 330, SYSUTCDATETIME()),
                        UpdatedAt DATETIME2 NOT NULL DEFAULT DATEADD(MINUTE, 330, SYSUTCDATETIME()),
                        CreatedBy NVARCHAR(100) NULL,
                        UpdatedBy NVARCHAR(100) NULL,
                        IsDeleted BIT NOT NULL DEFAULT 0,
                        RowVersion ROWVERSION NOT NULL
                    );
                END

                IF OBJECT_ID('lms.EmployeeAchievements', 'U') IS NULL
                BEGIN
                    CREATE TABLE lms.EmployeeAchievements (
                        Id INT IDENTITY(1,1) PRIMARY KEY,
                        EmployeeId INT NOT NULL FOREIGN KEY REFERENCES emp.Employees(Id),
                        AchievementType VARCHAR(50) NOT NULL,
                        PointsAwarded INT NOT NULL,
                        Title NVARCHAR(150) NOT NULL,
                        Description NVARCHAR(MAX) NULL,
                        EarnedAt DATETIME2 NOT NULL DEFAULT DATEADD(MINUTE, 330, SYSUTCDATETIME()),
                        CreatedAt DATETIME2 NOT NULL DEFAULT DATEADD(MINUTE, 330, SYSUTCDATETIME()),
                        UpdatedAt DATETIME2 NOT NULL DEFAULT DATEADD(MINUTE, 330, SYSUTCDATETIME()),
                        CreatedBy NVARCHAR(100) NULL,
                        UpdatedBy NVARCHAR(100) NULL,
                        IsDeleted BIT NOT NULL DEFAULT 0,
                        RowVersion ROWVERSION NOT NULL
                    );
                END

                IF OBJECT_ID('lms.LearningStreaks', 'U') IS NULL
                BEGIN
                    CREATE TABLE lms.LearningStreaks (
                        Id INT IDENTITY(1,1) PRIMARY KEY,
                        EmployeeId INT NOT NULL FOREIGN KEY REFERENCES emp.Employees(Id),
                        CurrentStreakDays INT NOT NULL DEFAULT 0,
                        LongestStreakDays INT NOT NULL DEFAULT 0,
                        LastActiveDate DATETIME2 NULL,
                        CreatedAt DATETIME2 NOT NULL DEFAULT DATEADD(MINUTE, 330, SYSUTCDATETIME()),
                        UpdatedAt DATETIME2 NOT NULL DEFAULT DATEADD(MINUTE, 330, SYSUTCDATETIME()),
                        CreatedBy NVARCHAR(100) NULL,
                        UpdatedBy NVARCHAR(100) NULL,
                        IsDeleted BIT NOT NULL DEFAULT 0,
                        RowVersion ROWVERSION NOT NULL
                    );
                END

                IF OBJECT_ID('lms.LeaderboardHistory', 'U') IS NULL
                BEGIN
                    CREATE TABLE lms.LeaderboardHistory (
                        Id INT IDENTITY(1,1) PRIMARY KEY,
                        EmployeeId INT NOT NULL FOREIGN KEY REFERENCES emp.Employees(Id),
                        SnapshotDate DATETIME2 NOT NULL DEFAULT DATEADD(MINUTE, 330, SYSUTCDATETIME()),
                        TotalPoints INT NOT NULL,
                        Rank INT NOT NULL,
                        Badge NVARCHAR(50) NOT NULL DEFAULT 'Learner',
                        CreatedAt DATETIME2 NOT NULL DEFAULT DATEADD(MINUTE, 330, SYSUTCDATETIME()),
                        UpdatedAt DATETIME2 NOT NULL DEFAULT DATEADD(MINUTE, 330, SYSUTCDATETIME()),
                        CreatedBy NVARCHAR(100) NULL,
                        UpdatedBy NVARCHAR(100) NULL,
                        IsDeleted BIT NOT NULL DEFAULT 0,
                        RowVersion ROWVERSION NOT NULL
                    );
                END";

                await _context.Database.ExecuteSqlRawAsync(sql);
            }
            catch
            {
                // Fallback to EF Core EnsureCreated if needed
            }
        }

        public string GetBadgeForPoints(int points)
        {
            if (points >= 3500) return "Legend";
            if (points >= 2001) return "Champion";
            if (points >= 1001) return "Achiever";
            if (points >= 501) return "Performer";
            return "Learner";
        }

        private async Task UpdateStreakAsync(int employeeId)
        {
            var today = IstDateTime.Now.Date;
            var streak = await _context.LearningStreaks.FirstOrDefaultAsync(s => s.EmployeeId == employeeId && !s.IsDeleted);

            if (streak == null)
            {
                streak = new LearningStreak
                {
                    EmployeeId = employeeId,
                    CurrentStreakDays = 1,
                    LongestStreakDays = 1,
                    LastActiveDate = today
                };
                _context.LearningStreaks.Add(streak);
            }
            else
            {
                if (streak.LastActiveDate.HasValue)
                {
                    var lastDate = streak.LastActiveDate.Value.Date;
                    var diffDays = (today - lastDate).Days;

                    if (diffDays == 1)
                    {
                        streak.CurrentStreakDays += 1;
                        if (streak.CurrentStreakDays > streak.LongestStreakDays)
                        {
                            streak.LongestStreakDays = streak.CurrentStreakDays;
                        }
                    }
                    else if (diffDays > 1)
                    {
                        streak.CurrentStreakDays = 1;
                    }
                    // diffDays == 0: already logged activity today, do not increment streak again
                }
                else
                {
                    streak.CurrentStreakDays = 1;
                    streak.LongestStreakDays = Math.Max(1, streak.LongestStreakDays);
                }

                streak.LastActiveDate = today;
                streak.UpdatedAt = IstDateTime.Now;
            }

            await _context.SaveChangesAsync();

            // Check for streak bonus achievements
            if (streak.CurrentStreakDays == 7)
            {
                var existingBonus = await _context.EmployeeAchievements
                    .AnyAsync(a => a.EmployeeId == employeeId && a.AchievementType == "STREAK_7_BONUS" && a.EarnedAt.Date == today);
                if (!existingBonus)
                {
                    _context.EmployeeAchievements.Add(new EmployeeAchievement
                    {
                        EmployeeId = employeeId,
                        AchievementType = "STREAK_7_BONUS",
                        PointsAwarded = 200,
                        Title = "7-Day Streak Bonus 🔥",
                        Description = "Maintained a 7-day learning streak!",
                        EarnedAt = IstDateTime.Now
                    });
                }
            }
            else if (streak.CurrentStreakDays == 30)
            {
                var existingBonus = await _context.EmployeeAchievements
                    .AnyAsync(a => a.EmployeeId == employeeId && a.AchievementType == "STREAK_30_BONUS" && a.EarnedAt.Date == today);
                if (!existingBonus)
                {
                    _context.EmployeeAchievements.Add(new EmployeeAchievement
                    {
                        EmployeeId = employeeId,
                        AchievementType = "STREAK_30_BONUS",
                        PointsAwarded = 500,
                        Title = "30-Day Streak Bonus 👑",
                        Description = "Achieved an incredible 30-day learning streak!",
                        EarnedAt = IstDateTime.Now
                    });
                }
            }

            await _context.SaveChangesAsync();
        }

        public async Task TriggerLessonCompletionAsync(int employeeId, int lessonId)
        {
            await UpdateStreakAsync(employeeId);

            // Award Lesson Completion (+20 pts)
            var achievementKey = $"LESSON_{lessonId}";
            var existingAchievement = await _context.EmployeeAchievements
                .FirstOrDefaultAsync(a => a.EmployeeId == employeeId && a.AchievementType == "LESSON_COMPLETED" && a.Title.Contains(achievementKey));

            if (existingAchievement == null)
            {
                _context.EmployeeAchievements.Add(new EmployeeAchievement
                {
                    EmployeeId = employeeId,
                    AchievementType = "LESSON_COMPLETED",
                    PointsAwarded = 20,
                    Title = $"Lesson Completed ({achievementKey})",
                    Description = "Completed lesson material",
                    EarnedAt = IstDateTime.Now
                });
                await _context.SaveChangesAsync();
            }

            // Check if course completed
            var course = await _context.Courses
                .Include(c => c.Modules)
                    .ThenInclude(m => m.Lessons)
                .FirstOrDefaultAsync(c => !c.IsDeleted);

            if (course != null)
            {
                var totalLessons = course.Modules.SelectMany(m => m.Lessons).Where(l => !l.IsDeleted).Select(l => l.Id).ToList();
                var completedLessonsCount = await _context.LessonProgresses
                    .Where(lp => lp.EmployeeId == employeeId && lp.IsCompleted && !lp.IsDeleted)
                    .Select(lp => lp.LessonId)
                    .Distinct()
                    .CountAsync();

                if (totalLessons.Count > 0 && completedLessonsCount >= totalLessons.Count)
                {
                    var courseAchievement = await _context.EmployeeAchievements
                        .FirstOrDefaultAsync(a => a.EmployeeId == employeeId && a.AchievementType == "COURSE_COMPLETED");

                    if (courseAchievement == null)
                    {
                        _context.EmployeeAchievements.Add(new EmployeeAchievement
                        {
                            EmployeeId = employeeId,
                            AchievementType = "COURSE_COMPLETED",
                            PointsAwarded = 100,
                            Title = "Course Completed 🎓",
                            Description = $"Completed all lessons in course: {course.Title}",
                            EarnedAt = IstDateTime.Now
                        });
                        await _context.SaveChangesAsync();
                    }
                }
            }

            await SyncEmployeeGamificationAsync(employeeId);
        }

        public async Task TriggerAssessmentSubmitAsync(int employeeId, int assessmentId, decimal scorePercentage, bool passed)
        {
            await UpdateStreakAsync(employeeId);

            // Score points (+1 pt per %)
            int scorePoints = (int)Math.Round(scorePercentage);
            if (scorePoints > 0)
            {
                _context.EmployeeAchievements.Add(new EmployeeAchievement
                {
                    EmployeeId = employeeId,
                    AchievementType = "ASSESSMENT_SCORE",
                    PointsAwarded = scorePoints,
                    Title = $"Assessment Score ({scorePercentage:F0}%)",
                    Description = $"Scored {scorePercentage:F0}% on assessment",
                    EarnedAt = IstDateTime.Now
                });
            }

            // Passed points (+150 pts)
            if (passed)
            {
                _context.EmployeeAchievements.Add(new EmployeeAchievement
                {
                    EmployeeId = employeeId,
                    AchievementType = "ASSESSMENT_PASSED",
                    PointsAwarded = 150,
                    Title = "Assessment Passed ⭐",
                    Description = $"Passed assessment with score {scorePercentage:F0}%",
                    EarnedAt = IstDateTime.Now
                });
            }

            // Perfect Score Bonus (+100 pts)
            if (scorePercentage >= 100.00m)
            {
                _context.EmployeeAchievements.Add(new EmployeeAchievement
                {
                    EmployeeId = employeeId,
                    AchievementType = "PERFECT_SCORE_BONUS",
                    PointsAwarded = 100,
                    Title = "Perfect Score Bonus 🎯",
                    Description = "Achieved 100% on assessment!",
                    EarnedAt = IstDateTime.Now
                });
            }

            await _context.SaveChangesAsync();
            await SyncEmployeeGamificationAsync(employeeId);
        }

        public async Task TriggerCertificateGeneratedAsync(int employeeId, int certificateId)
        {
            await UpdateStreakAsync(employeeId);

            var existingCert = await _context.EmployeeAchievements
                .AnyAsync(a => a.EmployeeId == employeeId && a.AchievementType == "CERTIFICATE_GENERATED");

            if (!existingCert)
            {
                _context.EmployeeAchievements.Add(new EmployeeAchievement
                {
                    EmployeeId = employeeId,
                    AchievementType = "CERTIFICATE_GENERATED",
                    PointsAwarded = 250,
                    Title = "Certificate Earned 📜",
                    Description = "Official LMS Certificate generated",
                    EarnedAt = IstDateTime.Now
                });
                await _context.SaveChangesAsync();
            }

            await SyncEmployeeGamificationAsync(employeeId);
        }

        private async Task SyncEmployeeGamificationAsync(int employeeId)
        {
            var totalPoints = await _context.EmployeeAchievements
                .Where(a => a.EmployeeId == employeeId && !a.IsDeleted)
                .SumAsync(a => a.PointsAwarded);

            var lessonsCompletedCount = await _context.LessonProgresses
                .Where(lp => lp.EmployeeId == employeeId && lp.IsCompleted && !lp.IsDeleted)
                .Select(lp => lp.LessonId)
                .Distinct()
                .CountAsync();

            var attempts = await _context.AssessmentAttempts
                .Where(aa => aa.EmployeeId == employeeId && !aa.IsDeleted)
                .ToListAsync();

            decimal avgScore = attempts.Count > 0 ? attempts.Average(a => a.ScorePercentage) : 0.00m;

            var courseCompleted = attempts.Any(a => a.Passed) || await _context.Certificates.AnyAsync(c => c.EmployeeId == employeeId && !c.IsDeleted);
            int coursesCompletedCount = courseCompleted ? 1 : 0;

            var streak = await _context.LearningStreaks.FirstOrDefaultAsync(s => s.EmployeeId == employeeId && !s.IsDeleted);
            int currentStreak = streak?.CurrentStreakDays ?? 0;
            int longestStreak = streak?.LongestStreakDays ?? 0;

            var gamification = await _context.EmployeeGamifications
                .FirstOrDefaultAsync(g => g.EmployeeId == employeeId && !g.IsDeleted);

            var newBadge = GetBadgeForPoints(totalPoints);

            if (gamification == null)
            {
                gamification = new EmployeeGamification
                {
                    EmployeeId = employeeId,
                    TotalPoints = totalPoints,
                    CurrentRank = 0,
                    PreviousRank = 0,
                    Badge = newBadge,
                    LessonsCompleted = lessonsCompletedCount,
                    CoursesCompleted = coursesCompletedCount,
                    AvgAssessmentScore = Math.Round(avgScore, 2),
                    CurrentStreak = currentStreak,
                    LongestStreak = longestStreak,
                    LastActivityAt = IstDateTime.Now
                };
                _context.EmployeeGamifications.Add(gamification);
            }
            else
            {
                gamification.TotalPoints = totalPoints;
                gamification.Badge = newBadge;
                gamification.LessonsCompleted = lessonsCompletedCount;
                gamification.CoursesCompleted = coursesCompletedCount;
                gamification.AvgAssessmentScore = Math.Round(avgScore, 2);
                gamification.CurrentStreak = currentStreak;
                gamification.LongestStreak = longestStreak;
                gamification.LastActivityAt = IstDateTime.Now;
                gamification.UpdatedAt = IstDateTime.Now;
            }

            await _context.SaveChangesAsync();
            await RecalculateRanksAsync();
        }

        public async Task RecalculateAllGamificationAsync()
        {
            await EnsureTablesExistAsync();
            var employees = await _context.Employees.Where(e => !e.IsDeleted).ToListAsync();
            foreach (var emp in employees)
            {
                await SyncEmployeeGamificationAsync(emp.Id);
            }
            await RecalculateRanksAsync();
        }

        private async Task RecalculateRanksAsync()
        {
            var allGamifications = await _context.EmployeeGamifications
                .Where(g => !g.IsDeleted)
                .OrderByDescending(g => g.TotalPoints)
                .ThenByDescending(g => g.AvgAssessmentScore)
                .ThenByDescending(g => g.CoursesCompleted)
                .ToListAsync();

            int rank = 1;
            foreach (var g in allGamifications)
            {
                if (g.CurrentRank != rank)
                {
                    g.PreviousRank = g.CurrentRank == 0 ? rank : g.CurrentRank;
                    g.CurrentRank = rank;
                    g.UpdatedAt = IstDateTime.Now;
                }
                rank++;
            }

            await _context.SaveChangesAsync();
        }
    }
}
