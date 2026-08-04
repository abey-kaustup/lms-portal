-- ====================================================================================
-- DATABASE SEED SCRIPT: LMS-Portal
-- TARGET SERVER: 192.168.2.5 or (localdb)\MSSQLLocalDB
-- INSTRUCTIONS: Run this in SSMS to populate all initial Employees, Courses,
--               Modules, Lessons, Files, and 20 Assessment Questions!
-- ====================================================================================

USE [LMS-Portal];
GO

SET NOCOUNT ON;

-- ------------------------------------------------------------------------------------
-- 1. SEED SECURITY ROLES & USERS
-- ------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM sec.Roles WHERE RoleCode = 'HR_ADMIN')
    INSERT INTO sec.Roles (RoleCode, RoleName, NormalizedRoleName, Description) VALUES ('HR_ADMIN', 'HR Administrator', 'HR_ADMIN', 'Full HR & Admin management privileges');

IF NOT EXISTS (SELECT 1 FROM sec.Roles WHERE RoleCode = 'EMPLOYEE')
    INSERT INTO sec.Roles (RoleCode, RoleName, NormalizedRoleName, Description) VALUES ('EMPLOYEE', 'Standard Employee', 'EMPLOYEE', 'Access to employee learning workspace');

DECLARE @RoleHr INT = (SELECT Id FROM sec.Roles WHERE RoleCode = 'HR_ADMIN');
DECLARE @RoleEmp INT = (SELECT Id FROM sec.Roles WHERE RoleCode = 'EMPLOYEE');

-- ------------------------------------------------------------------------------------
-- 2. SEED ORGANIZATION (OFFICES, DEPARTMENTS, DESIGNATIONS)
-- ------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM org.Offices WHERE OfficeCode = 'O0001')
    INSERT INTO org.Offices (OfficeCode, OfficeName, City, State, Country) VALUES ('O0001', 'Pune Headquarters', 'Pune', 'Maharashtra', 'India');
IF NOT EXISTS (SELECT 1 FROM org.Offices WHERE OfficeCode = 'O0002')
    INSERT INTO org.Offices (OfficeCode, OfficeName, City, State, Country) VALUES ('O0002', 'Mumbai Technology Center', 'Mumbai', 'Maharashtra', 'India');

DECLARE @Off1 INT = (SELECT Id FROM org.Offices WHERE OfficeCode = 'O0001');

IF NOT EXISTS (SELECT 1 FROM org.Departments WHERE DepartmentCode = 'D0001')
    INSERT INTO org.Departments (DepartmentCode, DepartmentName, Description) VALUES ('D0001', 'Information Technology', 'IT Software, DevOps, Infrastructure and Cyber Security');
IF NOT EXISTS (SELECT 1 FROM org.Departments WHERE DepartmentCode = 'D0002')
    INSERT INTO org.Departments (DepartmentCode, DepartmentName, Description) VALUES ('D0002', 'Human Resources', 'HR Operations, Talent Acquisition, POSH Committee and Employee Relations');
IF NOT EXISTS (SELECT 1 FROM org.Departments WHERE DepartmentCode = 'D0003')
    INSERT INTO org.Departments (DepartmentCode, DepartmentName, Description) VALUES ('D0003', 'Finance & Accounting', 'Corporate accounting, financial planning, SAP expense claims and auditing');
IF NOT EXISTS (SELECT 1 FROM org.Departments WHERE DepartmentCode = 'D0004')
    INSERT INTO org.Departments (DepartmentCode, DepartmentName, Description) VALUES ('D0004', 'Operations & Logistics', 'Supply chain management, facility security and quality standards');

DECLARE @DeptIT INT = (SELECT Id FROM org.Departments WHERE DepartmentCode = 'D0001');
DECLARE @DeptHR INT = (SELECT Id FROM org.Departments WHERE DepartmentCode = 'D0002');
DECLARE @DeptFin INT = (SELECT Id FROM org.Departments WHERE DepartmentCode = 'D0003');

IF NOT EXISTS (SELECT 1 FROM org.Designations WHERE DesignationCode = 'DES01')
    INSERT INTO org.Designations (DesignationCode, Title, GradeLevel) VALUES ('DES01', 'Software Engineer', 'L2');
IF NOT EXISTS (SELECT 1 FROM org.Designations WHERE DesignationCode = 'DES02')
    INSERT INTO org.Designations (DesignationCode, Title, GradeLevel) VALUES ('DES02', 'HR Executive', 'L1');
IF NOT EXISTS (SELECT 1 FROM org.Designations WHERE DesignationCode = 'DES03')
    INSERT INTO org.Designations (DesignationCode, Title, GradeLevel) VALUES ('DES03', 'Finance Analyst', 'L2');
IF NOT EXISTS (SELECT 1 FROM org.Designations WHERE DesignationCode = 'DES04')
    INSERT INTO org.Designations (DesignationCode, Title, GradeLevel) VALUES ('DES04', 'Team Lead', 'L3');

DECLARE @DesigSE INT = (SELECT Id FROM org.Designations WHERE DesignationCode = 'DES01');
DECLARE @DesigHR INT = (SELECT Id FROM org.Designations WHERE DesignationCode = 'DES02');
DECLARE @DesigFin INT = (SELECT Id FROM org.Designations WHERE DesignationCode = 'DES03');
DECLARE @DesigTL INT = (SELECT Id FROM org.Designations WHERE DesignationCode = 'DES04');

-- ------------------------------------------------------------------------------------
-- 3. SEED USERS & EMPLOYEES (INCLUDING EMP7777 MASTER TESTER)
-- ------------------------------------------------------------------------------------
-- Default Password Hash for "Admin@123" / "Emp@123"
DECLARE @PassHash NVARCHAR(255) = '$2a$11$qRzM8n.h1t4D8k/vX1O5E.5W9d/2J7X5E.5W9d/2J7X5E.5W9d/2J';

IF NOT EXISTS (SELECT 1 FROM sec.Users WHERE Username = 'admin')
    INSERT INTO sec.Users (RoleId, Username, NormalizedUsername, Email, PasswordHash) VALUES (@RoleHr, 'admin', 'ADMIN', 'admin@scipl.com', @PassHash);

IF NOT EXISTS (SELECT 1 FROM sec.Users WHERE Username = 'EMP2020')
    INSERT INTO sec.Users (RoleId, Username, NormalizedUsername, Email, PasswordHash) VALUES (@RoleEmp, 'EMP2020', 'EMP2020', 'aditbhange@gmail.com', @PassHash);
IF NOT EXISTS (SELECT 1 FROM sec.Users WHERE Username = 'EMP0001')
    INSERT INTO sec.Users (RoleId, Username, NormalizedUsername, Email, PasswordHash) VALUES (@RoleEmp, 'EMP0001', 'EMP0001', 'jane.smith@company.com', @PassHash);
IF NOT EXISTS (SELECT 1 FROM sec.Users WHERE Username = 'EMP1001')
    INSERT INTO sec.Users (RoleId, Username, NormalizedUsername, Email, PasswordHash) VALUES (@RoleEmp, 'EMP1001', 'EMP1001', 'raj.kumar@company.com', @PassHash);
IF NOT EXISTS (SELECT 1 FROM sec.Users WHERE Username = 'EMP7777')
    INSERT INTO sec.Users (RoleId, Username, NormalizedUsername, Email, PasswordHash) VALUES (@RoleEmp, 'EMP7777', 'EMP7777', 'kaustubh.bhatlawande@gmail.com', @PassHash);

DECLARE @U2020 INT = (SELECT Id FROM sec.Users WHERE Username = 'EMP2020');
DECLARE @U0001 INT = (SELECT Id FROM sec.Users WHERE Username = 'EMP0001');
DECLARE @U1001 INT = (SELECT Id FROM sec.Users WHERE Username = 'EMP1001');
DECLARE @U7777 INT = (SELECT Id FROM sec.Users WHERE Username = 'EMP7777');

IF NOT EXISTS (SELECT 1 FROM emp.Employees WHERE EmployeeCode = 'EMP2020')
    INSERT INTO emp.Employees (UserId, EmployeeCode, FirstName, LastName, OfficialEmail, DepartmentId, DepartmentCode, DesignationId, DesignationCode, OfficeId, OfficeCode, JoiningDate, IsMasterTester)
    VALUES (@U2020, 'EMP2020', 'Aditya', 'Bhange', 'aditbhange@gmail.com', @DeptIT, 'D0001', @DesigSE, 'DES01', @Off1, 'O0001', DATEADD(day, -5, SYSUTCDATETIME()), 0);

IF NOT EXISTS (SELECT 1 FROM emp.Employees WHERE EmployeeCode = 'EMP0001')
    INSERT INTO emp.Employees (UserId, EmployeeCode, FirstName, LastName, OfficialEmail, DepartmentId, DepartmentCode, DesignationId, DesignationCode, OfficeId, OfficeCode, JoiningDate, IsMasterTester)
    VALUES (@U0001, 'EMP0001', 'Jane', 'Smith', 'jane.smith@company.com', @DeptHR, 'D0002', @DesigHR, 'DES02', @Off1, 'O0001', DATEADD(day, -12, SYSUTCDATETIME()), 0);

IF NOT EXISTS (SELECT 1 FROM emp.Employees WHERE EmployeeCode = 'EMP1001')
    INSERT INTO emp.Employees (UserId, EmployeeCode, FirstName, LastName, OfficialEmail, DepartmentId, DepartmentCode, DesignationId, DesignationCode, OfficeId, OfficeCode, JoiningDate, IsMasterTester)
    VALUES (@U1001, 'EMP1001', 'Raj', 'Kumar', 'raj.kumar@company.com', @DeptFin, 'D0003', @DesigFin, 'DES03', @Off1, 'O0001', DATEADD(day, -10, SYSUTCDATETIME()), 0);

IF NOT EXISTS (SELECT 1 FROM emp.Employees WHERE EmployeeCode = 'EMP7777')
    INSERT INTO emp.Employees (UserId, EmployeeCode, FirstName, LastName, OfficialEmail, DepartmentId, DepartmentCode, DesignationId, DesignationCode, OfficeId, OfficeCode, JoiningDate, IsMasterTester)
    VALUES (@U7777, 'EMP7777', 'Kaustubh Shrikant', 'Bhatlawande', 'kaustubh.bhatlawande@gmail.com', @DeptIT, 'D0001', @DesigTL, 'DES04', @Off1, 'O0001', DATEADD(day, -2, SYSUTCDATETIME()), 1);

-- Ensure Master Employee Flag is set
UPDATE emp.Employees SET IsMasterTester = 1 WHERE EmployeeCode = 'EMP7777';

-- ------------------------------------------------------------------------------------
-- 4. SEED COURSE, MODULES & MULTI-FORMAT LESSON FILES
-- ------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM lms.Courses WHERE CourseCode = 'IND-2026')
    INSERT INTO lms.Courses (CourseCode, Title, Description, PassingScorePercentage, IsPublished)
    VALUES ('IND-2026', 'Corporate Employee Induction Course 2026', 'Mandatory 7-day onboarding induction training covering security governance, POSH compliance, ISO standards, and department SOPs.', 80.00, 1);

DECLARE @CourseId INT = (SELECT Id FROM lms.Courses WHERE CourseCode = 'IND-2026');

-- Modules
IF NOT EXISTS (SELECT 1 FROM lms.Modules WHERE ModuleCode = 'M0001')
    INSERT INTO lms.Modules (CourseId, ModuleCode, Title, Description, ModuleType, TargetDepartmentId, SortOrder)
    VALUES (@CourseId, 'M0001', 'Enterprise Security & Cyber Governance', 'Core corporate cybersecurity policies, phishing defense, and data protection guidelines.', 'COMMON', NULL, 1);
DECLARE @Mod1 INT = (SELECT Id FROM lms.Modules WHERE ModuleCode = 'M0001');

IF NOT EXISTS (SELECT 1 FROM lms.Modules WHERE ModuleCode = 'M0002')
    INSERT INTO lms.Modules (CourseId, ModuleCode, Title, Description, ModuleType, TargetDepartmentId, SortOrder)
    VALUES (@CourseId, 'M0002', 'Compliance, POSH & Workplace Safety', 'Corporate governance, POSH compliance policies, emergency safety diagrams, and device management.', 'COMMON', NULL, 2);
DECLARE @Mod2 INT = (SELECT Id FROM lms.Modules WHERE ModuleCode = 'M0002');

IF NOT EXISTS (SELECT 1 FROM lms.Modules WHERE ModuleCode = 'M0003')
    INSERT INTO lms.Modules (CourseId, ModuleCode, Title, Description, ModuleType, TargetDepartmentId, SortOrder)
    VALUES (@CourseId, 'M0003', 'ISO Quality Standards & Operations', 'ISO 27001 quality walkthrough, remote work policies, and financial approval matrices.', 'COMMON', NULL, 3);
DECLARE @Mod3 INT = (SELECT Id FROM lms.Modules WHERE ModuleCode = 'M0003');

IF NOT EXISTS (SELECT 1 FROM lms.Modules WHERE ModuleCode = 'M0004')
    INSERT INTO lms.Modules (CourseId, ModuleCode, Title, Description, ModuleType, TargetDepartmentId, SortOrder)
    VALUES (@CourseId, 'M0004', 'Finance & Accounting Operations Induction', 'Departmental financial SOPs, SAP expense claim guides, and audit trail compliance.', 'DEPARTMENT', @DeptFin, 4);
DECLARE @Mod4 INT = (SELECT Id FROM lms.Modules WHERE ModuleCode = 'M0004');

-- Lessons
IF NOT EXISTS (SELECT 1 FROM lms.Lessons WHERE LessonCode = 'L0001')
    INSERT INTO lms.Lessons (ModuleId, LessonCode, Title, Description, ContentType, SortOrder, MinDurationSeconds)
    VALUES (@Mod1, 'L0001', 'Phishing & Threat Awareness (Video)', 'Learn how to identify phishing emails, malicious attachments, and social engineering attempts.', 'VIDEO', 1, 120);
DECLARE @L1 INT = (SELECT Id FROM lms.Lessons WHERE LessonCode = 'L0001');
IF NOT EXISTS (SELECT 1 FROM lms.LessonFiles WHERE LessonId = @L1)
    INSERT INTO lms.LessonFiles (LessonId, FileName, FileType, MimeType, SharePointUrl, FileSizeByte, DurationSeconds, DisplayOrder, IsPrimary)
    VALUES (@L1, 'phishing_threat_awareness.mp4', 'VIDEO', 'video/mp4', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 15400000, 120, 1, 1);

IF NOT EXISTS (SELECT 1 FROM lms.Lessons WHERE LessonCode = 'L0002')
    INSERT INTO lms.Lessons (ModuleId, LessonCode, Title, Description, ContentType, SortOrder, MinDurationSeconds)
    VALUES (@Mod1, 'L0002', 'Corporate Code of Conduct Policy (PDF)', 'Official employee code of conduct, ethical standards, and workplace professionalism handbook.', 'PDF', 2, 30);
DECLARE @L2 INT = (SELECT Id FROM lms.Lessons WHERE LessonCode = 'L0002');
IF NOT EXISTS (SELECT 1 FROM lms.LessonFiles WHERE LessonId = @L2)
    INSERT INTO lms.LessonFiles (LessonId, FileName, FileType, MimeType, SharePointUrl, FileSizeByte, DurationSeconds, DisplayOrder, IsPrimary)
    VALUES (@L2, 'corporate_code_of_conduct.pdf', 'PDF', 'application/pdf', 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf', 2400000, 30, 1, 1);

IF NOT EXISTS (SELECT 1 FROM lms.Lessons WHERE LessonCode = 'L0003')
    INSERT INTO lms.Lessons (ModuleId, LessonCode, Title, Description, ContentType, SortOrder, MinDurationSeconds)
    VALUES (@Mod1, 'L0003', 'Information Security Guidelines (Word Document)', 'Detailed information security policies, password criteria, and clean desk guidelines.', 'DOCUMENT', 3, 30);
DECLARE @L3 INT = (SELECT Id FROM lms.Lessons WHERE LessonCode = 'L0003');
IF NOT EXISTS (SELECT 1 FROM lms.LessonFiles WHERE LessonId = @L3)
    INSERT INTO lms.LessonFiles (LessonId, FileName, FileType, MimeType, SharePointUrl, FileSizeByte, DurationSeconds, DisplayOrder, IsPrimary)
    VALUES (@L3, 'information_security_guidelines.docx', 'WORD', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'https://calibre-ebook.com/downloads/demos/demo.docx', 850000, 30, 1, 1);

-- ------------------------------------------------------------------------------------
-- 5. SEED ASSESSMENT & 20 QUESTIONS BANK
-- ------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM eval.Assessments WHERE CourseId = @CourseId)
    INSERT INTO eval.Assessments (CourseId, AssessmentCode, Title, TimeLimitMinutes, PassingScorePercentage)
    VALUES (@CourseId, 'A0001', 'Final Corporate Induction Assessment', 30, 80.00);

DECLARE @AssessmentId INT = (SELECT Id FROM eval.Assessments WHERE CourseId = @CourseId);

-- Seed 20 Assessment Questions if empty
IF NOT EXISTS (SELECT 1 FROM eval.AssessmentQuestions WHERE AssessmentId = @AssessmentId)
BEGIN
    -- Q1
    INSERT INTO eval.AssessmentQuestions (AssessmentId, QuestionText, Points, SortOrder) VALUES (@AssessmentId, 'What is the most effective initial action when receiving a suspicious email requesting credential verification?', 1.00, 1);
    DECLARE @Q1 INT = SCOPE_IDENTITY();
    INSERT INTO eval.QuestionOptions (QuestionId, OptionText, IsCorrect, SortOrder) VALUES
    (@Q1, 'Click the link immediately to verify sender identity', 0, 1),
    (@Q1, 'Report to IT Security Helpdesk and do not click embedded links', 1, 2),
    (@Q1, 'Forward email to all colleagues in department', 0, 3),
    (@Q1, 'Reply asking for password reset confirmation', 0, 4);

    -- Q2
    INSERT INTO eval.AssessmentQuestions (AssessmentId, QuestionText, Points, SortOrder) VALUES (@AssessmentId, 'What is the minimum required password complexity under SCIPL Information Security policy?', 1.00, 2);
    DECLARE @Q2 INT = SCOPE_IDENTITY();
    INSERT INTO eval.QuestionOptions (QuestionId, OptionText, IsCorrect, SortOrder) VALUES
    (@Q2, 'Any 6 digit numeric PIN', 0, 1),
    (@Q2, 'At least 12 characters including uppercase, lowercase, numbers, and special characters', 1, 2),
    (@Q2, '8 lowercase alphabetic letters', 0, 3),
    (@Q2, 'Your employee ID number followed by year', 0, 4);

    -- Q3
    INSERT INTO eval.AssessmentQuestions (AssessmentId, QuestionText, Points, SortOrder) VALUES (@AssessmentId, 'Under the Prevention of Sexual Harassment (POSH) policy, within what timeframe should a complaint be filed?', 1.00, 3);
    DECLARE @Q3 INT = SCOPE_IDENTITY();
    INSERT INTO eval.QuestionOptions (QuestionId, OptionText, IsCorrect, SortOrder) VALUES
    (@Q3, 'Within 3 months from the date of the incident', 1, 1),
    (@Q3, 'Only within 24 hours of occurrence', 0, 2),
    (@Q3, 'After 1 year of employment', 0, 3),
    (@Q3, 'No timeline exists, complaints cannot be filed', 0, 4);

    -- Q4
    INSERT INTO eval.AssessmentQuestions (AssessmentId, QuestionText, Points, SortOrder) VALUES (@AssessmentId, 'In the event of a fire emergency alarm, what is the primary evacuation protocol?', 1.00, 4);
    DECLARE @Q4 INT = SCOPE_IDENTITY();
    INSERT INTO eval.QuestionOptions (QuestionId, OptionText, IsCorrect, SortOrder) VALUES
    (@Q4, 'Take the central elevator to the ground floor', 0, 1),
    (@Q4, 'Use marked emergency stairwells and proceed to the designated outdoor assembly point', 1, 2),
    (@Q4, 'Remain at your desk until phone lines are clear', 0, 3),
    (@Q4, 'Gather personal belongings before leaving the building', 0, 4);

    -- Q5
    INSERT INTO eval.AssessmentQuestions (AssessmentId, QuestionText, Points, SortOrder) VALUES (@AssessmentId, 'What action is required if an employee experiences or witnesses a potential conflict of interest?', 1.00, 5);
    DECLARE @Q5 INT = SCOPE_IDENTITY();
    INSERT INTO eval.QuestionOptions (QuestionId, OptionText, IsCorrect, SortOrder) VALUES
    (@Q5, 'Ignore it if it does not affect personal salary', 0, 1),
    (@Q5, 'Disclose the conflict immediately to HR and Compliance in writing', 1, 2),
    (@Q5, 'Post about it on social media platforms', 0, 3),
    (@Q5, 'Discuss it only with external vendors', 0, 4);

    -- Q6
    INSERT INTO eval.AssessmentQuestions (AssessmentId, QuestionText, Points, SortOrder) VALUES (@AssessmentId, 'How should confidential customer Personally Identifiable Information (PII) be shared externally?', 1.00, 6);
    DECLARE @Q6 INT = SCOPE_IDENTITY();
    INSERT INTO eval.QuestionOptions (QuestionId, OptionText, IsCorrect, SortOrder) VALUES
    (@Q6, 'Via unencrypted personal email attachments', 0, 1),
    (@Q6, 'Encrypted with password protection over approved secure enterprise channels only', 1, 2),
    (@Q6, 'Uploaded to public cloud file sharing links', 0, 3),
    (@Q6, 'Printed and sent via unregistered local post', 0, 4);

    -- Q7
    INSERT INTO eval.AssessmentQuestions (AssessmentId, QuestionText, Points, SortOrder) VALUES (@AssessmentId, 'What must employees do when leaving their workstations unattended?', 1.00, 7);
    DECLARE @Q7 INT = SCOPE_IDENTITY();
    INSERT INTO eval.QuestionOptions (QuestionId, OptionText, IsCorrect, SortOrder) VALUES
    (@Q7, 'Lock computer screen (Win + L) and secure physical confidential documents', 1, 1),
    (@Q7, 'Leave monitor on so colleagues can see work status', 0, 2),
    (@Q7, 'Turn off monitor power cable only', 0, 3),
    (@Q7, 'Write password on sticky note on keyboard', 0, 4);

    -- Q8
    INSERT INTO eval.AssessmentQuestions (AssessmentId, QuestionText, Points, SortOrder) VALUES (@AssessmentId, 'Is connecting unauthorized personal USB flash drives to company laptops permitted?', 1.00, 8);
    DECLARE @Q8 INT = SCOPE_IDENTITY();
    INSERT INTO eval.QuestionOptions (QuestionId, OptionText, IsCorrect, SortOrder) VALUES
    (@Q8, 'Permitted if used only for personal music files', 0, 1),
    (@Q8, 'No, unauthorized removable media devices are blocked and prohibited by IT security policy', 1, 2),
    (@Q8, 'Permitted during weekend hours', 0, 3),
    (@Q8, 'Permitted without scanning if drive is new', 0, 4);

    -- Q9
    INSERT INTO eval.AssessmentQuestions (AssessmentId, QuestionText, Points, SortOrder) VALUES (@AssessmentId, 'What does an ISO 27001 Information Security Management System (ISMS) audit evaluate?', 1.00, 9);
    DECLARE @Q9 INT = SCOPE_IDENTITY();
    INSERT INTO eval.QuestionOptions (QuestionId, OptionText, IsCorrect, SortOrder) VALUES
    (@Q9, 'Office furniture ergonomic compliance', 0, 1),
    (@Q9, 'Risk management processes, asset security controls, and operational compliance', 1, 2),
    (@Q9, 'Employee cafeteria menu selection', 0, 3),
    (@Q9, 'Daily commute travel allowances', 0, 4);

    -- Q10
    INSERT INTO eval.AssessmentQuestions (AssessmentId, QuestionText, Points, SortOrder) VALUES (@AssessmentId, 'What is mandatory when accessing corporate internal applications while working remotely?', 1.00, 10);
    DECLARE @Q10 INT = SCOPE_IDENTITY();
    INSERT INTO eval.QuestionOptions (QuestionId, OptionText, IsCorrect, SortOrder) VALUES
    (@Q10, 'Connect via authorized Corporate VPN with Multi-Factor Authentication (MFA)', 1, 1),
    (@Q10, 'Use public unencrypted Wi-Fi at coffee shops without VPN', 0, 2),
    (@Q10, 'Share VPN credentials with family members', 0, 3),
    (@Q10, 'Disable antivirus software for faster speed', 0, 4);

    -- Q11
    INSERT INTO eval.AssessmentQuestions (AssessmentId, QuestionText, Points, SortOrder) VALUES (@AssessmentId, 'How quickly must a lost or stolen company laptop be reported to the IT Service Desk?', 1.00, 11);
    DECLARE @Q11 INT = SCOPE_IDENTITY();
    INSERT INTO eval.QuestionOptions (QuestionId, OptionText, IsCorrect, SortOrder) VALUES
    (@Q11, 'Within 30 days of the monthly audit', 0, 1),
    (@Q11, 'Immediately, within 2 hours of discovering the loss', 1, 2),
    (@Q11, 'After purchasing a replacement laptop personally', 0, 3),
    (@Q11, 'No reporting is necessary if device is password protected', 0, 4);

    -- Q12
    INSERT INTO eval.AssessmentQuestions (AssessmentId, QuestionText, Points, SortOrder) VALUES (@AssessmentId, 'What should you do if an unknown caller claiming to be IT Support asks for your MFA login code?', 1.00, 12);
    DECLARE @Q12 INT = SCOPE_IDENTITY();
    INSERT INTO eval.QuestionOptions (QuestionId, OptionText, IsCorrect, SortOrder) VALUES
    (@Q12, 'Provide the code immediately to avoid service disconnection', 0, 1),
    (@Q12, 'Refuse to share the code, hang up, and report impersonation to IT Security', 1, 2),
    (@Q12, 'Email the code to all department managers', 0, 3),
    (@Q12, 'Post the code on the team internal chat group', 0, 4);

    -- Q13
    INSERT INTO eval.AssessmentQuestions (AssessmentId, QuestionText, Points, SortOrder) VALUES (@AssessmentId, 'Who must approve operational expenditures exceeding designated departmental financial thresholds?', 1.00, 13);
    DECLARE @Q13 INT = SCOPE_IDENTITY();
    INSERT INTO eval.QuestionOptions (QuestionId, OptionText, IsCorrect, SortOrder) VALUES
    (@Q13, 'Any junior team colleague', 0, 1),
    (@Q13, 'The authorized Department Head and Finance Director as per Delegation of Authority', 1, 2),
    (@Q13, 'External vendors participating in the tender', 0, 3),
    (@Q13, 'Approval is not required for operational expenses', 0, 4);

    -- Q14
    INSERT INTO eval.AssessmentQuestions (AssessmentId, QuestionText, Points, SortOrder) VALUES (@AssessmentId, 'What document is mandatory when submitting travel expense claims on SAP?', 1.00, 14);
    DECLARE @Q14 INT = SCOPE_IDENTITY();
    INSERT INTO eval.QuestionOptions (QuestionId, OptionText, IsCorrect, SortOrder) VALUES
    (@Q14, 'Itemized original receipts and manager-approved travel authorization', 1, 1),
    (@Q14, 'Handwritten estimate without receipts', 0, 2),
    (@Q14, 'Personal credit card statement only', 0, 3),
    (@Q14, 'No documentation is required for SAP submissions', 0, 4);

    -- Q15
    INSERT INTO eval.AssessmentQuestions (AssessmentId, QuestionText, Points, SortOrder) VALUES (@AssessmentId, 'What constitutes a Suspicious Transaction Report (STR) trigger in finance operations?', 1.00, 15);
    DECLARE @Q15 INT = SCOPE_IDENTITY();
    INSERT INTO eval.QuestionOptions (QuestionId, OptionText, IsCorrect, SortOrder) VALUES
    (@Q15, 'Standard monthly salary disbursement', 0, 1),
    (@Q15, 'Unusually large structured payments or unexplained transfers to unverified third parties', 1, 2),
    (@Q15, 'Payment of utility bills on due dates', 0, 3),
    (@Q15, 'Approved inter-company tax payments', 0, 4);

    -- Q16
    INSERT INTO eval.AssessmentQuestions (AssessmentId, QuestionText, Points, SortOrder) VALUES (@AssessmentId, 'Who owns software code, reports, or design materials created by an employee during employment?', 1.00, 16);
    DECLARE @Q16 INT = SCOPE_IDENTITY();
    INSERT INTO eval.QuestionOptions (QuestionId, OptionText, IsCorrect, SortOrder) VALUES
    (@Q16, 'The individual employee exclusively', 0, 1),
    (@Q16, 'SCIPL exclusively owns all intellectual property created during employment', 1, 2),
    (@Q16, 'Shared 50/50 between employee and external contractor', 0, 3),
    (@Q16, 'Public domain after 30 days', 0, 4);

    -- Q17
    INSERT INTO eval.AssessmentQuestions (AssessmentId, QuestionText, Points, SortOrder) VALUES (@AssessmentId, 'Are employees authorized to speak on behalf of the company on social media regarding corporate news?', 1.00, 17);
    DECLARE @Q17 INT = SCOPE_IDENTITY();
    INSERT INTO eval.QuestionOptions (QuestionId, OptionText, IsCorrect, SortOrder) VALUES
    (@Q17, 'Yes, any employee can publish official corporate announcements', 0, 1),
    (@Q17, 'No, only designated official Corporate Communications spokespersons may speak publicly', 1, 2),
    (@Q17, 'Yes, if posted from personal accounts', 0, 3),
    (@Q17, 'Yes, during non-working weekend hours', 0, 4);

    -- Q18
    INSERT INTO eval.AssessmentQuestions (AssessmentId, QuestionText, Points, SortOrder) VALUES (@AssessmentId, 'What protection is provided to employees reporting unethical behavior in good faith under Whistleblower policy?', 1.00, 18);
    DECLARE @Q18 INT = SCOPE_IDENTITY();
    INSERT INTO eval.QuestionOptions (QuestionId, OptionText, IsCorrect, SortOrder) VALUES
    (@Q18, 'No protection is provided', 0, 1),
    (@Q18, 'Complete protection against retaliation, discrimination, or disciplinary action', 1, 2),
    (@Q18, 'Mandatory transfer to another office location', 0, 3),
    (@Q18, 'Public disclosure of whistleblower identity', 0, 4);

    -- Q19
    INSERT INTO eval.AssessmentQuestions (AssessmentId, QuestionText, Points, SortOrder) VALUES (@AssessmentId, 'How must obsolete corporate hard drives and storage media be disposed of?', 1.00, 19);
    DECLARE @Q19 INT = SCOPE_IDENTITY();
    INSERT INTO eval.QuestionOptions (QuestionId, OptionText, IsCorrect, SortOrder) VALUES
    (@Q19, 'Thrown in standard office recycling bins', 0, 1),
    (@Q19, 'Certified degaussing and physical destruction handled by IT Asset Management', 1, 2),
    (@Q19, 'Sold directly at local electronics markets', 0, 3),
    (@Q19, 'Given to employees as personal gifts without wiping', 0, 4);

    -- Q20
    INSERT INTO eval.AssessmentQuestions (AssessmentId, QuestionText, Points, SortOrder) VALUES (@AssessmentId, 'What must be completed prior to onboarding a new third-party software vendor?', 1.00, 20);
    DECLARE @Q20 INT = SCOPE_IDENTITY();
    INSERT INTO eval.QuestionOptions (QuestionId, OptionText, IsCorrect, SortOrder) VALUES
    (@Q20, 'Verbal agreement over telephone', 0, 1),
    (@Q20, 'Third-Party Cyber Risk Assessment and Non-Disclosure Agreement (NDA) execution', 1, 2),
    (@Q20, 'Verifying vendor logo on social media', 0, 3),
    (@Q20, 'No assessment is needed for cloud services', 0, 4);
END

PRINT '✔ SEED SUCCESSFUL: All Employees, Offices, Departments, Courses, Modules, Lessons & 20 Questions Seeded!';
GO
