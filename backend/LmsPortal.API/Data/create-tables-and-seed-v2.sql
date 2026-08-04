-- ============================================================================
-- LMS PORTAL DATABASE SCHEMA & SEED SCRIPT (v2.0)
-- 100% COMPLIANT WITH ENTERPRISE REQUIREMENTS:
-- 1. Primary Keys: Id INT IDENTITY(1,1) PRIMARY KEY
-- 2. Foreign Keys: Integer Identity References
-- 3. Employee Code: Manual VARCHAR(50) UNIQUE (e.g. EMP1001, EMP7777)
-- 4. Master Display Codes: Auto-Generated VARCHAR(5) UNIQUE (D0001, O0001, G0001, C0001, M0001, L0001, A0001, T0001)
-- ============================================================================

USE [LMS-Portal];
GO

-- 1. DROP EXISTING CONSTRAINTS & TABLES IN REVERSE ORDER
IF OBJECT_ID('adm.ActivityLogs', 'U') IS NOT NULL DROP TABLE adm.ActivityLogs;
IF OBJECT_ID('adm.AuditLogs', 'U') IS NOT NULL DROP TABLE adm.AuditLogs;
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
IF OBJECT_ID('sec.RefreshTokens', 'U') IS NOT NULL DROP TABLE sec.RefreshTokens;
IF OBJECT_ID('sec.EmployeeSessions', 'U') IS NOT NULL DROP TABLE sec.EmployeeSessions;
IF OBJECT_ID('sec.Users', 'U') IS NOT NULL DROP TABLE sec.Users;
IF OBJECT_ID('sec.RolePermissions', 'U') IS NOT NULL DROP TABLE sec.RolePermissions;
IF OBJECT_ID('sec.Permissions', 'U') IS NOT NULL DROP TABLE sec.Permissions;
IF OBJECT_ID('sec.Roles', 'U') IS NOT NULL DROP TABLE sec.Roles;
IF OBJECT_ID('org.Designations', 'U') IS NOT NULL DROP TABLE org.Designations;
IF OBJECT_ID('org.Departments', 'U') IS NOT NULL DROP TABLE org.Departments;
IF OBJECT_ID('org.Offices', 'U') IS NOT NULL DROP TABLE org.Offices;
GO

-- 2. CREATE SCHEMAS
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'org') EXEC('CREATE SCHEMA org');
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'sec') EXEC('CREATE SCHEMA sec');
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'emp') EXEC('CREATE SCHEMA emp');
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'lms') EXEC('CREATE SCHEMA lms');
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'eval') EXEC('CREATE SCHEMA eval');
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'cert') EXEC('CREATE SCHEMA cert');
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'adm') EXEC('CREATE SCHEMA adm');
GO

-- 3. CREATE TABLES WITH INT IDENTITY(1,1) PRIMARY KEYS & UNIQUE CONSTRAINTS

-- Offices (O0001)
CREATE TABLE org.Offices (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    OfficeCode VARCHAR(5) NOT NULL CONSTRAINT UQ_Office_OfficeCode UNIQUE,
    OfficeName NVARCHAR(150) NOT NULL,
    City NVARCHAR(100) NOT NULL,
    State NVARCHAR(100) NOT NULL,
    Country NVARCHAR(100) NOT NULL DEFAULT 'India',
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT DATEADD(MINUTE, 330, SYSUTCDATETIME()),
    UpdatedAt DATETIME2 NOT NULL DEFAULT DATEADD(MINUTE, 330, SYSUTCDATETIME()),
    CreatedBy NVARCHAR(100) NULL,
    UpdatedBy NVARCHAR(100) NULL,
    IsDeleted BIT NOT NULL DEFAULT 0,
    RowVersion ROWVERSION NOT NULL
);

-- Departments (D0001)
CREATE TABLE org.Departments (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    DepartmentCode VARCHAR(5) NOT NULL CONSTRAINT UQ_Dept_DepartmentCode UNIQUE,
    DepartmentName NVARCHAR(150) NOT NULL,
    Description NVARCHAR(MAX) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT DATEADD(MINUTE, 330, SYSUTCDATETIME()),
    UpdatedAt DATETIME2 NOT NULL DEFAULT DATEADD(MINUTE, 330, SYSUTCDATETIME()),
    CreatedBy NVARCHAR(100) NULL,
    UpdatedBy NVARCHAR(100) NULL,
    IsDeleted BIT NOT NULL DEFAULT 0,
    RowVersion ROWVERSION NOT NULL
);

-- Designations (G0001)
CREATE TABLE org.Designations (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    DesignationCode VARCHAR(5) NOT NULL CONSTRAINT UQ_Desig_DesignationCode UNIQUE,
    Title NVARCHAR(150) NOT NULL,
    GradeLevel NVARCHAR(50) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT DATEADD(MINUTE, 330, SYSUTCDATETIME()),
    UpdatedAt DATETIME2 NOT NULL DEFAULT DATEADD(MINUTE, 330, SYSUTCDATETIME()),
    CreatedBy NVARCHAR(100) NULL,
    UpdatedBy NVARCHAR(100) NULL,
    IsDeleted BIT NOT NULL DEFAULT 0,
    RowVersion ROWVERSION NOT NULL
);

-- Roles & Permissions
CREATE TABLE sec.Roles (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    RoleName NVARCHAR(50) NOT NULL,
    NormalizedRoleName NVARCHAR(50) NOT NULL CONSTRAINT UQ_Role_Normalized UNIQUE,
    Description NVARCHAR(255) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT DATEADD(MINUTE, 330, SYSUTCDATETIME()),
    UpdatedAt DATETIME2 NOT NULL DEFAULT DATEADD(MINUTE, 330, SYSUTCDATETIME()),
    CreatedBy NVARCHAR(100) NULL,
    UpdatedBy NVARCHAR(100) NULL,
    IsDeleted BIT NOT NULL DEFAULT 0,
    RowVersion ROWVERSION NOT NULL
);

CREATE TABLE sec.Users (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Username NVARCHAR(100) NOT NULL CONSTRAINT UQ_User_Username UNIQUE,
    NormalizedUsername NVARCHAR(100) NOT NULL CONSTRAINT UQ_User_NormalizedUsername UNIQUE,
    Email NVARCHAR(256) NOT NULL CONSTRAINT UQ_User_Email UNIQUE,
    NormalizedEmail NVARCHAR(256) NOT NULL CONSTRAINT UQ_User_NormalizedEmail UNIQUE,
    PasswordHash NVARCHAR(MAX) NOT NULL,
    SecurityStamp NVARCHAR(MAX) NOT NULL,
    ConcurrencyStamp NVARCHAR(MAX) NOT NULL,
    PhoneNumber NVARCHAR(50) NULL,
    IsEmailConfirmed BIT NOT NULL DEFAULT 1,
    IsActive BIT NOT NULL DEFAULT 1,
    RoleId INT NOT NULL CONSTRAINT FK_Users_Roles FOREIGN KEY REFERENCES sec.Roles(Id),
    CreatedAt DATETIME2 NOT NULL DEFAULT DATEADD(MINUTE, 330, SYSUTCDATETIME()),
    UpdatedAt DATETIME2 NOT NULL DEFAULT DATEADD(MINUTE, 330, SYSUTCDATETIME()),
    CreatedBy NVARCHAR(100) NULL,
    UpdatedBy NVARCHAR(100) NULL,
    IsDeleted BIT NOT NULL DEFAULT 0,
    RowVersion ROWVERSION NOT NULL
);

-- Employees (Manual EmployeeCode VARCHAR(50) UNIQUE + Display Code FKs D0001, G0001, O0001)
CREATE TABLE emp.Employees (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL CONSTRAINT FK_Employees_Users FOREIGN KEY REFERENCES sec.Users(Id),
    EmployeeCode VARCHAR(50) NOT NULL CONSTRAINT UQ_Emp_EmployeeCode UNIQUE,
    FirstName NVARCHAR(100) NOT NULL,
    MiddleName NVARCHAR(100) NULL,
    LastName NVARCHAR(100) NOT NULL,
    OfficialEmail NVARCHAR(256) NOT NULL CONSTRAINT UQ_Emp_OfficialEmail UNIQUE,
    DepartmentId INT NOT NULL CONSTRAINT FK_Employees_Departments FOREIGN KEY REFERENCES org.Departments(Id),
    DepartmentCode VARCHAR(5) NOT NULL CONSTRAINT FK_Emp_DeptCode FOREIGN KEY REFERENCES org.Departments(DepartmentCode),
    DesignationId INT NOT NULL CONSTRAINT FK_Employees_Designations FOREIGN KEY REFERENCES org.Designations(Id),
    DesignationCode VARCHAR(5) NOT NULL CONSTRAINT FK_Emp_DesigCode FOREIGN KEY REFERENCES org.Designations(DesignationCode),
    OfficeId INT NOT NULL CONSTRAINT FK_Employees_Offices FOREIGN KEY REFERENCES org.Offices(Id),
    OfficeCode VARCHAR(5) NOT NULL CONSTRAINT FK_Emp_OfficeCode FOREIGN KEY REFERENCES org.Offices(OfficeCode),
    JoiningDate DATETIME2 NOT NULL,
    EmploymentStatus NVARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    IsMasterTester BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT DATEADD(MINUTE, 330, SYSUTCDATETIME()),
    UpdatedAt DATETIME2 NOT NULL DEFAULT DATEADD(MINUTE, 330, SYSUTCDATETIME()),
    CreatedBy NVARCHAR(100) NULL,
    UpdatedBy NVARCHAR(100) NULL,
    IsDeleted BIT NOT NULL DEFAULT 0,
    RowVersion ROWVERSION NOT NULL
);

-- Courses (C0001)
CREATE TABLE lms.Courses (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    CourseCode VARCHAR(5) NOT NULL CONSTRAINT UQ_Course_CourseCode UNIQUE,
    Title NVARCHAR(200) NOT NULL,
    Description NVARCHAR(MAX) NULL,
    PassingScorePercentage DECIMAL(5,2) NOT NULL DEFAULT 80.00,
    IsPublished BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT DATEADD(MINUTE, 330, SYSUTCDATETIME()),
    UpdatedAt DATETIME2 NOT NULL DEFAULT DATEADD(MINUTE, 330, SYSUTCDATETIME()),
    CreatedBy NVARCHAR(100) NULL,
    UpdatedBy NVARCHAR(100) NULL,
    IsDeleted BIT NOT NULL DEFAULT 0,
    RowVersion ROWVERSION NOT NULL
);

-- Modules (M0001)
CREATE TABLE lms.Modules (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    CourseId INT NOT NULL CONSTRAINT FK_Modules_Courses FOREIGN KEY REFERENCES lms.Courses(Id),
    ModuleCode VARCHAR(5) NOT NULL CONSTRAINT UQ_Module_ModuleCode UNIQUE,
    Title NVARCHAR(200) NOT NULL,
    Description NVARCHAR(MAX) NULL,
    ModuleType NVARCHAR(50) NOT NULL DEFAULT 'COMMON',
    TargetDepartmentId INT NULL CONSTRAINT FK_Modules_Departments FOREIGN KEY REFERENCES org.Departments(Id),
    SortOrder INT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT DATEADD(MINUTE, 330, SYSUTCDATETIME()),
    UpdatedAt DATETIME2 NOT NULL DEFAULT DATEADD(MINUTE, 330, SYSUTCDATETIME()),
    CreatedBy NVARCHAR(100) NULL,
    UpdatedBy NVARCHAR(100) NULL,
    IsDeleted BIT NOT NULL DEFAULT 0,
    RowVersion ROWVERSION NOT NULL
);

-- Lessons (L0001)
CREATE TABLE lms.Lessons (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    ModuleId INT NOT NULL CONSTRAINT FK_Lessons_Modules FOREIGN KEY REFERENCES lms.Modules(Id),
    LessonCode VARCHAR(5) NOT NULL CONSTRAINT UQ_Lesson_LessonCode UNIQUE,
    Title NVARCHAR(200) NOT NULL,
    Description NVARCHAR(MAX) NULL,
    ContentType NVARCHAR(50) NOT NULL DEFAULT 'VIDEO',
    SortOrder INT NOT NULL DEFAULT 0,
    MinDurationSeconds INT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT DATEADD(MINUTE, 330, SYSUTCDATETIME()),
    UpdatedAt DATETIME2 NOT NULL DEFAULT DATEADD(MINUTE, 330, SYSUTCDATETIME()),
    CreatedBy NVARCHAR(100) NULL,
    UpdatedBy NVARCHAR(100) NULL,
    IsDeleted BIT NOT NULL DEFAULT 0,
    RowVersion ROWVERSION NOT NULL
);

-- LessonProgress
CREATE TABLE lms.LessonProgress (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    EmployeeId INT NOT NULL CONSTRAINT FK_LP_Employees FOREIGN KEY REFERENCES emp.Employees(Id),
    LessonId INT NOT NULL CONSTRAINT FK_LP_Lessons FOREIGN KEY REFERENCES lms.Lessons(Id),
    IsCompleted BIT NOT NULL DEFAULT 0,
    WatchedSeconds DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    TotalSeconds DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    CompletedAt DATETIME2 NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT DATEADD(MINUTE, 330, SYSUTCDATETIME()),
    UpdatedAt DATETIME2 NOT NULL DEFAULT DATEADD(MINUTE, 330, SYSUTCDATETIME()),
    CreatedBy NVARCHAR(100) NULL,
    UpdatedBy NVARCHAR(100) NULL,
    IsDeleted BIT NOT NULL DEFAULT 0,
    RowVersion ROWVERSION NOT NULL
);

-- Assessments (A0001)
CREATE TABLE eval.Assessments (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    CourseId INT NOT NULL CONSTRAINT FK_Assess_Courses FOREIGN KEY REFERENCES lms.Courses(Id),
    AssessmentCode VARCHAR(5) NOT NULL CONSTRAINT UQ_Assess_AssessmentCode UNIQUE,
    Title NVARCHAR(200) NOT NULL,
    Description NVARCHAR(MAX) NULL,
    TimeLimitMinutes INT NOT NULL DEFAULT 30,
    PassingScorePercentage DECIMAL(5,2) NOT NULL DEFAULT 80.00,
    IsPublished BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT DATEADD(MINUTE, 330, SYSUTCDATETIME()),
    UpdatedAt DATETIME2 NOT NULL DEFAULT DATEADD(MINUTE, 330, SYSUTCDATETIME()),
    CreatedBy NVARCHAR(100) NULL,
    UpdatedBy NVARCHAR(100) NULL,
    IsDeleted BIT NOT NULL DEFAULT 0,
    RowVersion ROWVERSION NOT NULL
);

-- AssessmentQuestions
CREATE TABLE eval.AssessmentQuestions (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    AssessmentId INT NOT NULL CONSTRAINT FK_AQ_Assessments FOREIGN KEY REFERENCES eval.Assessments(Id),
    ModuleId INT NULL CONSTRAINT FK_AQ_Modules FOREIGN KEY REFERENCES lms.Modules(Id),
    QuestionText NVARCHAR(MAX) NOT NULL,
    Explanation NVARCHAR(MAX) NULL,
    Points DECIMAL(5,2) NOT NULL DEFAULT 1.00,
    SortOrder INT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT DATEADD(MINUTE, 330, SYSUTCDATETIME()),
    UpdatedAt DATETIME2 NOT NULL DEFAULT DATEADD(MINUTE, 330, SYSUTCDATETIME()),
    CreatedBy NVARCHAR(100) NULL,
    UpdatedBy NVARCHAR(100) NULL,
    IsDeleted BIT NOT NULL DEFAULT 0,
    RowVersion ROWVERSION NOT NULL
);

-- QuestionOptions
CREATE TABLE eval.QuestionOptions (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    QuestionId INT NOT NULL CONSTRAINT FK_QO_Questions FOREIGN KEY REFERENCES eval.AssessmentQuestions(Id),
    OptionText NVARCHAR(MAX) NOT NULL,
    IsCorrect BIT NOT NULL DEFAULT 0,
    SortOrder INT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT DATEADD(MINUTE, 330, SYSUTCDATETIME()),
    UpdatedAt DATETIME2 NOT NULL DEFAULT DATEADD(MINUTE, 330, SYSUTCDATETIME()),
    CreatedBy NVARCHAR(100) NULL,
    UpdatedBy NVARCHAR(100) NULL,
    IsDeleted BIT NOT NULL DEFAULT 0,
    RowVersion ROWVERSION NOT NULL
);

-- AssessmentAttempts
CREATE TABLE eval.AssessmentAttempts (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    EmployeeId INT NOT NULL CONSTRAINT FK_AA_Employees FOREIGN KEY REFERENCES emp.Employees(Id),
    AssessmentId INT NOT NULL CONSTRAINT FK_AA_Assessments FOREIGN KEY REFERENCES eval.Assessments(Id),
    ScorePercentage DECIMAL(5,2) NOT NULL,
    Passed BIT NOT NULL,
    TotalQuestions INT NOT NULL,
    CorrectAnswersCount INT NOT NULL,
    TimeTakenSeconds INT NOT NULL,
    StartedAt DATETIME2 NOT NULL DEFAULT DATEADD(MINUTE, 330, SYSUTCDATETIME()),
    SubmittedAt DATETIME2 NOT NULL DEFAULT DATEADD(MINUTE, 330, SYSUTCDATETIME()),
    CreatedAt DATETIME2 NOT NULL DEFAULT DATEADD(MINUTE, 330, SYSUTCDATETIME()),
    UpdatedAt DATETIME2 NOT NULL DEFAULT DATEADD(MINUTE, 330, SYSUTCDATETIME()),
    CreatedBy NVARCHAR(100) NULL,
    UpdatedBy NVARCHAR(100) NULL,
    IsDeleted BIT NOT NULL DEFAULT 0,
    RowVersion ROWVERSION NOT NULL
);

-- Certificates (T0001)
CREATE TABLE cert.Certificates (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    EmployeeId INT NOT NULL CONSTRAINT FK_Cert_Employees FOREIGN KEY REFERENCES emp.Employees(Id),
    CourseId INT NOT NULL CONSTRAINT FK_Cert_Courses FOREIGN KEY REFERENCES lms.Courses(Id),
    CertificateCode VARCHAR(5) NOT NULL CONSTRAINT UQ_Cert_CertificateCode UNIQUE,
    CertificateNumber NVARCHAR(100) NOT NULL CONSTRAINT UQ_Cert_CertificateNumber UNIQUE,
    VerificationCode NVARCHAR(100) NOT NULL CONSTRAINT UQ_Cert_VerificationCode UNIQUE,
    VerificationUrl NVARCHAR(500) NOT NULL,
    QRCode NVARCHAR(MAX) NULL,
    Status NVARCHAR(50) NOT NULL DEFAULT 'ISSUED',
    IssueDate DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    GeneratedBy NVARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    PdfPath NVARCHAR(500) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CreatedBy NVARCHAR(100) NULL,
    UpdatedBy NVARCHAR(100) NULL,
    IsDeleted BIT NOT NULL DEFAULT 0,
    RowVersion ROWVERSION NOT NULL
);

-- ActivityLogs
CREATE TABLE adm.ActivityLogs (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NULL,
    Role NVARCHAR(50) NOT NULL,
    Action NVARCHAR(100) NOT NULL,
    Details NVARCHAR(MAX) NULL,
    IpAddress NVARCHAR(50) NULL,
    UserAgent NVARCHAR(500) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

-- 4. SEED INITIAL DATA WITH AUTO-GENERATED DISPLAY CODES & MANUAL EMPLOYEE CODES

-- Roles
INSERT INTO sec.Roles (RoleName, NormalizedRoleName, Description) VALUES
('HR Admin', 'HR_ADMIN', 'Human Resource Administrator with full access'),
('Employee', 'EMPLOYEE', 'Standard employee learner');

-- Offices (O0001, O0002)
INSERT INTO org.Offices (OfficeCode, OfficeName, City, State, Country) VALUES
('O0001', 'Headquarters (HQ)', 'Mumbai', 'Maharashtra', 'India'),
('O0002', 'Tech Park Branch', 'Pune', 'Maharashtra', 'India');

-- Departments (D0001, D0002, D0003, D0004)
INSERT INTO org.Departments (DepartmentCode, DepartmentName, Description) VALUES
('D0001', 'Information Technology', 'Software development, IT infrastructure, and system operations'),
('D0002', 'Human Resources', 'Talent acquisition, employee relations, and HR policies'),
('D0003', 'Finance & Accounting', 'Financial planning, accounting, and payroll management'),
('D0004', 'Sales & Marketing', 'Brand awareness, client acquisition, and growth');

-- Designations (G0001, G0002, G0003, G0004)
INSERT INTO org.Designations (DesignationCode, Title, GradeLevel) VALUES
('G0001', 'Software Engineer', 'L3'),
('G0002', 'Team Lead', 'L5'),
('G0003', 'HR Executive', 'L2'),
('G0004', 'Finance Analyst', 'L3');

-- HR Admin User (admin / admin123)
-- BCrypt Hash for admin123
INSERT INTO sec.Users (Username, NormalizedUsername, Email, NormalizedEmail, PasswordHash, SecurityStamp, ConcurrencyStamp, RoleId) VALUES
('ADMIN', 'ADMIN', 'admin@company.com', 'ADMIN@COMPANY.COM', '$2a$11$q99r/tNvdEa3nZ.vj9/Dne73p06u3Z1215WwB2h55iW1z.d34f0aC', NEWID(), NEWID(), 1);

-- Master Employee Account: EMP7777 (Kaustubh Bhatlawande)
INSERT INTO sec.Users (Username, NormalizedUsername, Email, NormalizedEmail, PasswordHash, SecurityStamp, ConcurrencyStamp, RoleId) VALUES
('EMP7777', 'EMP7777', 'kaustubh.bhatlawande@gmail.com', 'KAUSTUBH.BHATLAWANDE@GMAIL.COM', '$2a$11$q99r/tNvdEa3nZ.vj9/Dne73p06u3Z1215WwB2h55iW1z.d34f0aC', NEWID(), NEWID(), 2);

INSERT INTO emp.Employees (UserId, EmployeeCode, FirstName, MiddleName, LastName, OfficialEmail, DepartmentId, DepartmentCode, DesignationId, DesignationCode, OfficeId, OfficeCode, JoiningDate, IsMasterTester) VALUES
(2, 'EMP7777', 'Kaustubh', 'Shrikant', 'Bhatlawande', 'kaustubh.bhatlawande@gmail.com', 1, 'D0001', 2, 'G0002', 1, 'O0001', '2024-01-15', 1);

-- Standard Employees (EMP0001, EMP1001)
INSERT INTO sec.Users (Username, NormalizedUsername, Email, NormalizedEmail, PasswordHash, SecurityStamp, ConcurrencyStamp, RoleId) VALUES
('EMP0001', 'EMP0001', 'jane.smith@company.com', 'JANE.SMITH@COMPANY.COM', '$2a$11$q99r/tNvdEa3nZ.vj9/Dne73p06u3Z1215WwB2h55iW1z.d34f0aC', NEWID(), NEWID(), 2),
('EMP1001', 'EMP1001', 'raj.kumar@company.com', 'RAJ.KUMAR@COMPANY.COM', '$2a$11$q99r/tNvdEa3nZ.vj9/Dne73p06u3Z1215WwB2h55iW1z.d34f0aC', NEWID(), NEWID(), 2);

INSERT INTO emp.Employees (UserId, EmployeeCode, FirstName, MiddleName, LastName, OfficialEmail, DepartmentId, DepartmentCode, DesignationId, DesignationCode, OfficeId, OfficeCode, JoiningDate, IsMasterTester) VALUES
(3, 'EMP0001', 'Jane', NULL, 'Smith', 'jane.smith@company.com', 2, 'D0002', 3, 'G0003', 1, 'O0001', '2023-06-01', 0),
(4, 'EMP1001', 'Raj', NULL, 'Kumar', 'raj.kumar@company.com', 3, 'D0003', 4, 'G0004', 2, 'O0002', '2025-03-10', 0);

-- Courses (C0001)
INSERT INTO lms.Courses (CourseCode, Title, Description, PassingScorePercentage) VALUES
('C0001', 'Enterprise Security & Compliance 2026', 'Comprehensive security awareness, data privacy policies, and compliance standards.', 80.00);

-- Modules (M0001, M0002)
INSERT INTO lms.Modules (CourseId, ModuleCode, Title, Description, ModuleType, TargetDepartmentId, SortOrder) VALUES
(1, 'M0001', 'Cybersecurity Foundations', 'Essential principles of cybersecurity, password management, and email safety.', 'COMMON', NULL, 1),
(1, 'M0002', 'IT Data Protection & Code Security', 'Advanced data security protocols and secure coding practices for IT engineers.', 'DEPARTMENT', 1, 2);

-- Lessons (L0001, L0002)
INSERT INTO lms.Lessons (ModuleId, LessonCode, Title, Description, ContentType, SortOrder, MinDurationSeconds) VALUES
(1, 'L0001', 'Phishing & Threat Awareness', 'Learn how to identify phishing emails, malicious attachments, and social engineering.', 'VIDEO', 1, 120),
(2, 'L0002', 'Secure API Architecture & Encryption', 'Best practices for REST API authentication, JWT, and SQL injection prevention.', 'VIDEO', 1, 300);

-- Assessments (A0001)
INSERT INTO eval.Assessments (CourseId, AssessmentCode, Title, Description, TimeLimitMinutes, PassingScorePercentage) VALUES
(1, 'A0001', 'Final Compliance & Security Evaluation', 'Proctored final examination covering cybersecurity foundations and department compliance.', 15, 80.00);

-- Questions & Options
INSERT INTO eval.AssessmentQuestions (AssessmentId, ModuleId, QuestionText, Points, SortOrder) VALUES
(1, 1, 'What is the primary indicator of a phishing email attempt?', 1.00, 1),
(1, 2, 'Which technique prevents SQL Injection vulnerabilities in backend APIs?', 1.00, 2);

INSERT INTO eval.QuestionOptions (QuestionId, OptionText, IsCorrect, SortOrder) VALUES
(1, 'Urgent request for credentials from an unverified domain', 1, 1),
(1, 'An internal email from your manager with no links', 0, 2),
(2, 'Using Parameterized Queries or Entity Framework ORM', 1, 1),
(2, 'Concatenating raw user inputs into SQL strings', 0, 2);

PRINT '========================================';
PRINT ' LMS Portal DB (v2.0) Seeded Successfully! ';
PRINT ' Primary Keys: INT IDENTITY(1,1) ';
PRINT ' Master Display Codes: D0001, O0001, G0001, C0001, M0001, L0001, A0001, T0001 ';
PRINT ' Employee Code: Manual VARCHAR(50) UNIQUE (e.g. EMP7777, EMP1001) ';
PRINT '========================================';
GO
