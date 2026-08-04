using System;
using System.Collections.Generic;

namespace LmsPortal.Core.Entities
{
    public static class IstDateTime
    {
        public static DateTime Now
        {
            get
            {
                try
                {
                    var tz = TimeZoneInfo.FindSystemTimeZoneById(OperatingSystem.IsWindows() ? "India Standard Time" : "Asia/Kolkata");
                    return TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, tz);
                }
                catch
                {
                    return DateTime.UtcNow.AddHours(5).AddMinutes(30);
                }
            }
        }
    }

    public abstract class BaseAuditableEntity
    {
        public int Id { get; set; }
        public DateTime CreatedAt { get; set; } = IstDateTime.Now;
        public DateTime UpdatedAt { get; set; } = IstDateTime.Now;
        public string? CreatedBy { get; set; }
        public string? UpdatedBy { get; set; }
        public bool IsDeleted { get; set; } = false;
        public byte[] RowVersion { get; set; } = Array.Empty<byte>();
    }

    // ==========================================
    // 1. ORGANIZATION DOMAIN
    // ==========================================

    public class Office : BaseAuditableEntity
    {
        public string OfficeCode { get; set; } = string.Empty; // Format: O0001
        public string OfficeName { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string State { get; set; } = string.Empty;
        public string Country { get; set; } = "India";
        public bool IsActive { get; set; } = true;

        public ICollection<Employee> Employees { get; set; } = new List<Employee>();
    }

    public class Department : BaseAuditableEntity
    {
        public string DepartmentCode { get; set; } = string.Empty; // Format: D0001
        public string DepartmentName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool IsActive { get; set; } = true;

        public ICollection<Employee> Employees { get; set; } = new List<Employee>();
        public ICollection<Module> Modules { get; set; } = new List<Module>();
    }

    public class Designation : BaseAuditableEntity
    {
        public string DesignationCode { get; set; } = string.Empty; // Format: G0001
        public string Title { get; set; } = string.Empty;
        public string? GradeLevel { get; set; }
        public bool IsActive { get; set; } = true;

        public ICollection<Employee> Employees { get; set; } = new List<Employee>();
    }

    // ==========================================
    // 2. SECURITY & IDENTITY DOMAIN
    // ==========================================

    public class Role : BaseAuditableEntity
    {
        public string RoleName { get; set; } = string.Empty;
        public string NormalizedRoleName { get; set; } = string.Empty;
        public string? Description { get; set; }

        public ICollection<User> Users { get; set; } = new List<User>();
        public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
    }

    public class Permission : BaseAuditableEntity
    {
        public string PermissionKey { get; set; } = string.Empty;
        public string ModuleName { get; set; } = string.Empty;
        public string? Description { get; set; }

        public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
    }

    public class RolePermission
    {
        public int RoleId { get; set; }
        public int PermissionId { get; set; }
        public DateTime GrantedAt { get; set; } = IstDateTime.Now;
        public string? GrantedBy { get; set; }

        public Role Role { get; set; } = null!;
        public Permission Permission { get; set; } = null!;
    }

    public class User : BaseAuditableEntity
    {
        public string Username { get; set; } = string.Empty;
        public string NormalizedUsername { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string NormalizedEmail { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string SecurityStamp { get; set; } = Guid.NewGuid().ToString();
        public string ConcurrencyStamp { get; set; } = Guid.NewGuid().ToString();
        public string? PhoneNumber { get; set; }
        public bool IsEmailConfirmed { get; set; } = true;
        public bool IsActive { get; set; } = true;
        public int RoleId { get; set; }

        public Role Role { get; set; } = null!;
        public Employee? Employee { get; set; }
        public ICollection<EmployeeSession> Sessions { get; set; } = new List<EmployeeSession>();
        public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
    }

    public class EmployeeSession : BaseAuditableEntity
    {
        public int UserId { get; set; }
        public string SessionToken { get; set; } = string.Empty;
        public string IpAddress { get; set; } = string.Empty;
        public string UserAgent { get; set; } = string.Empty;
        public string DeviceType { get; set; } = "Desktop";
        public string? Browser { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime LastActivityAt { get; set; } = IstDateTime.Now;
        public DateTime ExpiresAt { get; set; }

        public User User { get; set; } = null!;
    }

    public class RefreshToken : BaseAuditableEntity
    {
        public int UserId { get; set; }
        public string Token { get; set; } = string.Empty;
        public DateTime ExpiresAt { get; set; }
        public bool IsRevoked { get; set; } = false;
        public DateTime? RevokedAt { get; set; }
        public string? ReplacedByToken { get; set; }
        public string? CreatedByIp { get; set; }

        public User User { get; set; } = null!;
    }

    // ==========================================
    // 3. EMPLOYEE DOMAIN
    // ==========================================

    public class Employee : BaseAuditableEntity
    {
        public int UserId { get; set; }
        public string EmployeeCode { get; set; } = string.Empty; // Entered manually by HR
        public string FirstName { get; set; } = string.Empty;
        public string? MiddleName { get; set; }
        public string LastName { get; set; } = string.Empty;
        public string OfficialEmail { get; set; } = string.Empty;
        public int DepartmentId { get; set; }
        public string DepartmentCode { get; set; } = string.Empty; // e.g. D0001
        public int DesignationId { get; set; }
        public string DesignationCode { get; set; } = string.Empty; // e.g. G0001
        public int OfficeId { get; set; }
        public string OfficeCode { get; set; } = string.Empty; // e.g. O0001
        public DateTime JoiningDate { get; set; }
        public string EmploymentStatus { get; set; } = "ACTIVE";
        public bool IsMasterTester { get; set; } = false;

        public User User { get; set; } = null!;
        public Department Department { get; set; } = null!;
        public Designation Designation { get; set; } = null!;
        public Office Office { get; set; } = null!;
        public EmployeeProfile? Profile { get; set; }
        public ICollection<EmployeeNotification> Notifications { get; set; } = new List<EmployeeNotification>();
        public ICollection<LessonProgress> LessonProgresses { get; set; } = new List<LessonProgress>();
        public ICollection<AssessmentAttempt> AssessmentAttempts { get; set; } = new List<AssessmentAttempt>();
        public ICollection<Certificate> Certificates { get; set; } = new List<Certificate>();
    }

    public class EmployeeProfile : BaseAuditableEntity
    {
        public int EmployeeId { get; set; }
        public string? PhoneNumber { get; set; }
        public string? EmergencyContactName { get; set; }
        public string? EmergencyContactPhone { get; set; }
        public string? BloodGroup { get; set; }
        public string? AvatarUrl { get; set; }
        public string? Bio { get; set; }

        public Employee Employee { get; set; } = null!;
    }

    // ==========================================
    // 4. LEARNING CURRICULUM DOMAIN
    // ==========================================

    public class Course : BaseAuditableEntity
    {
        public string CourseCode { get; set; } = string.Empty; // Format: C0001
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal PassingScorePercentage { get; set; } = 80.00m;
        public bool IsPublished { get; set; } = true;

        public ICollection<Module> Modules { get; set; } = new List<Module>();
        public ICollection<Assessment> Assessments { get; set; } = new List<Assessment>();
        public ICollection<Certificate> Certificates { get; set; } = new List<Certificate>();
    }

    public class Module : BaseAuditableEntity
    {
        public int CourseId { get; set; }
        public string ModuleCode { get; set; } = string.Empty; // Format: M0001
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string ModuleType { get; set; } = "COMMON"; // COMMON | DEPARTMENT
        public int? TargetDepartmentId { get; set; }
        public int SortOrder { get; set; } = 0;

        public Course Course { get; set; } = null!;
        public Department? TargetDepartment { get; set; }
        public ICollection<Lesson> Lessons { get; set; } = new List<Lesson>();
        public ICollection<AssessmentQuestion> AssessmentQuestions { get; set; } = new List<AssessmentQuestion>();
    }

    public class Lesson : BaseAuditableEntity
    {
        public int ModuleId { get; set; }
        public string LessonCode { get; set; } = string.Empty; // Format: L0001
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string ContentType { get; set; } = "VIDEO"; // VIDEO, PDF, PPT, VIDEO_PDF
        public int SortOrder { get; set; } = 0;
        public int MinDurationSeconds { get; set; } = 0;

        public Module Module { get; set; } = null!;
        public ICollection<LessonFile> Files { get; set; } = new List<LessonFile>();
        public ICollection<LessonProgress> LessonProgresses { get; set; } = new List<LessonProgress>();
    }

    public class LessonFile : BaseAuditableEntity
    {
        public int LessonId { get; set; }
        public string FileName { get; set; } = string.Empty;
        public string FileType { get; set; } = string.Empty; // VIDEO, PDF, PPT, DOC, XLS
        public string MimeType { get; set; } = string.Empty;
        public string SharePointUrl { get; set; } = string.Empty;
        public long FileSizeByte { get; set; }
        public int DurationSeconds { get; set; }
        public int DisplayOrder { get; set; }
        public bool IsPrimary { get; set; } = true;

        public Lesson Lesson { get; set; } = null!;
    }

    public class LessonProgress : BaseAuditableEntity
    {
        public int EmployeeId { get; set; }
        public int LessonId { get; set; }
        public bool IsCompleted { get; set; } = false;
        public decimal WatchedSeconds { get; set; } = 0.00m;
        public decimal TotalSeconds { get; set; } = 0.00m;
        public DateTime? CompletedAt { get; set; }

        public Employee Employee { get; set; } = null!;
        public Lesson Lesson { get; set; } = null!;
    }

    // ==========================================
    // 5. PROCTORED ASSESSMENT DOMAIN
    // ==========================================

    public class Assessment : BaseAuditableEntity
    {
        public int CourseId { get; set; }
        public string AssessmentCode { get; set; } = string.Empty; // Format: A0001
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int TimeLimitMinutes { get; set; } = 30;
        public decimal PassingScorePercentage { get; set; } = 80.00m;
        public bool IsPublished { get; set; } = true;

        public Course Course { get; set; } = null!;
        public ICollection<AssessmentQuestion> Questions { get; set; } = new List<AssessmentQuestion>();
        public ICollection<AssessmentAttempt> Attempts { get; set; } = new List<AssessmentAttempt>();
    }

    public class AssessmentQuestion : BaseAuditableEntity
    {
        public int AssessmentId { get; set; }
        public int? ModuleId { get; set; }
        public string QuestionText { get; set; } = string.Empty;
        public string? Explanation { get; set; }
        public decimal Points { get; set; } = 1.00m;
        public int SortOrder { get; set; } = 0;

        public Assessment Assessment { get; set; } = null!;
        public Module? Module { get; set; }
        public ICollection<QuestionOption> Options { get; set; } = new List<QuestionOption>();
        public ICollection<AssessmentAnswer> Answers { get; set; } = new List<AssessmentAnswer>();
    }

    public class QuestionOption : BaseAuditableEntity
    {
        public int QuestionId { get; set; }
        public string OptionText { get; set; } = string.Empty;
        public bool IsCorrect { get; set; } = false;
        public int SortOrder { get; set; } = 0;

        public AssessmentQuestion Question { get; set; } = null!;
        public ICollection<AssessmentAnswer> SelectedAnswers { get; set; } = new List<AssessmentAnswer>();
    }

    public class AssessmentAttempt : BaseAuditableEntity
    {
        public int EmployeeId { get; set; }
        public int AssessmentId { get; set; }
        public decimal ScorePercentage { get; set; }
        public bool Passed { get; set; }
        public int TotalQuestions { get; set; }
        public int CorrectAnswersCount { get; set; }
        public int TimeTakenSeconds { get; set; }
        public DateTime StartedAt { get; set; } = IstDateTime.Now;
        public DateTime SubmittedAt { get; set; } = IstDateTime.Now;

        public Employee Employee { get; set; } = null!;
        public Assessment Assessment { get; set; } = null!;
        public ICollection<AssessmentAnswer> Answers { get; set; } = new List<AssessmentAnswer>();
    }

    public class AssessmentAnswer
    {
        public int AttemptId { get; set; }
        public int QuestionId { get; set; }
        public int? SelectedOptionId { get; set; }
        public bool IsCorrect { get; set; } = false;
        public decimal PointsAwarded { get; set; } = 0.00m;
        public DateTime AnsweredAt { get; set; } = IstDateTime.Now;

        public AssessmentAttempt Attempt { get; set; } = null!;
        public AssessmentQuestion Question { get; set; } = null!;
        public QuestionOption? SelectedOption { get; set; }
    }

    // ==========================================
    // 6. CERTIFICATE DOMAIN
    // ==========================================

    public class Certificate : BaseAuditableEntity
    {
        public int EmployeeId { get; set; }
        public int CourseId { get; set; }
        public string CertificateCode { get; set; } = string.Empty; // Format: T0001
        public string CertificateNumber { get; set; } = string.Empty;
        public string VerificationCode { get; set; } = string.Empty;
        public string VerificationUrl { get; set; } = string.Empty;
        public string? QRCode { get; set; }
        public string Status { get; set; } = "ISSUED"; // ISSUED, REVOKED, EXPIRED
        public DateTime IssueDate { get; set; } = IstDateTime.Now;
        public string GeneratedBy { get; set; } = "SYSTEM";
        public string? PdfPath { get; set; }

        public Employee Employee { get; set; } = null!;
        public Course Course { get; set; } = null!;
        public ICollection<CertificateVerificationLog> VerificationLogs { get; set; } = new List<CertificateVerificationLog>();
    }

    public class CertificateVerificationLog
    {
        public int Id { get; set; }
        public int CertificateId { get; set; }
        public DateTime VerifiedAt { get; set; } = IstDateTime.Now;
        public string VerifierIpAddress { get; set; } = string.Empty;
        public string? UserAgent { get; set; }
        public bool IsSuccessful { get; set; } = true;

        public Certificate Certificate { get; set; } = null!;
    }

    // ==========================================
    // 7. GOVERNANCE & AUDIT DOMAIN
    // ==========================================

    public class EmployeeNotification : BaseAuditableEntity
    {
        public int EmployeeId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string NotificationType { get; set; } = "INFO";
        public bool IsRead { get; set; } = false;
        public DateTime? ReadAt { get; set; }

        public Employee Employee { get; set; } = null!;
    }

    public class ApplicationSetting
    {
        public string SettingKey { get; set; } = string.Empty;
        public string SettingValue { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Category { get; set; } = "GENERAL";
        public DateTime UpdatedAt { get; set; } = IstDateTime.Now;
        public string? UpdatedBy { get; set; }
    }

    public class ActivityLog
    {
        public int Id { get; set; }
        public int? UserId { get; set; }
        public string Role { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty;
        public string? Details { get; set; }
        public string? IpAddress { get; set; }
        public string? UserAgent { get; set; }
        public DateTime CreatedAt { get; set; } = IstDateTime.Now;
    }

    public class AuditLog
    {
        public int Id { get; set; }
        public string EntityName { get; set; } = string.Empty;
        public string EntityId { get; set; } = string.Empty;
        public string ActionType { get; set; } = string.Empty;
        public string? OldValuesJSON { get; set; }
        public string? NewValuesJSON { get; set; }
        public string ChangedBy { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}
