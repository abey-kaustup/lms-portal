USE [LMS-Portal];
GO

IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'lms') EXEC('CREATE SCHEMA lms');
GO

-- 1. EmployeeGamification Table
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

    CREATE INDEX IX_EmployeeGamification_EmployeeId ON lms.EmployeeGamification(EmployeeId);
    CREATE INDEX IX_EmployeeGamification_TotalPoints ON lms.EmployeeGamification(TotalPoints DESC);
END
GO

-- 2. EmployeeAchievements Table
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

    CREATE INDEX IX_EmployeeAchievements_EmployeeId ON lms.EmployeeAchievements(EmployeeId);
END
GO

-- 3. LearningStreaks Table
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

    CREATE INDEX IX_LearningStreaks_EmployeeId ON lms.LearningStreaks(EmployeeId);
END
GO

-- 4. LeaderboardHistory Table
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

    CREATE INDEX IX_LeaderboardHistory_EmployeeId ON lms.LeaderboardHistory(EmployeeId);
END
GO
