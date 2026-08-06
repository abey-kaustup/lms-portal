using System;

namespace LmsPortal.Core.Entities
{
    public class EmployeeGamification : BaseAuditableEntity
    {
        public int EmployeeId { get; set; }
        public int TotalPoints { get; set; } = 0;
        public int CurrentRank { get; set; } = 0;
        public int PreviousRank { get; set; } = 0;
        public string Badge { get; set; } = "Learner"; // Learner | Performer | Achiever | Champion | Legend
        public int LessonsCompleted { get; set; } = 0;
        public int CoursesCompleted { get; set; } = 0;
        public decimal AvgAssessmentScore { get; set; } = 0.00m;
        public int CurrentStreak { get; set; } = 0;
        public int LongestStreak { get; set; } = 0;
        public DateTime? LastActivityAt { get; set; }

        public Employee Employee { get; set; } = null!;
    }

    public class EmployeeAchievement : BaseAuditableEntity
    {
        public int EmployeeId { get; set; }
        public string AchievementType { get; set; } = string.Empty; // LESSON_COMPLETED, ASSESSMENT_PASSED, COURSE_COMPLETED, CERTIFICATE_GENERATED, PERFECT_SCORE_BONUS, STREAK_7_BONUS, STREAK_30_BONUS
        public int PointsAwarded { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime EarnedAt { get; set; } = IstDateTime.Now;

        public Employee Employee { get; set; } = null!;
    }

    public class LearningStreak : BaseAuditableEntity
    {
        public int EmployeeId { get; set; }
        public int CurrentStreakDays { get; set; } = 0;
        public int LongestStreakDays { get; set; } = 0;
        public DateTime? LastActiveDate { get; set; }

        public Employee Employee { get; set; } = null!;
    }

    public class LeaderboardHistory : BaseAuditableEntity
    {
        public int EmployeeId { get; set; }
        public DateTime SnapshotDate { get; set; } = IstDateTime.Now;
        public int TotalPoints { get; set; }
        public int Rank { get; set; }
        public string Badge { get; set; } = "Learner";

        public Employee Employee { get; set; } = null!;
    }
}
