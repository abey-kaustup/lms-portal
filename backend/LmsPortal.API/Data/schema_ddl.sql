-- ====================================================================================
-- DATABASE: LMS-Portal
-- ARCHITECTURE: ASP.NET Core 9 Web API + EF Core + SQL Server 2022 / LocalDB
-- COMPLIANCE: SCIPL Elevate Corporate Induction LMS
-- STRUCTURE: Database --> Schemas --> Tables (Columns, Constraints, PK, FK, Indexes)
-- ====================================================================================

USE master;
GO

IF NOT EXISTS (SELECT 1 FROM sys.databases WHERE name = N'LMS-Portal')
BEGIN
    CREATE DATABASE [LMS-Portal];
END
GO

USE [LMS-Portal];
GO

-- ====================================================================================
-- 0. CLEANUP: DROP EXISTING FOREIGN KEYS AND TABLES (SAFE RE-RUNNABLE)
-- ====================================================================================
DECLARE @dropFKs NVARCHAR(MAX) = N'';

SELECT @dropFKs += N'ALTER TABLE [' + s.name + N'].[' + t.name + N'] DROP CONSTRAINT [' + fk.name + N'];' + CHAR(13)
FROM sys.foreign_keys fk
INNER JOIN sys.tables t ON fk.parent_object_id = t.object_id
INNER JOIN sys.schemas s ON t.schema_id = s.schema_id;

IF LEN(@dropFKs) > 0
BEGIN
    EXEC sp_executesql @dropFKs;
END
GO

IF OBJECT_ID('adm.AuditLogs', 'U') IS NOT NULL DROP TABLE adm.AuditLogs;
IF OBJECT_ID('adm.ActivityLogs', 'U') IS NOT NULL DROP TABLE adm.ActivityLogs;
IF OBJECT_ID('adm.ApplicationSettings', 'U') IS NOT NULL DROP TABLE adm.ApplicationSettings;

IF OBJECT_ID('cert.CertificateVerificationLogs', 'U') IS NOT NULL DROP TABLE cert.CertificateVerificationLogs;
IF OBJECT_ID('cert.Certificates', 'U') IS NOT NULL DROP TABLE cert.Certificates;

IF OBJECT_ID('eval.AssessmentAnswers', 'U') IS NOT NULL DROP TABLE eval.AssessmentAnswers;
IF OBJECT_ID('eval.AssessmentAttempts', 'U') IS NOT NULL DROP TABLE eval.AssessmentAttempts;
IF OBJECT_ID('eval.QuestionOptions', 'U') IS NOT NULL DROP TABLE eval.QuestionOptions;
IF OBJECT_ID('eval.AssessmentQuestions', 'U') IS NOT NULL DROP TABLE eval.AssessmentQuestions;
IF OBJECT_ID('eval.Assessments', 'U') IS NOT NULL DROP TABLE eval.Assessments;

IF OBJECT_ID('lms.LessonProgress', 'U') IS NOT NULL DROP TABLE lms.LessonProgress;
IF OBJECT_ID('lms.LessonFiles', 'U') IS NOT NULL DROP TABLE lms.LessonFiles;
IF OBJECT_ID('lms.Lessons', 'U') IS NOT NULL DROP TABLE lms.Lessons;
IF OBJECT_ID('lms.Modules', 'U') IS NOT NULL DROP TABLE lms.Modules;
IF OBJECT_ID('lms.Courses', 'U') IS NOT NULL DROP TABLE lms.Courses;

IF OBJECT_ID('emp.EmployeeNotifications', 'U') IS NOT NULL DROP TABLE emp.EmployeeNotifications;
IF OBJECT_ID('emp.EmployeeProfiles', 'U') IS NOT NULL DROP TABLE emp.EmployeeProfiles;
IF OBJECT_ID('emp.Employees', 'U') IS NOT NULL DROP TABLE emp.Employees;

IF OBJECT_ID('org.Designations', 'U') IS NOT NULL DROP TABLE org.Designations;
IF OBJECT_ID('org.Departments', 'U') IS NOT NULL DROP TABLE org.Departments;
IF OBJECT_ID('org.Offices', 'U') IS NOT NULL DROP TABLE org.Offices;

IF OBJECT_ID('sec.RefreshTokens', 'U') IS NOT NULL DROP TABLE sec.RefreshTokens;
IF OBJECT_ID('sec.EmployeeSessions', 'U') IS NOT NULL DROP TABLE sec.EmployeeSessions;
IF OBJECT_ID('sec.Users', 'U') IS NOT NULL DROP TABLE sec.Users;
IF OBJECT_ID('sec.RolePermissions', 'U') IS NOT NULL DROP TABLE sec.RolePermissions;
IF OBJECT_ID('sec.Permissions', 'U') IS NOT NULL DROP TABLE sec.Permissions;
IF OBJECT_ID('sec.Roles', 'U') IS NOT NULL DROP TABLE sec.Roles;
GO

-- ====================================================================================
-- 1. SCHEMAS CREATION
-- ====================================================================================
IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = N'sec') EXEC('CREATE SCHEMA [sec];');
IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = N'org') EXEC('CREATE SCHEMA [org];');
IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = N'emp') EXEC('CREATE SCHEMA [emp];');
IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = N'lms') EXEC('CREATE SCHEMA [lms];');
IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = N'eval') EXEC('CREATE SCHEMA [eval];');
IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = N'cert') EXEC('CREATE SCHEMA [cert];');
IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = N'adm') EXEC('CREATE SCHEMA [adm];');
GO

-- ====================================================================================
-- 2. TABLES CREATION BY SCHEMA
-- ====================================================================================

-- ------------------------------------------------------------------------------------
-- SCHEMA: sec (Security & Authentication)
-- ------------------------------------------------------------------------------------

CREATE TABLE sec.Roles (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    RoleCode NVARCHAR(50) NOT NULL UNIQUE,
    RoleName NVARCHAR(100) NOT NULL,
    NormalizedRoleName NVARCHAR(100) NOT NULL UNIQUE,
    Description NVARCHAR(250) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NULL,
    CreatedBy NVARCHAR(100) NULL,
    UpdatedBy NVARCHAR(100) NULL,
    RowVersion ROWVERSION NOT NULL
);

CREATE TABLE sec.Permissions (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    PermissionCode NVARCHAR(100) NOT NULL UNIQUE,
    PermissionName NVARCHAR(150) NOT NULL,
    Category NVARCHAR(50) NOT NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NULL,
    CreatedBy NVARCHAR(100) NULL,
    UpdatedBy NVARCHAR(100) NULL,
    RowVersion ROWVERSION NOT NULL
);

CREATE TABLE sec.RolePermissions (
    RoleId INT NOT NULL,
    PermissionId INT NOT NULL,
    PRIMARY KEY (RoleId, PermissionId),
    CONSTRAINT FK_RolePermissions_Roles FOREIGN KEY (RoleId) REFERENCES sec.Roles(Id) ON DELETE CASCADE,
    CONSTRAINT FK_RolePermissions_Permissions FOREIGN KEY (PermissionId) REFERENCES sec.Permissions(Id) ON DELETE CASCADE
);

CREATE TABLE sec.Users (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    RoleId INT NOT NULL,
    Username NVARCHAR(100) NOT NULL UNIQUE,
    NormalizedUsername NVARCHAR(100) NOT NULL UNIQUE,
    Email NVARCHAR(150) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    LastLoginAt DATETIME2 NULL,
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NULL,
    CreatedBy NVARCHAR(100) NULL,
    UpdatedBy NVARCHAR(100) NULL,
    RowVersion ROWVERSION NOT NULL,
    CONSTRAINT FK_Users_Roles FOREIGN KEY (RoleId) REFERENCES sec.Roles(Id)
);

CREATE TABLE sec.EmployeeSessions (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL,
    SessionToken NVARCHAR(255) NOT NULL UNIQUE,
    IpAddress NVARCHAR(45) NULL,
    UserAgent NVARCHAR(500) NULL,
    ExpiresAt DATETIME2 NOT NULL,
    IsRevoked BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_EmployeeSessions_Users FOREIGN KEY (UserId) REFERENCES sec.Users(Id) ON DELETE CASCADE
);

CREATE TABLE sec.RefreshTokens (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL,
    Token NVARCHAR(255) NOT NULL UNIQUE,
    ExpiresAt DATETIME2 NOT NULL,
    IsRevoked BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_RefreshTokens_Users FOREIGN KEY (UserId) REFERENCES sec.Users(Id) ON DELETE CASCADE
);

-- ------------------------------------------------------------------------------------
-- SCHEMA: org (Organization Hierarchy)
-- ------------------------------------------------------------------------------------

CREATE TABLE org.Offices (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    OfficeCode NVARCHAR(50) NOT NULL UNIQUE,
    OfficeName NVARCHAR(150) NOT NULL,
    City NVARCHAR(100) NOT NULL,
    State NVARCHAR(100) NOT NULL,
    Country NVARCHAR(100) NOT NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NULL,
    CreatedBy NVARCHAR(100) NULL,
    UpdatedBy NVARCHAR(100) NULL,
    RowVersion ROWVERSION NOT NULL
);

CREATE TABLE org.Departments (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    DepartmentCode NVARCHAR(50) NOT NULL UNIQUE,
    DepartmentName NVARCHAR(150) NOT NULL,
    Description NVARCHAR(250) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NULL,
    CreatedBy NVARCHAR(100) NULL,
    UpdatedBy NVARCHAR(100) NULL,
    RowVersion ROWVERSION NOT NULL
);

CREATE TABLE org.Designations (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    DesignationCode NVARCHAR(50) NOT NULL UNIQUE,
    Title NVARCHAR(150) NOT NULL,
    GradeLevel NVARCHAR(20) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NULL,
    CreatedBy NVARCHAR(100) NULL,
    UpdatedBy NVARCHAR(100) NULL,
    RowVersion ROWVERSION NOT NULL
);

-- ------------------------------------------------------------------------------------
-- SCHEMA: emp (Employee Management)
-- ------------------------------------------------------------------------------------

CREATE TABLE emp.Employees (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL UNIQUE,
    EmployeeCode NVARCHAR(50) NOT NULL UNIQUE,
    FirstName NVARCHAR(100) NOT NULL,
    LastName NVARCHAR(100) NOT NULL,
    MiddleName NVARCHAR(100) NULL,
    OfficialEmail NVARCHAR(150) NOT NULL UNIQUE,
    DepartmentId INT NOT NULL,
    DepartmentCode NVARCHAR(50) NOT NULL,
    DesignationId INT NOT NULL,
    DesignationCode NVARCHAR(50) NOT NULL,
    OfficeId INT NOT NULL,
    OfficeCode NVARCHAR(50) NOT NULL,
    JoiningDate DATETIME2 NOT NULL,
    EmploymentStatus NVARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    IsMasterTester BIT NOT NULL DEFAULT 0,
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NULL,
    CreatedBy NVARCHAR(100) NULL,
    UpdatedBy NVARCHAR(100) NULL,
    RowVersion ROWVERSION NOT NULL,
    CONSTRAINT FK_Employees_Users FOREIGN KEY (UserId) REFERENCES sec.Users(Id),
    CONSTRAINT FK_Employees_Departments FOREIGN KEY (DepartmentId) REFERENCES org.Departments(Id),
    CONSTRAINT FK_Employees_Designations FOREIGN KEY (DesignationId) REFERENCES org.Designations(Id),
    CONSTRAINT FK_Employees_Offices FOREIGN KEY (OfficeId) REFERENCES org.Offices(Id)
);

CREATE TABLE emp.EmployeeProfiles (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    EmployeeId INT NOT NULL UNIQUE,
    PhoneNumber NVARCHAR(20) NULL,
    PersonalEmail NVARCHAR(150) NULL,
    Address NVARCHAR(250) NULL,
    AvatarUrl NVARCHAR(500) NULL,
    CONSTRAINT FK_EmployeeProfiles_Employees FOREIGN KEY (EmployeeId) REFERENCES emp.Employees(Id) ON DELETE CASCADE
);

CREATE TABLE emp.EmployeeNotifications (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    EmployeeId INT NOT NULL,
    Title NVARCHAR(150) NOT NULL,
    Message NVARCHAR(500) NOT NULL,
    Type NVARCHAR(50) NOT NULL DEFAULT 'INFO',
    IsRead BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_EmployeeNotifications_Employees FOREIGN KEY (EmployeeId) REFERENCES emp.Employees(Id) ON DELETE CASCADE
);

-- ------------------------------------------------------------------------------------
-- SCHEMA: lms (Learning Management System)
-- ------------------------------------------------------------------------------------

CREATE TABLE lms.Courses (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    CourseCode NVARCHAR(50) NOT NULL UNIQUE,
    Title NVARCHAR(200) NOT NULL,
    Description NVARCHAR(1000) NULL,
    PassingScorePercentage DECIMAL(5,2) NOT NULL DEFAULT 80.00,
    IsPublished BIT NOT NULL DEFAULT 1,
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NULL,
    CreatedBy NVARCHAR(100) NULL,
    UpdatedBy NVARCHAR(100) NULL,
    RowVersion ROWVERSION NOT NULL
);

CREATE TABLE lms.Modules (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    CourseId INT NOT NULL,
    ModuleCode NVARCHAR(50) NOT NULL UNIQUE,
    Title NVARCHAR(200) NOT NULL,
    Description NVARCHAR(500) NULL,
    ModuleType NVARCHAR(50) NOT NULL DEFAULT 'COMMON',
    TargetDepartmentId INT NULL,
    SortOrder INT NOT NULL DEFAULT 1,
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NULL,
    CreatedBy NVARCHAR(100) NULL,
    UpdatedBy NVARCHAR(100) NULL,
    RowVersion ROWVERSION NOT NULL,
    CONSTRAINT FK_Modules_Courses FOREIGN KEY (CourseId) REFERENCES lms.Courses(Id),
    CONSTRAINT FK_Modules_TargetDepartment FOREIGN KEY (TargetDepartmentId) REFERENCES org.Departments(Id)
);

CREATE TABLE lms.Lessons (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    ModuleId INT NOT NULL,
    LessonCode NVARCHAR(50) NOT NULL UNIQUE,
    Title NVARCHAR(200) NOT NULL,
    Description NVARCHAR(500) NULL,
    ContentType NVARCHAR(50) NOT NULL DEFAULT 'VIDEO',
    MinDurationSeconds INT NOT NULL DEFAULT 120,
    SortOrder INT NOT NULL DEFAULT 1,
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NULL,
    CreatedBy NVARCHAR(100) NULL,
    UpdatedBy NVARCHAR(100) NULL,
    RowVersion ROWVERSION NOT NULL,
    CONSTRAINT FK_Lessons_Modules FOREIGN KEY (ModuleId) REFERENCES lms.Modules(Id) ON DELETE CASCADE
);

CREATE TABLE lms.LessonFiles (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    LessonId INT NOT NULL,
    FileName NVARCHAR(255) NOT NULL,
    FileType NVARCHAR(50) NOT NULL,
    MimeType NVARCHAR(100) NOT NULL,
    SharePointUrl NVARCHAR(1000) NOT NULL,
    FileSizeByte BIGINT NOT NULL DEFAULT 0,
    DurationSeconds INT NULL,
    DisplayOrder INT NOT NULL DEFAULT 1,
    IsPrimary BIT NOT NULL DEFAULT 1,
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NULL,
    CreatedBy NVARCHAR(100) NULL,
    UpdatedBy NVARCHAR(100) NULL,
    RowVersion ROWVERSION NOT NULL,
    CONSTRAINT FK_LessonFiles_Lessons FOREIGN KEY (LessonId) REFERENCES lms.Lessons(Id) ON DELETE CASCADE
);

CREATE TABLE lms.LessonProgress (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    EmployeeId INT NOT NULL,
    LessonId INT NOT NULL,
    WatchedSeconds DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    TotalSeconds DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    IsCompleted BIT NOT NULL DEFAULT 0,
    CompletedAt DATETIME2 NULL,
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NULL,
    CreatedBy NVARCHAR(100) NULL,
    UpdatedBy NVARCHAR(100) NULL,
    RowVersion ROWVERSION NOT NULL,
    CONSTRAINT FK_LessonProgress_Employees FOREIGN KEY (EmployeeId) REFERENCES emp.Employees(Id),
    CONSTRAINT FK_LessonProgress_Lessons FOREIGN KEY (LessonId) REFERENCES lms.Lessons(Id),
    CONSTRAINT UQ_Employee_Lesson UNIQUE (EmployeeId, LessonId)
);

-- ------------------------------------------------------------------------------------
-- SCHEMA: eval (Assessment & Evaluation)
-- ------------------------------------------------------------------------------------

CREATE TABLE eval.Assessments (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    CourseId INT NOT NULL UNIQUE,
    AssessmentCode NVARCHAR(50) NOT NULL UNIQUE,
    Title NVARCHAR(200) NOT NULL,
    TimeLimitMinutes INT NOT NULL DEFAULT 30,
    PassingScorePercentage DECIMAL(5,2) NOT NULL DEFAULT 80.00,
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NULL,
    CreatedBy NVARCHAR(100) NULL,
    UpdatedBy NVARCHAR(100) NULL,
    RowVersion ROWVERSION NOT NULL,
    CONSTRAINT FK_Assessments_Courses FOREIGN KEY (CourseId) REFERENCES lms.Courses(Id)
);

CREATE TABLE eval.AssessmentQuestions (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    AssessmentId INT NOT NULL,
    ModuleId INT NULL,
    QuestionText NVARCHAR(1000) NOT NULL,
    Explanation NVARCHAR(1000) NULL,
    Points DECIMAL(5,2) NOT NULL DEFAULT 1.00,
    SortOrder INT NOT NULL DEFAULT 1,
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NULL,
    CreatedBy NVARCHAR(100) NULL,
    UpdatedBy NVARCHAR(100) NULL,
    RowVersion ROWVERSION NOT NULL,
    CONSTRAINT FK_AssessmentQuestions_Assessments FOREIGN KEY (AssessmentId) REFERENCES eval.Assessments(Id) ON DELETE CASCADE,
    CONSTRAINT FK_AssessmentQuestions_Modules FOREIGN KEY (ModuleId) REFERENCES lms.Modules(Id)
);

CREATE TABLE eval.QuestionOptions (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    QuestionId INT NOT NULL,
    OptionText NVARCHAR(500) NOT NULL,
    IsCorrect BIT NOT NULL DEFAULT 0,
    SortOrder INT NOT NULL DEFAULT 1,
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NULL,
    CreatedBy NVARCHAR(100) NULL,
    UpdatedBy NVARCHAR(100) NULL,
    RowVersion ROWVERSION NOT NULL,
    CONSTRAINT FK_QuestionOptions_AssessmentQuestions FOREIGN KEY (QuestionId) REFERENCES eval.AssessmentQuestions(Id) ON DELETE CASCADE
);

CREATE TABLE eval.AssessmentAttempts (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    EmployeeId INT NOT NULL,
    AssessmentId INT NOT NULL,
    TotalQuestions INT NOT NULL,
    CorrectAnswersCount INT NOT NULL,
    ScorePercentage DECIMAL(5,2) NOT NULL,
    Passed BIT NOT NULL DEFAULT 0,
    TimeTakenSeconds INT NOT NULL DEFAULT 0,
    StartedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    SubmittedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NULL,
    CreatedBy NVARCHAR(100) NULL,
    UpdatedBy NVARCHAR(100) NULL,
    RowVersion ROWVERSION NOT NULL,
    CONSTRAINT FK_AssessmentAttempts_Employees FOREIGN KEY (EmployeeId) REFERENCES emp.Employees(Id),
    CONSTRAINT FK_AssessmentAttempts_Assessments FOREIGN KEY (AssessmentId) REFERENCES eval.Assessments(Id)
);

CREATE TABLE eval.AssessmentAnswers (
    AttemptId INT NOT NULL,
    QuestionId INT NOT NULL,
    SelectedOptionId INT NULL,
    IsCorrect BIT NOT NULL DEFAULT 0,
    PointsAwarded DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    PRIMARY KEY (AttemptId, QuestionId),
    CONSTRAINT FK_AssessmentAnswers_Attempts FOREIGN KEY (AttemptId) REFERENCES eval.AssessmentAttempts(Id) ON DELETE CASCADE,
    CONSTRAINT FK_AssessmentAnswers_Questions FOREIGN KEY (QuestionId) REFERENCES eval.AssessmentQuestions(Id)
);

-- ------------------------------------------------------------------------------------
-- SCHEMA: cert (Certification & Verification)
-- ------------------------------------------------------------------------------------

CREATE TABLE cert.Certificates (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    EmployeeId INT NOT NULL,
    CourseId INT NOT NULL,
    CertificateCode NVARCHAR(50) NOT NULL UNIQUE,
    CertificateNumber NVARCHAR(100) NOT NULL UNIQUE,
    VerificationCode NVARCHAR(100) NOT NULL UNIQUE,
    VerificationUrl NVARCHAR(500) NOT NULL,
    PdfPath NVARCHAR(500) NULL,
    QRCode NVARCHAR(MAX) NULL,
    IssueDate DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    Status NVARCHAR(50) NOT NULL DEFAULT 'ISSUED',
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NULL,
    CreatedBy NVARCHAR(100) NULL,
    UpdatedBy NVARCHAR(100) NULL,
    RowVersion ROWVERSION NOT NULL,
    CONSTRAINT FK_Certificates_Employees FOREIGN KEY (EmployeeId) REFERENCES emp.Employees(Id),
    CONSTRAINT FK_Certificates_Courses FOREIGN KEY (CourseId) REFERENCES lms.Courses(Id),
    CONSTRAINT UQ_Employee_Course_Cert UNIQUE (EmployeeId, CourseId)
);

CREATE TABLE cert.CertificateVerificationLogs (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    CertificateId INT NOT NULL,
    VerifiedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    IpAddress NVARCHAR(45) NULL,
    UserAgent NVARCHAR(500) NULL,
    CONSTRAINT FK_CertVerificationLogs_Certificates FOREIGN KEY (CertificateId) REFERENCES cert.Certificates(Id) ON DELETE CASCADE
);

-- ------------------------------------------------------------------------------------
-- SCHEMA: adm (Administration & Audit)
-- ------------------------------------------------------------------------------------

CREATE TABLE adm.ApplicationSettings (
    SettingKey NVARCHAR(100) PRIMARY KEY,
    SettingValue NVARCHAR(MAX) NOT NULL,
    Category NVARCHAR(50) NOT NULL DEFAULT 'GENERAL',
    Description NVARCHAR(250) NULL,
    UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

CREATE TABLE adm.ActivityLogs (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NULL,
    Role NVARCHAR(50) NOT NULL DEFAULT 'SYSTEM',
    Action NVARCHAR(100) NOT NULL,
    Details NVARCHAR(MAX) NULL,
    IpAddress NVARCHAR(45) NULL,
    UserAgent NVARCHAR(500) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

CREATE TABLE adm.AuditLogs (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    EntityName NVARCHAR(100) NOT NULL,
    EntityId NVARCHAR(50) NOT NULL,
    Action NVARCHAR(50) NOT NULL,
    OldValues NVARCHAR(MAX) NULL,
    NewValues NVARCHAR(MAX) NULL,
    PerformedBy NVARCHAR(100) NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

-- ====================================================================================
-- 3. INDEXES FOR HIGH-PERFORMANCE QUERYING
-- ====================================================================================
CREATE INDEX IX_Employees_DepartmentId ON emp.Employees(DepartmentId);
CREATE INDEX IX_Employees_JoiningDate ON emp.Employees(JoiningDate);
CREATE INDEX IX_LessonProgress_EmployeeId_IsCompleted ON lms.LessonProgress(EmployeeId, IsCompleted);
CREATE INDEX IX_AssessmentAttempts_EmployeeId_SubmittedAt ON eval.AssessmentAttempts(EmployeeId, SubmittedAt DESC);
CREATE INDEX IX_Certificates_CertificateNumber ON cert.Certificates(CertificateNumber);
CREATE INDEX IX_ActivityLogs_CreatedAt ON adm.ActivityLogs(CreatedAt DESC);
GO
