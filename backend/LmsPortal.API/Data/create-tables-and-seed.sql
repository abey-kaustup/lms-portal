-- ============================================================
-- LMS Portal Enterprise - Full Schema + Seed Data
-- Target: LMS-Portal (SQL Server at 192.168.2.5)
-- Run this in: SQL Server Management Studio
-- ============================================================

USE [LMS-Portal];
GO

-- ============================================================
-- STEP 1: Create Schemas (if not already existing)
-- ===================================a=========================
IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'org')  EXEC('CREATE SCHEMA org');
IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'sec')  EXEC('CREATE SCHEMA sec');
IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'emp')  EXEC('CREATE SCHEMA emp');
IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'lms')  EXEC('CREATE SCHEMA lms');
IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'eval') EXEC('CREATE SCHEMA eval');
IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'cert') EXEC('CREATE SCHEMA cert');
IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'adm')  EXEC('CREATE SCHEMA adm');
GO

-- ============================================================
-- STEP 2: Organization Tables
-- ============================================================

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA='org' AND TABLE_NAME='Offices')
CREATE TABLE org.Offices (
    Id              UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID() PRIMARY KEY,
    OfficeCode      NVARCHAR(20)     NOT NULL,
    OfficeName      NVARCHAR(200)    NOT NULL,
    City            NVARCHAR(100)    NOT NULL,
    State           NVARCHAR(100)    NOT NULL,
    Country         NVARCHAR(100)    NOT NULL DEFAULT 'India',
    IsActive        BIT              NOT NULL DEFAULT 1,
    CreatedAt       DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt       DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy       NVARCHAR(100)    NULL,
    UpdatedBy       NVARCHAR(100)    NULL,
    IsDeleted       BIT              NOT NULL DEFAULT 0,
    RowVersion      ROWVERSION       NOT NULL
);
GO

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA='org' AND TABLE_NAME='Departments')
CREATE TABLE org.Departments (
    Id              UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID() PRIMARY KEY,
    DepartmentCode  NVARCHAR(20)     NOT NULL,
    DepartmentName  NVARCHAR(200)    NOT NULL,
    Description     NVARCHAR(500)    NULL,
    IsActive        BIT              NOT NULL DEFAULT 1,
    CreatedAt       DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt       DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy       NVARCHAR(100)    NULL,
    UpdatedBy       NVARCHAR(100)    NULL,
    IsDeleted       BIT              NOT NULL DEFAULT 0,
    RowVersion      ROWVERSION       NOT NULL
);
GO

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA='org' AND TABLE_NAME='Designations')
CREATE TABLE org.Designations (
    Id                  UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID() PRIMARY KEY,
    DesignationCode     NVARCHAR(20)     NOT NULL,
    Title               NVARCHAR(200)    NOT NULL,
    GradeLevel          NVARCHAR(50)     NULL,
    IsActive            BIT              NOT NULL DEFAULT 1,
    CreatedAt           DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt           DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy           NVARCHAR(100)    NULL,
    UpdatedBy           NVARCHAR(100)    NULL,
    IsDeleted           BIT              NOT NULL DEFAULT 0,
    RowVersion          ROWVERSION       NOT NULL
);
GO

-- ============================================================
-- STEP 3: Security Tables
-- ============================================================

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA='sec' AND TABLE_NAME='Roles')
CREATE TABLE sec.Roles (
    Id                  UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID() PRIMARY KEY,
    RoleName            NVARCHAR(100)    NOT NULL,
    NormalizedRoleName  NVARCHAR(100)    NOT NULL,
    Description         NVARCHAR(500)    NULL,
    CreatedAt           DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt           DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy           NVARCHAR(100)    NULL,
    UpdatedBy           NVARCHAR(100)    NULL,
    IsDeleted           BIT              NOT NULL DEFAULT 0,
    RowVersion          ROWVERSION       NOT NULL
);
GO

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA='sec' AND TABLE_NAME='Permissions')
CREATE TABLE sec.Permissions (
    Id              UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID() PRIMARY KEY,
    PermissionKey   NVARCHAR(100)    NOT NULL,
    ModuleName      NVARCHAR(100)    NOT NULL,
    Description     NVARCHAR(500)    NULL,
    CreatedAt       DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt       DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy       NVARCHAR(100)    NULL,
    UpdatedBy       NVARCHAR(100)    NULL,
    IsDeleted       BIT              NOT NULL DEFAULT 0,
    RowVersion      ROWVERSION       NOT NULL
);
GO

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA='sec' AND TABLE_NAME='RolePermissions')
CREATE TABLE sec.RolePermissions (
    RoleId          UNIQUEIDENTIFIER NOT NULL,
    PermissionId    UNIQUEIDENTIFIER NOT NULL,
    GrantedAt       DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    GrantedBy       NVARCHAR(100)    NULL,
    CONSTRAINT PK_RolePermissions PRIMARY KEY (RoleId, PermissionId),
    CONSTRAINT FK_RolePermissions_Roles       FOREIGN KEY (RoleId)       REFERENCES sec.Roles(Id),
    CONSTRAINT FK_RolePermissions_Permissions FOREIGN KEY (PermissionId) REFERENCES sec.Permissions(Id)
);
GO

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA='sec' AND TABLE_NAME='Users')
CREATE TABLE sec.Users (
    Id                  UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID() PRIMARY KEY,
    Username            NVARCHAR(100)    NOT NULL,
    NormalizedUsername  NVARCHAR(100)    NOT NULL,
    Email               NVARCHAR(256)    NOT NULL,
    NormalizedEmail     NVARCHAR(256)    NOT NULL,
    PasswordHash        NVARCHAR(MAX)    NOT NULL,
    SecurityStamp       NVARCHAR(100)    NOT NULL DEFAULT NEWID(),
    ConcurrencyStamp    NVARCHAR(100)    NOT NULL DEFAULT NEWID(),
    PhoneNumber         NVARCHAR(20)     NULL,
    IsEmailConfirmed    BIT              NOT NULL DEFAULT 1,
    IsActive            BIT              NOT NULL DEFAULT 1,
    RoleId              UNIQUEIDENTIFIER NOT NULL,
    CreatedAt           DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt           DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy           NVARCHAR(100)    NULL,
    UpdatedBy           NVARCHAR(100)    NULL,
    IsDeleted           BIT              NOT NULL DEFAULT 0,
    RowVersion          ROWVERSION       NOT NULL,
    CONSTRAINT FK_Users_Roles FOREIGN KEY (RoleId) REFERENCES sec.Roles(Id)
);
GO

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA='sec' AND TABLE_NAME='EmployeeSessions')
CREATE TABLE sec.EmployeeSessions (
    Id              UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID() PRIMARY KEY,
    UserId          UNIQUEIDENTIFIER NOT NULL,
    SessionToken    NVARCHAR(500)    NOT NULL,
    IpAddress       NVARCHAR(50)     NOT NULL,
    UserAgent       NVARCHAR(500)    NOT NULL,
    DeviceType      NVARCHAR(50)     NOT NULL DEFAULT 'Desktop',
    Browser         NVARCHAR(100)    NULL,
    IsActive        BIT              NOT NULL DEFAULT 1,
    LastActivityAt  DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    ExpiresAt       DATETIME2        NOT NULL,
    CreatedAt       DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt       DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy       NVARCHAR(100)    NULL,
    UpdatedBy       NVARCHAR(100)    NULL,
    IsDeleted       BIT              NOT NULL DEFAULT 0,
    RowVersion      ROWVERSION       NOT NULL,
    CONSTRAINT FK_EmployeeSessions_Users FOREIGN KEY (UserId) REFERENCES sec.Users(Id)
);
GO

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA='sec' AND TABLE_NAME='RefreshTokens')
CREATE TABLE sec.RefreshTokens (
    Id              UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID() PRIMARY KEY,
    UserId          UNIQUEIDENTIFIER NOT NULL,
    Token           NVARCHAR(500)    NOT NULL,
    ExpiresAt       DATETIME2        NOT NULL,
    IsRevoked       BIT              NOT NULL DEFAULT 0,
    RevokedAt       DATETIME2        NULL,
    ReplacedByToken NVARCHAR(500)    NULL,
    CreatedByIp     NVARCHAR(50)     NULL,
    CreatedAt       DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt       DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy       NVARCHAR(100)    NULL,
    UpdatedBy       NVARCHAR(100)    NULL,
    IsDeleted       BIT              NOT NULL DEFAULT 0,
    RowVersion      ROWVERSION       NOT NULL,
    CONSTRAINT FK_RefreshTokens_Users FOREIGN KEY (UserId) REFERENCES sec.Users(Id)
);
GO

-- ============================================================
-- STEP 4: Employee Tables
-- ============================================================

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA='emp' AND TABLE_NAME='Employees')
CREATE TABLE emp.Employees (
    Id                  UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID() PRIMARY KEY,
    UserId              UNIQUEIDENTIFIER NOT NULL,
    EmployeeCode        NVARCHAR(20)     NOT NULL,
    FirstName           NVARCHAR(100)    NOT NULL,
    MiddleName          NVARCHAR(100)    NULL,
    LastName            NVARCHAR(100)    NOT NULL,
    OfficialEmail       NVARCHAR(256)    NOT NULL,
    DepartmentId        UNIQUEIDENTIFIER NOT NULL,
    DesignationId       UNIQUEIDENTIFIER NOT NULL,
    OfficeId            UNIQUEIDENTIFIER NOT NULL,
    JoiningDate         DATE             NOT NULL,
    EmploymentStatus    NVARCHAR(20)     NOT NULL DEFAULT 'ACTIVE',
    IsMasterTester      BIT              NOT NULL DEFAULT 0,
    CreatedAt           DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt           DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy           NVARCHAR(100)    NULL,
    UpdatedBy           NVARCHAR(100)    NULL,
    IsDeleted           BIT              NOT NULL DEFAULT 0,
    RowVersion          ROWVERSION       NOT NULL,
    CONSTRAINT FK_Employees_Users        FOREIGN KEY (UserId)       REFERENCES sec.Users(Id),
    CONSTRAINT FK_Employees_Departments  FOREIGN KEY (DepartmentId) REFERENCES org.Departments(Id),
    CONSTRAINT FK_Employees_Designations FOREIGN KEY (DesignationId) REFERENCES org.Designations(Id),
    CONSTRAINT FK_Employees_Offices      FOREIGN KEY (OfficeId)     REFERENCES org.Offices(Id)
);
GO

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA='emp' AND TABLE_NAME='EmployeeProfiles')
CREATE TABLE emp.EmployeeProfiles (
    Id                      UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID() PRIMARY KEY,
    EmployeeId              UNIQUEIDENTIFIER NOT NULL,
    PhoneNumber             NVARCHAR(20)     NULL,
    EmergencyContactName    NVARCHAR(200)    NULL,
    EmergencyContactPhone   NVARCHAR(20)     NULL,
    BloodGroup              NVARCHAR(10)     NULL,
    AvatarUrl               NVARCHAR(500)    NULL,
    Bio                     NVARCHAR(1000)   NULL,
    CreatedAt               DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt               DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy               NVARCHAR(100)    NULL,
    UpdatedBy               NVARCHAR(100)    NULL,
    IsDeleted               BIT              NOT NULL DEFAULT 0,
    RowVersion              ROWVERSION       NOT NULL,
    CONSTRAINT FK_EmployeeProfiles_Employees FOREIGN KEY (EmployeeId) REFERENCES emp.Employees(Id)
);
GO

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA='emp' AND TABLE_NAME='EmployeeNotifications')
CREATE TABLE emp.EmployeeNotifications (
    Id                  UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID() PRIMARY KEY,
    EmployeeId          UNIQUEIDENTIFIER NOT NULL,
    Title               NVARCHAR(200)    NOT NULL,
    Message             NVARCHAR(2000)   NOT NULL,
    NotificationType    NVARCHAR(20)     NOT NULL DEFAULT 'INFO',
    IsRead              BIT              NOT NULL DEFAULT 0,
    ReadAt              DATETIME2        NULL,
    CreatedAt           DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt           DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy           NVARCHAR(100)    NULL,
    UpdatedBy           NVARCHAR(100)    NULL,
    IsDeleted           BIT              NOT NULL DEFAULT 0,
    RowVersion          ROWVERSION       NOT NULL,
    CONSTRAINT FK_EmployeeNotifications_Employees FOREIGN KEY (EmployeeId) REFERENCES emp.Employees(Id)
);
GO

-- ============================================================
-- STEP 5: LMS Tables (Courses, Modules, Lessons)
-- ============================================================

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA='lms' AND TABLE_NAME='Courses')
CREATE TABLE lms.Courses (
    Id                      UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID() PRIMARY KEY,
    CourseCode              NVARCHAR(20)     NOT NULL,
    Title                   NVARCHAR(300)    NOT NULL,
    Description             NVARCHAR(2000)   NULL,
    PassingScorePercentage  DECIMAL(5,2)     NOT NULL DEFAULT 80.00,
    IsPublished             BIT              NOT NULL DEFAULT 1,
    CreatedAt               DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt               DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy               NVARCHAR(100)    NULL,
    UpdatedBy               NVARCHAR(100)    NULL,
    IsDeleted               BIT              NOT NULL DEFAULT 0,
    RowVersion              ROWVERSION       NOT NULL
);
GO

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA='lms' AND TABLE_NAME='Modules')
CREATE TABLE lms.Modules (
    Id                  UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID() PRIMARY KEY,
    CourseId            UNIQUEIDENTIFIER NOT NULL,
    Title               NVARCHAR(300)    NOT NULL,
    Description         NVARCHAR(2000)   NULL,
    ModuleType          NVARCHAR(20)     NOT NULL DEFAULT 'COMMON',
    TargetDepartmentId  UNIQUEIDENTIFIER NULL,
    SortOrder           INT              NOT NULL DEFAULT 0,
    CreatedAt           DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt           DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy           NVARCHAR(100)    NULL,
    UpdatedBy           NVARCHAR(100)    NULL,
    IsDeleted           BIT              NOT NULL DEFAULT 0,
    RowVersion          ROWVERSION       NOT NULL,
    CONSTRAINT FK_Modules_Courses       FOREIGN KEY (CourseId)           REFERENCES lms.Courses(Id),
    CONSTRAINT FK_Modules_Departments   FOREIGN KEY (TargetDepartmentId) REFERENCES org.Departments(Id)
);
GO

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA='lms' AND TABLE_NAME='Lessons')
CREATE TABLE lms.Lessons (
    Id                  UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID() PRIMARY KEY,
    ModuleId            UNIQUEIDENTIFIER NOT NULL,
    Title               NVARCHAR(300)    NOT NULL,
    Description         NVARCHAR(2000)   NULL,
    ContentType         NVARCHAR(20)     NOT NULL DEFAULT 'VIDEO',
    SortOrder           INT              NOT NULL DEFAULT 0,
    MinDurationSeconds  INT              NOT NULL DEFAULT 0,
    CreatedAt           DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt           DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy           NVARCHAR(100)    NULL,
    UpdatedBy           NVARCHAR(100)    NULL,
    IsDeleted           BIT              NOT NULL DEFAULT 0,
    RowVersion          ROWVERSION       NOT NULL,
    CONSTRAINT FK_Lessons_Modules FOREIGN KEY (ModuleId) REFERENCES lms.Modules(Id)
);
GO

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA='lms' AND TABLE_NAME='LessonFiles')
CREATE TABLE lms.LessonFiles (
    Id              UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID() PRIMARY KEY,
    LessonId        UNIQUEIDENTIFIER NOT NULL,
    FileName        NVARCHAR(300)    NOT NULL,
    FileType        NVARCHAR(20)     NOT NULL,
    MimeType        NVARCHAR(100)    NOT NULL,
    SharePointUrl   NVARCHAR(1000)   NOT NULL,
    FileSizeByte    BIGINT           NOT NULL DEFAULT 0,
    DurationSeconds INT              NOT NULL DEFAULT 0,
    DisplayOrder    INT              NOT NULL DEFAULT 0,
    IsPrimary       BIT              NOT NULL DEFAULT 1,
    CreatedAt       DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt       DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy       NVARCHAR(100)    NULL,
    UpdatedBy       NVARCHAR(100)    NULL,
    IsDeleted       BIT              NOT NULL DEFAULT 0,
    RowVersion      ROWVERSION       NOT NULL,
    CONSTRAINT FK_LessonFiles_Lessons FOREIGN KEY (LessonId) REFERENCES lms.Lessons(Id)
);
GO

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA='lms' AND TABLE_NAME='LessonProgress')
CREATE TABLE lms.LessonProgress (
    Id              UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID() PRIMARY KEY,
    EmployeeId      UNIQUEIDENTIFIER NOT NULL,
    LessonId        UNIQUEIDENTIFIER NOT NULL,
    IsCompleted     BIT              NOT NULL DEFAULT 0,
    WatchedSeconds  DECIMAL(10,2)    NOT NULL DEFAULT 0.00,
    TotalSeconds    DECIMAL(10,2)    NOT NULL DEFAULT 0.00,
    CompletedAt     DATETIME2        NULL,
    CreatedAt       DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt       DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy       NVARCHAR(100)    NULL,
    UpdatedBy       NVARCHAR(100)    NULL,
    IsDeleted       BIT              NOT NULL DEFAULT 0,
    RowVersion      ROWVERSION       NOT NULL,
    CONSTRAINT FK_LessonProgress_Employees FOREIGN KEY (EmployeeId) REFERENCES emp.Employees(Id),
    CONSTRAINT FK_LessonProgress_Lessons   FOREIGN KEY (LessonId)   REFERENCES lms.Lessons(Id)
);
GO

-- ============================================================
-- STEP 6: Assessment Tables
-- ============================================================

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA='eval' AND TABLE_NAME='Assessments')
CREATE TABLE eval.Assessments (
    Id                      UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID() PRIMARY KEY,
    CourseId                UNIQUEIDENTIFIER NOT NULL,
    Title                   NVARCHAR(300)    NOT NULL,
    Description             NVARCHAR(2000)   NULL,
    TimeLimitMinutes        INT              NOT NULL DEFAULT 30,
    PassingScorePercentage  DECIMAL(5,2)     NOT NULL DEFAULT 80.00,
    IsPublished             BIT              NOT NULL DEFAULT 1,
    CreatedAt               DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt               DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy               NVARCHAR(100)    NULL,
    UpdatedBy               NVARCHAR(100)    NULL,
    IsDeleted               BIT              NOT NULL DEFAULT 0,
    RowVersion              ROWVERSION       NOT NULL,
    CONSTRAINT FK_Assessments_Courses FOREIGN KEY (CourseId) REFERENCES lms.Courses(Id)
);
GO

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA='eval' AND TABLE_NAME='AssessmentQuestions')
CREATE TABLE eval.AssessmentQuestions (
    Id              UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID() PRIMARY KEY,
    AssessmentId    UNIQUEIDENTIFIER NOT NULL,
    ModuleId        UNIQUEIDENTIFIER NULL,
    QuestionText    NVARCHAR(2000)   NOT NULL,
    Explanation     NVARCHAR(2000)   NULL,
    Points          DECIMAL(5,2)     NOT NULL DEFAULT 1.00,
    SortOrder       INT              NOT NULL DEFAULT 0,
    CreatedAt       DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt       DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy       NVARCHAR(100)    NULL,
    UpdatedBy       NVARCHAR(100)    NULL,
    IsDeleted       BIT              NOT NULL DEFAULT 0,
    RowVersion      ROWVERSION       NOT NULL,
    CONSTRAINT FK_AssessmentQuestions_Assessments FOREIGN KEY (AssessmentId) REFERENCES eval.Assessments(Id),
    CONSTRAINT FK_AssessmentQuestions_Modules     FOREIGN KEY (ModuleId)     REFERENCES lms.Modules(Id)
);
GO

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA='eval' AND TABLE_NAME='QuestionOptions')
CREATE TABLE eval.QuestionOptions (
    Id          UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID() PRIMARY KEY,
    QuestionId  UNIQUEIDENTIFIER NOT NULL,
    OptionText  NVARCHAR(1000)   NOT NULL,
    IsCorrect   BIT              NOT NULL DEFAULT 0,
    SortOrder   INT              NOT NULL DEFAULT 0,
    CreatedAt   DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt   DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy   NVARCHAR(100)    NULL,
    UpdatedBy   NVARCHAR(100)    NULL,
    IsDeleted   BIT              NOT NULL DEFAULT 0,
    RowVersion  ROWVERSION       NOT NULL,
    CONSTRAINT FK_QuestionOptions_Questions FOREIGN KEY (QuestionId) REFERENCES eval.AssessmentQuestions(Id)
);
GO

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA='eval' AND TABLE_NAME='AssessmentAttempts')
CREATE TABLE eval.AssessmentAttempts (
    Id                  UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID() PRIMARY KEY,
    EmployeeId          UNIQUEIDENTIFIER NOT NULL,
    AssessmentId        UNIQUEIDENTIFIER NOT NULL,
    ScorePercentage     DECIMAL(5,2)     NOT NULL DEFAULT 0.00,
    Passed              BIT              NOT NULL DEFAULT 0,
    TotalQuestions      INT              NOT NULL DEFAULT 0,
    CorrectAnswersCount INT              NOT NULL DEFAULT 0,
    TimeTakenSeconds    INT              NOT NULL DEFAULT 0,
    StartedAt           DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    SubmittedAt         DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    CreatedAt           DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt           DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy           NVARCHAR(100)    NULL,
    UpdatedBy           NVARCHAR(100)    NULL,
    IsDeleted           BIT              NOT NULL DEFAULT 0,
    RowVersion          ROWVERSION       NOT NULL,
    CONSTRAINT FK_AssessmentAttempts_Employees   FOREIGN KEY (EmployeeId)   REFERENCES emp.Employees(Id),
    CONSTRAINT FK_AssessmentAttempts_Assessments FOREIGN KEY (AssessmentId) REFERENCES eval.Assessments(Id)
);
GO

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA='eval' AND TABLE_NAME='AssessmentAnswers')
CREATE TABLE eval.AssessmentAnswers (
    AttemptId       UNIQUEIDENTIFIER NOT NULL,
    QuestionId      UNIQUEIDENTIFIER NOT NULL,
    SelectedOptionId UNIQUEIDENTIFIER NULL,
    IsCorrect       BIT              NOT NULL DEFAULT 0,
    PointsAwarded   DECIMAL(5,2)     NOT NULL DEFAULT 0.00,
    AnsweredAt      DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT PK_AssessmentAnswers PRIMARY KEY (AttemptId, QuestionId),
    CONSTRAINT FK_AssessmentAnswers_Attempts FOREIGN KEY (AttemptId)  REFERENCES eval.AssessmentAttempts(Id),
    CONSTRAINT FK_AssessmentAnswers_Questions FOREIGN KEY (QuestionId) REFERENCES eval.AssessmentQuestions(Id),
    CONSTRAINT FK_AssessmentAnswers_Options   FOREIGN KEY (SelectedOptionId) REFERENCES eval.QuestionOptions(Id)
);
GO

-- ============================================================
-- STEP 7: Certificate Tables
-- ============================================================

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA='cert' AND TABLE_NAME='Certificates')
CREATE TABLE cert.Certificates (
    Id                  UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID() PRIMARY KEY,
    EmployeeId          UNIQUEIDENTIFIER NOT NULL,
    CourseId            UNIQUEIDENTIFIER NOT NULL,
    CertificateNumber   NVARCHAR(50)     NOT NULL,
    VerificationCode    NVARCHAR(100)    NOT NULL,
    VerificationUrl     NVARCHAR(500)    NOT NULL,
    QRCode              NVARCHAR(MAX)    NULL,
    Status              NVARCHAR(20)     NOT NULL DEFAULT 'ISSUED',
    IssueDate           DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    GeneratedBy         NVARCHAR(100)    NOT NULL DEFAULT 'SYSTEM',
    PdfPath             NVARCHAR(500)    NULL,
    CreatedAt           DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt           DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy           NVARCHAR(100)    NULL,
    UpdatedBy           NVARCHAR(100)    NULL,
    IsDeleted           BIT              NOT NULL DEFAULT 0,
    RowVersion          ROWVERSION       NOT NULL,
    CONSTRAINT FK_Certificates_Employees FOREIGN KEY (EmployeeId) REFERENCES emp.Employees(Id),
    CONSTRAINT FK_Certificates_Courses   FOREIGN KEY (CourseId)   REFERENCES lms.Courses(Id)
);
GO

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA='cert' AND TABLE_NAME='CertificateVerificationLogs')
CREATE TABLE cert.CertificateVerificationLogs (
    Id              UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID() PRIMARY KEY,
    CertificateId   UNIQUEIDENTIFIER NOT NULL,
    VerifiedAt      DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    VerifierIpAddress NVARCHAR(50)   NOT NULL,
    UserAgent       NVARCHAR(500)    NULL,
    IsSuccessful    BIT              NOT NULL DEFAULT 1,
    CONSTRAINT FK_CertVerifLogs_Certificates FOREIGN KEY (CertificateId) REFERENCES cert.Certificates(Id)
);
GO

-- ============================================================
-- STEP 8: Administration Tables
-- ============================================================

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA='adm' AND TABLE_NAME='ApplicationSettings')
CREATE TABLE adm.ApplicationSettings (
    SettingKey      NVARCHAR(100)    NOT NULL PRIMARY KEY,
    SettingValue    NVARCHAR(MAX)    NOT NULL,
    Description     NVARCHAR(500)    NULL,
    Category        NVARCHAR(50)     NOT NULL DEFAULT 'GENERAL',
    UpdatedAt       DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    UpdatedBy       NVARCHAR(100)    NULL
);
GO

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA='adm' AND TABLE_NAME='ActivityLogs')
CREATE TABLE adm.ActivityLogs (
    Id          UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID() PRIMARY KEY,
    UserId      UNIQUEIDENTIFIER NULL,
    Role        NVARCHAR(50)     NOT NULL,
    Action      NVARCHAR(100)    NOT NULL,
    Details     NVARCHAR(2000)   NULL,
    IpAddress   NVARCHAR(50)     NULL,
    UserAgent   NVARCHAR(500)    NULL,
    CreatedAt   DATETIME2        NOT NULL DEFAULT GETUTCDATE()
);
GO

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA='adm' AND TABLE_NAME='AuditLogs')
CREATE TABLE adm.AuditLogs (
    Id              UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID() PRIMARY KEY,
    EntityName      NVARCHAR(100)    NOT NULL,
    EntityId        NVARCHAR(100)    NOT NULL,
    ActionType      NVARCHAR(50)     NOT NULL,
    OldValuesJSON   NVARCHAR(MAX)    NULL,
    NewValuesJSON   NVARCHAR(MAX)    NULL,
    ChangedBy       NVARCHAR(100)    NOT NULL,
    Timestamp       DATETIME2        NOT NULL DEFAULT GETUTCDATE()
);
GO

PRINT '✅ All tables created successfully!';
GO

-- ============================================================
-- STEP 9: SEED REFERENCE DATA
-- ============================================================

-- Seed Roles
IF NOT EXISTS (SELECT 1 FROM sec.Roles WHERE NormalizedRoleName = 'HR_ADMIN')
INSERT INTO sec.Roles (Id, RoleName, NormalizedRoleName, Description, CreatedBy)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'HR Administrator', 'HR_ADMIN',
    'Full access to HR operations, employee management, and LMS administration.',
    'SYSTEM'
);

IF NOT EXISTS (SELECT 1 FROM sec.Roles WHERE NormalizedRoleName = 'EMPLOYEE')
INSERT INTO sec.Roles (Id, RoleName, NormalizedRoleName, Description, CreatedBy)
VALUES (
    '22222222-2222-2222-2222-222222222222',
    'Employee', 'EMPLOYEE',
    'Employee access to learning portal, assessments, and certificates.',
    'SYSTEM'
);
GO

-- Seed Offices
IF NOT EXISTS (SELECT 1 FROM org.Offices WHERE OfficeCode = 'HQ001')
INSERT INTO org.Offices (Id, OfficeCode, OfficeName, City, State, Country, CreatedBy)
VALUES (
    'AAAA0001-0001-0001-0001-000000000001',
    'HQ001', 'Corporate Headquarters', 'Mumbai', 'Maharashtra', 'India', 'SYSTEM'
);

IF NOT EXISTS (SELECT 1 FROM org.Offices WHERE OfficeCode = 'DEL001')
INSERT INTO org.Offices (Id, OfficeCode, OfficeName, City, State, Country, CreatedBy)
VALUES (
    'AAAA0001-0001-0001-0001-000000000002',
    'DEL001', 'Delhi Regional Office', 'New Delhi', 'Delhi', 'India', 'SYSTEM'
);
GO

-- Seed Departments
IF NOT EXISTS (SELECT 1 FROM org.Departments WHERE DepartmentCode = 'IT')
INSERT INTO org.Departments (Id, DepartmentCode, DepartmentName, Description, CreatedBy)
VALUES
    ('BBBB0001-0001-0001-0001-000000000001', 'IT',      'Information Technology', 'IT Department', 'SYSTEM'),
    ('BBBB0001-0001-0001-0001-000000000002', 'HR',      'Human Resources',         'HR Department', 'SYSTEM'),
    ('BBBB0001-0001-0001-0001-000000000003', 'FIN',     'Finance & Accounts',      'Finance Dept',  'SYSTEM'),
    ('BBBB0001-0001-0001-0001-000000000004', 'OPS',     'Operations',              'Ops Dept',      'SYSTEM'),
    ('BBBB0001-0001-0001-0001-000000000005', 'SALES',   'Sales & Marketing',       'Sales Dept',    'SYSTEM'),
    ('BBBB0001-0001-0001-0001-000000000006', 'LEGAL',   'Legal & Compliance',      'Legal Dept',    'SYSTEM');
GO

-- Seed Designations
IF NOT EXISTS (SELECT 1 FROM org.Designations WHERE DesignationCode = 'SWE')
INSERT INTO org.Designations (Id, DesignationCode, Title, GradeLevel, CreatedBy)
VALUES
    ('CCCC0001-0001-0001-0001-000000000001', 'SWE',   'Software Engineer',       'L2', 'SYSTEM'),
    ('CCCC0001-0001-0001-0001-000000000002', 'SSE',   'Senior Software Engineer','L3', 'SYSTEM'),
    ('CCCC0001-0001-0001-0001-000000000003', 'TL',    'Team Lead',               'L4', 'SYSTEM'),
    ('CCCC0001-0001-0001-0001-000000000004', 'MGR',   'Manager',                 'L5', 'SYSTEM'),
    ('CCCC0001-0001-0001-0001-000000000005', 'ANAL',  'Business Analyst',        'L3', 'SYSTEM'),
    ('CCCC0001-0001-0001-0001-000000000006', 'EXEC',  'Executive',               'L2', 'SYSTEM');
GO

-- Seed HR Admin User
-- Password: admin123 (bcrypt hash)
DECLARE @HRAdminPasswordHash NVARCHAR(MAX);
SET @HRAdminPasswordHash = '$2a$11$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';
-- NOTE: The above bcrypt hash corresponds to password "admin123"
-- You can verify at: https://bcrypt-generator.com/ → verify "admin123" against this hash

IF NOT EXISTS (SELECT 1 FROM sec.Users WHERE NormalizedUsername = 'ADMIN')
INSERT INTO sec.Users (Id, Username, NormalizedUsername, Email, NormalizedEmail, PasswordHash, IsActive, RoleId, CreatedBy)
VALUES (
    'DDDD0001-0001-0001-0001-000000000001',
    'admin', 'ADMIN',
    'admin@lmsportal.com', 'ADMIN@LMSPORTAL.COM',
    @HRAdminPasswordHash,
    1,
    '11111111-1111-1111-1111-111111111111', -- HR_ADMIN role
    'SYSTEM'
);
GO

-- Seed Sample Employee Users
-- Employee login is by EmployeeCode ONLY (no password)

-- Create a user account for the employee first (required FK)
IF NOT EXISTS (SELECT 1 FROM sec.Users WHERE NormalizedUsername = 'EMP7777')
INSERT INTO sec.Users (Id, Username, NormalizedUsername, Email, NormalizedEmail, PasswordHash, IsActive, RoleId, CreatedBy)
VALUES
    ('DDDD0001-0001-0001-0001-000000000002',
     'EMP7777', 'EMP7777', 'john.doe@company.com', 'JOHN.DOE@COMPANY.COM',
     'N/A-EMPLOYEE-NO-PASSWORD', 1,
     '22222222-2222-2222-2222-222222222222', 'SYSTEM'),
    ('DDDD0001-0001-0001-0001-000000000003',
     'EMP0001', 'EMP0001', 'jane.smith@company.com', 'JANE.SMITH@COMPANY.COM',
     'N/A-EMPLOYEE-NO-PASSWORD', 1,
     '22222222-2222-2222-2222-222222222222', 'SYSTEM'),
    ('DDDD0001-0001-0001-0001-000000000004',
     'EMP1001', 'EMP1001', 'raj.kumar@company.com', 'RAJ.KUMAR@COMPANY.COM',
     'N/A-EMPLOYEE-NO-PASSWORD', 1,
     '22222222-2222-2222-2222-222222222222', 'SYSTEM');
GO

-- Seed Employees
IF NOT EXISTS (SELECT 1 FROM emp.Employees WHERE EmployeeCode = 'EMP7777')
INSERT INTO emp.Employees (UserId, EmployeeCode, FirstName, LastName, OfficialEmail, DepartmentId, DesignationId, OfficeId, JoiningDate, EmploymentStatus, IsMasterTester, CreatedBy)
VALUES
    ('DDDD0001-0001-0001-0001-000000000002',a
     'EMP7777', 'John', 'Doe', 'john.doe@company.com',
     'BBBB0001-0001-0001-0001-000000000001', -- IT
     'CCCC0001-0001-0001-0001-000000000002', -- SSE
     'AAAA0001-0001-0001-0001-000000000001', -- HQ
     '2024-01-15', 'ACTIVE', 1, 'SYSTEM'),
    ('DDDD0001-0001-0001-0001-000000000003',
     'EMP0001', 'Jane', 'Smith', 'jane.smith@company.com',
     'BBBB0001-0001-0001-0001-000000000002', -- HR
     'CCCC0001-0001-0001-0001-000000000004', -- MGR
     'AAAA0001-0001-0001-0001-000000000001', -- HQ
     '2023-06-01', 'ACTIVE', 0, 'SYSTEM'),
    ('DDDD0001-0001-0001-0001-000000000004',
     'EMP1001', 'Raj', 'Kumar', 'raj.kumar@company.com',
     'BBBB0001-0001-0001-0001-000000000003', -- FIN
     'CCCC0001-0001-0001-0001-000000000001', -- SWE
     'AAAA0001-0001-0001-0001-000000000002', -- DEL
     '2025-03-10', 'ACTIVE', 0, 'SYSTEM');
GO

-- Seed Application Settings
IF NOT EXISTS (SELECT 1 FROM adm.ApplicationSettings WHERE SettingKey = 'APP_NAME')
INSERT INTO adm.ApplicationSettings (SettingKey, SettingValue, Description, Category, UpdatedBy)
VALUES
    ('APP_NAME',             'LMS Portal',          'Application display name',         'GENERAL', 'SYSTEM'),
    ('PASSING_SCORE',        '80',                  'Default passing score percentage',  'ASSESSMENT', 'SYSTEM'),
    ('SESSION_TIMEOUT_MINS', '480',                 'Session timeout in minutes',        'SECURITY', 'SYSTEM'),
    ('CERTIFICATE_PREFIX',   'CERT',                'Certificate number prefix',         'CERTIFICATE', 'SYSTEM'),
    ('SUPPORT_EMAIL',        'support@lmsportal.com','Support email address',            'GENERAL', 'SYSTEM');
GO

PRINT '';
PRINT '✅ ========================================';
PRINT '✅  LMS Portal Database Seeded Successfully!';
PRINT '✅ ========================================';
PRINT '';
PRINT '  HR Admin Login:';
PRINT '    Username: admin';
PRINT '    Password: admin123';
PRINT '';
PRINT '  Employee Logins (Employee ID only):';
PRINT '    EMP7777  (John Doe  - IT, Master Tester)';
PRINT '    EMP0001  (Jane Smith - HR, Manager)';
PRINT '    EMP1001  (Raj Kumar - Finance)';
PRINT '';
GO
