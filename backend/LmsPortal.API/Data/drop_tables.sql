-- ====================================================================================
-- SCRIPT: Drop All LMS-Portal Tables Cleanly (Without Dropping the Database)
-- DESCRIPTION: Drops foreign keys first to avoid dependency errors, then drops tables.
-- ====================================================================================

USE [LMS-Portal];
GO

-- 1. DROP ALL FOREIGN KEY CONSTRAINTS DYNAMICALLY
DECLARE @dropFKs NVARCHAR(MAX) = N'';

SELECT @dropFKs += N'ALTER TABLE [' + s.name + N'].[' + t.name + N'] DROP CONSTRAINT [' + fk.name + N'];' + CHAR(13)
FROM sys.foreign_keys fk
INNER JOIN sys.tables t ON fk.parent_object_id = t.object_id
INNER JOIN sys.schemas s ON t.schema_id = s.schema_id;

IF LEN(@dropFKs) > 0
BEGIN
    EXEC sp_executesql @dropFKs;
    PRINT '✔ All Foreign Key constraints dropped successfully.';
END
GO

-- 2. DROP ALL TABLES ACROSS SCHEMAS
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

PRINT '✔ All LMS-Portal tables dropped cleanly! The database [LMS-Portal] remains intact.';
GO
