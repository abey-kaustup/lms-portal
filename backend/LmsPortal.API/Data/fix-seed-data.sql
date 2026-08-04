-- ============================================================
-- LMS Portal - FIX SCRIPT (Run this in SSMS)
-- Purpose: Insert correct employee data (tables already exist)
-- ============================================================

USE [LMS-Portal];
GO

-- ============================================================
-- Fix 1: Roles (safe, skips if already exists)
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sec.Roles WHERE Id = '11111111-1111-1111-1111-111111111111')
INSERT INTO sec.Roles (Id, RoleName, NormalizedRoleName, Description, CreatedBy)
VALUES ('11111111-1111-1111-1111-111111111111', 'HR Administrator', 'HR_ADMIN',
        'Full access to HR, employee management, and LMS.', 'SYSTEM');

IF NOT EXISTS (SELECT 1 FROM sec.Roles WHERE Id = '22222222-2222-2222-2222-222222222222')
INSERT INTO sec.Roles (Id, RoleName, NormalizedRoleName, Description, CreatedBy)
VALUES ('22222222-2222-2222-2222-222222222222', 'Employee', 'EMPLOYEE',
        'Employee access to learning portal.', 'SYSTEM');
GO

-- ============================================================
-- Fix 2: Offices
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM org.Offices WHERE Id = 'AAAA0001-0001-0001-0001-000000000001')
INSERT INTO org.Offices (Id, OfficeCode, OfficeName, City, State, Country, CreatedBy)
VALUES ('AAAA0001-0001-0001-0001-000000000001', 'HQ001', 'Corporate Headquarters',
        'Mumbai', 'Maharashtra', 'India', 'SYSTEM');

IF NOT EXISTS (SELECT 1 FROM org.Offices WHERE Id = 'AAAA0001-0001-0001-0001-000000000002')
INSERT INTO org.Offices (Id, OfficeCode, OfficeName, City, State, Country, CreatedBy)
VALUES ('AAAA0001-0001-0001-0001-000000000002', 'DEL001', 'Delhi Regional Office',
        'New Delhi', 'Delhi', 'India', 'SYSTEM');
GO

-- ============================================================
-- Fix 3: Departments
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM org.Departments WHERE Id = 'BBBB0001-0001-0001-0001-000000000001')
INSERT INTO org.Departments (Id, DepartmentCode, DepartmentName, Description, CreatedBy)
VALUES
    ('BBBB0001-0001-0001-0001-000000000001', 'IT',    'Information Technology', 'IT Department', 'SYSTEM'),
    ('BBBB0001-0001-0001-0001-000000000002', 'HR',    'Human Resources',        'HR Department', 'SYSTEM'),
    ('BBBB0001-0001-0001-0001-000000000003', 'FIN',   'Finance & Accounts',     'Finance Dept',  'SYSTEM'),
    ('BBBB0001-0001-0001-0001-000000000004', 'OPS',   'Operations',             'Ops Dept',      'SYSTEM'),
    ('BBBB0001-0001-0001-0001-000000000005', 'SALES', 'Sales & Marketing',      'Sales Dept',    'SYSTEM'),
    ('BBBB0001-0001-0001-0001-000000000006', 'LEGAL', 'Legal & Compliance',     'Legal Dept',    'SYSTEM');
GO

-- ============================================================
-- Fix 4: Designations
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM org.Designations WHERE Id = 'CCCC0001-0001-0001-0001-000000000001')
INSERT INTO org.Designations (Id, DesignationCode, Title, GradeLevel, CreatedBy)
VALUES
    ('CCCC0001-0001-0001-0001-000000000001', 'SWE',  'Software Engineer',        'L2', 'SYSTEM'),
    ('CCCC0001-0001-0001-0001-000000000002', 'SSE',  'Senior Software Engineer', 'L3', 'SYSTEM'),
    ('CCCC0001-0001-0001-0001-000000000003', 'TL',   'Team Lead',                'L4', 'SYSTEM'),
    ('CCCC0001-0001-0001-0001-000000000004', 'MGR',  'Manager',                  'L5', 'SYSTEM'),
    ('CCCC0001-0001-0001-0001-000000000005', 'ANAL', 'Business Analyst',         'L3', 'SYSTEM'),
    ('CCCC0001-0001-0001-0001-000000000006', 'EXEC', 'Executive',                'L2', 'SYSTEM');
GO

-- ============================================================
-- Fix 5: HR Admin User  (password = admin123)
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sec.Users WHERE NormalizedUsername = 'ADMIN')
INSERT INTO sec.Users (Id, Username, NormalizedUsername, Email, NormalizedEmail,
                       PasswordHash, IsActive, RoleId, CreatedBy)
VALUES (
    'DDDD0001-0001-0001-0001-000000000001',
    'admin',
    'ADMIN',
    'admin@lmsportal.com',
    'ADMIN@LMSPORTAL.COM',
    '$2a$11$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    1,
    '11111111-1111-1111-1111-111111111111',
    'SYSTEM'
);
GO

-- ============================================================
-- Fix 6: Employee Users (no password — login by ID only)
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sec.Users WHERE NormalizedUsername = 'EMP7777')
INSERT INTO sec.Users (Id, Username, NormalizedUsername, Email, NormalizedEmail,
                       PasswordHash, IsActive, RoleId, CreatedBy)
VALUES (
    'DDDD0001-0001-0001-0001-000000000002',
    'EMP7777',
    'EMP7777',
    'kaustubh.bhatlawande@company.com',
    'KAUSTUBH.BHATLAWANDE@COMPANY.COM',
    'N/A-EMPLOYEE-NO-PASSWORD',
    1,
    '22222222-2222-2222-2222-222222222222',
    'SYSTEM'
);

IF NOT EXISTS (SELECT 1 FROM sec.Users WHERE NormalizedUsername = 'EMP0001')
INSERT INTO sec.Users (Id, Username, NormalizedUsername, Email, NormalizedEmail,
                       PasswordHash, IsActive, RoleId, CreatedBy)
VALUES (
    'DDDD0001-0001-0001-0001-000000000003',
    'EMP0001',
    'EMP0001',
    'jane.smith@company.com',
    'JANE.SMITH@COMPANY.COM',
    'N/A-EMPLOYEE-NO-PASSWORD',
    1,
    '22222222-2222-2222-2222-222222222222',
    'SYSTEM'
);

IF NOT EXISTS (SELECT 1 FROM sec.Users WHERE NormalizedUsername = 'EMP1001')
INSERT INTO sec.Users (Id, Username, NormalizedUsername, Email, NormalizedEmail,
                       PasswordHash, IsActive, RoleId, CreatedBy)
VALUES (
    'DDDD0001-0001-0001-0001-000000000004',
    'EMP1001',
    'EMP1001',
    'raj.kumar@company.com',
    'RAJ.KUMAR@COMPANY.COM',
    'N/A-EMPLOYEE-NO-PASSWORD',
    1,
    '22222222-2222-2222-2222-222222222222',
    'SYSTEM'
);
GO

-- ============================================================
-- Fix 7: Employees
-- EMP7777 = Kaustubh Bhatlawande | MASTER TESTER
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM emp.Employees WHERE EmployeeCode = 'EMP7777')
INSERT INTO emp.Employees (Id, UserId, EmployeeCode, FirstName, LastName,
                           OfficialEmail, DepartmentId, DesignationId, OfficeId,
                           JoiningDate, EmploymentStatus, IsMasterTester, CreatedBy)
VALUES (
    'EEEE0001-0001-0001-0001-000000000001',
    'DDDD0001-0001-0001-0001-000000000002',
    'EMP7777',
    'Kaustubh',
    'Bhatlawande',
    'kaustubh.bhatlawande@company.com',
    'BBBB0001-0001-0001-0001-000000000001',
    'CCCC0001-0001-0001-0001-000000000003',
    'AAAA0001-0001-0001-0001-000000000001',
    '2023-01-01',
    'ACTIVE',
    1,
    'SYSTEM'
);

IF NOT EXISTS (SELECT 1 FROM emp.Employees WHERE EmployeeCode = 'EMP0001')
INSERT INTO emp.Employees (Id, UserId, EmployeeCode, FirstName, LastName,
                           OfficialEmail, DepartmentId, DesignationId, OfficeId,
                           JoiningDate, EmploymentStatus, IsMasterTester, CreatedBy)
VALUES (
    'EEEE0001-0001-0001-0001-000000000002',
    'DDDD0001-0001-0001-0001-000000000003',
    'EMP0001',
    'Jane',
    'Smith',
    'jane.smith@company.com',
    'BBBB0001-0001-0001-0001-000000000002',
    'CCCC0001-0001-0001-0001-000000000004',
    'AAAA0001-0001-0001-0001-000000000001',
    '2023-06-01',
    'ACTIVE',
    0,
    'SYSTEM'
);

IF NOT EXISTS (SELECT 1 FROM emp.Employees WHERE EmployeeCode = 'EMP1001')
INSERT INTO emp.Employees (Id, UserId, EmployeeCode, FirstName, LastName,
                           OfficialEmail, DepartmentId, DesignationId, OfficeId,
                           JoiningDate, EmploymentStatus, IsMasterTester, CreatedBy)
VALUES (
    'EEEE0001-0001-0001-0001-000000000003',
    'DDDD0001-0001-0001-0001-000000000004',
    'EMP1001',
    'Raj',
    'Kumar',
    'raj.kumar@company.com',
    'BBBB0001-0001-0001-0001-000000000003',
    'CCCC0001-0001-0001-0001-000000000001',
    'AAAA0001-0001-0001-0001-000000000002',
    '2025-03-10',
    'ACTIVE',
    0,
    'SYSTEM'
);
GO

-- ============================================================
-- Fix 8: Course + Modules + Lessons
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM lms.Courses WHERE CourseCode = 'IND-001')
INSERT INTO lms.Courses (Id, CourseCode, Title, Description, PassingScorePercentage, IsPublished, CreatedBy)
VALUES (
    'FFFF0001-0001-0001-0001-000000000001',
    'IND-001',
    'Employee Induction Program',
    'Complete onboarding course covering policies, culture, compliance and role-specific training.',
    80.00, 1, 'SYSTEM'
);
GO

IF NOT EXISTS (SELECT 1 FROM lms.Modules WHERE Id = 'A1A10001-0001-0001-0001-000000000001')
INSERT INTO lms.Modules (Id, CourseId, Title, Description, ModuleType, SortOrder, CreatedBy)
VALUES (
    'A1A10001-0001-0001-0001-000000000001',
    'FFFF0001-0001-0001-0001-000000000001',
    'Company Overview & Culture',
    'Introduction to company history, vision, mission and core values.',
    'COMMON', 1, 'SYSTEM'
);

IF NOT EXISTS (SELECT 1 FROM lms.Modules WHERE Id = 'A1A10001-0001-0001-0001-000000000002')
INSERT INTO lms.Modules (Id, CourseId, Title, Description, ModuleType, SortOrder, CreatedBy)
VALUES (
    'A1A10001-0001-0001-0001-000000000002',
    'FFFF0001-0001-0001-0001-000000000001',
    'Compliance & Code of Conduct',
    'Workplace ethics, POSH, data privacy and IT security guidelines.',
    'COMMON', 2, 'SYSTEM'
);

IF NOT EXISTS (SELECT 1 FROM lms.Modules WHERE Id = 'A1A10001-0001-0001-0001-000000000003')
INSERT INTO lms.Modules (Id, CourseId, Title, Description, ModuleType, TargetDepartmentId, SortOrder, CreatedBy)
VALUES (
    'A1A10001-0001-0001-0001-000000000003',
    'FFFF0001-0001-0001-0001-000000000001',
    'IT Tools & Access Management',
    'Enterprise software, VPN, Active Directory and ticketing for IT staff.',
    'DEPARTMENT', 'BBBB0001-0001-0001-0001-000000000001', 3, 'SYSTEM'
);
GO

IF NOT EXISTS (SELECT 1 FROM lms.Lessons WHERE Id = 'B1B10001-0001-0001-0001-000000000001')
INSERT INTO lms.Lessons (Id, ModuleId, Title, Description, ContentType, SortOrder, MinDurationSeconds, CreatedBy)
VALUES (
    'B1B10001-0001-0001-0001-000000000001',
    'A1A10001-0001-0001-0001-000000000001',
    'Welcome to the Company',
    'CEO welcome message and company story.',
    'VIDEO', 1, 60, 'SYSTEM'
);

IF NOT EXISTS (SELECT 1 FROM lms.Lessons WHERE Id = 'B1B10001-0001-0001-0001-000000000002')
INSERT INTO lms.Lessons (Id, ModuleId, Title, Description, ContentType, SortOrder, MinDurationSeconds, CreatedBy)
VALUES (
    'B1B10001-0001-0001-0001-000000000002',
    'A1A10001-0001-0001-0001-000000000001',
    'Our Vision & Mission',
    'Company vision, mission and strategic goals.',
    'PDF', 2, 0, 'SYSTEM'
);

IF NOT EXISTS (SELECT 1 FROM lms.Lessons WHERE Id = 'B1B10001-0001-0001-0001-000000000003')
INSERT INTO lms.Lessons (Id, ModuleId, Title, Description, ContentType, SortOrder, MinDurationSeconds, CreatedBy)
VALUES (
    'B1B10001-0001-0001-0001-000000000003',
    'A1A10001-0001-0001-0001-000000000002',
    'Code of Conduct Overview',
    'Ethics, POSH and workplace conduct guidelines.',
    'PDF', 1, 0, 'SYSTEM'
);

IF NOT EXISTS (SELECT 1 FROM lms.Lessons WHERE Id = 'B1B10001-0001-0001-0001-000000000004')
INSERT INTO lms.Lessons (Id, ModuleId, Title, Description, ContentType, SortOrder, MinDurationSeconds, CreatedBy)
VALUES (
    'B1B10001-0001-0001-0001-000000000004',
    'A1A10001-0001-0001-0001-000000000002',
    'Data Privacy & IT Security',
    'GDPR, data handling and cybersecurity basics.',
    'VIDEO', 2, 90, 'SYSTEM'
);

IF NOT EXISTS (SELECT 1 FROM lms.Lessons WHERE Id = 'B1B10001-0001-0001-0001-000000000005')
INSERT INTO lms.Lessons (Id, ModuleId, Title, Description, ContentType, SortOrder, MinDurationSeconds, CreatedBy)
VALUES (
    'B1B10001-0001-0001-0001-000000000005',
    'A1A10001-0001-0001-0001-000000000003',
    'IT Infrastructure Overview',
    'Enterprise tools, VPN setup and access management.',
    'VIDEO', 1, 120, 'SYSTEM'
);

IF NOT EXISTS (SELECT 1 FROM lms.Lessons WHERE Id = 'B1B10001-0001-0001-0001-000000000006')
INSERT INTO lms.Lessons (Id, ModuleId, Title, Description, ContentType, SortOrder, MinDurationSeconds, CreatedBy)
VALUES (
    'B1B10001-0001-0001-0001-000000000006',
    'A1A10001-0001-0001-0001-000000000003',
    'Ticketing & ITSM Process',
    'How to raise and manage IT tickets.',
    'PDF', 2, 0, 'SYSTEM'
);
GO

-- ============================================================
-- Fix 9: Mark ALL lessons COMPLETED for Kaustubh (EMP7777)
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM lms.LessonProgress WHERE EmployeeId = 'EEEE0001-0001-0001-0001-000000000001')
INSERT INTO lms.LessonProgress
    (EmployeeId, LessonId, IsCompleted, WatchedSeconds, TotalSeconds, CompletedAt, CreatedBy)
VALUES
    ('EEEE0001-0001-0001-0001-000000000001','B1B10001-0001-0001-0001-000000000001',1,300,300,GETUTCDATE(),'SYSTEM'),
    ('EEEE0001-0001-0001-0001-000000000001','B1B10001-0001-0001-0001-000000000002',1,0,  0,  GETUTCDATE(),'SYSTEM'),
    ('EEEE0001-0001-0001-0001-000000000001','B1B10001-0001-0001-0001-000000000003',1,0,  0,  GETUTCDATE(),'SYSTEM'),
    ('EEEE0001-0001-0001-0001-000000000001','B1B10001-0001-0001-0001-000000000004',1,450,450,GETUTCDATE(),'SYSTEM'),
    ('EEEE0001-0001-0001-0001-000000000001','B1B10001-0001-0001-0001-000000000005',1,600,600,GETUTCDATE(),'SYSTEM'),
    ('EEEE0001-0001-0001-0001-000000000001','B1B10001-0001-0001-0001-000000000006',1,0,  0,  GETUTCDATE(),'SYSTEM');
GO

-- ============================================================
-- Fix 10: Application Settings
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM adm.ApplicationSettings WHERE SettingKey = 'APP_NAME')
INSERT INTO adm.ApplicationSettings (SettingKey, SettingValue, Description, Category, UpdatedBy)
VALUES
    ('APP_NAME',             'LMS Portal',           'Application display name',         'GENERAL',     'SYSTEM'),
    ('PASSING_SCORE',        '80',                   'Default passing score percentage',  'ASSESSMENT',  'SYSTEM'),
    ('SESSION_TIMEOUT_MINS', '480',                  'Session timeout in minutes',        'SECURITY',    'SYSTEM'),
    ('CERTIFICATE_PREFIX',   'CERT',                 'Certificate number prefix',         'CERTIFICATE', 'SYSTEM'),
    ('SUPPORT_EMAIL',        'support@lmsportal.com','Support email address',             'GENERAL',     'SYSTEM');
GO

PRINT '';
PRINT '=====================================';
PRINT ' FIX APPLIED SUCCESSFULLY!';
PRINT '=====================================';
PRINT '';
PRINT ' HR Admin:    admin / admin123';
PRINT ' Master Test: EMP7777 (Kaustubh Bhatlawande)';
PRINT ' Employee:    EMP0001 / EMP1001';
PRINT '';
GO
