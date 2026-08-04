using System;
using System.Linq;
using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using LmsPortal.Core.Entities;

namespace LmsPortal.API.Data
{
    public class LmsDbContext : DbContext
    {
        public LmsDbContext(DbContextOptions<LmsDbContext> options) : base(options) { }

        // Organization
        public DbSet<Office> Offices => Set<Office>();
        public DbSet<Department> Departments => Set<Department>();
        public DbSet<Designation> Designations => Set<Designation>();

        // Security & Identity
        public DbSet<Role> Roles => Set<Role>();
        public DbSet<Permission> Permissions => Set<Permission>();
        public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
        public DbSet<User> Users => Set<User>();
        public DbSet<EmployeeSession> EmployeeSessions => Set<EmployeeSession>();
        public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

        // Employees
        public DbSet<Employee> Employees => Set<Employee>();
        public DbSet<EmployeeProfile> EmployeeProfiles => Set<EmployeeProfile>();
        public DbSet<EmployeeNotification> EmployeeNotifications => Set<EmployeeNotification>();

        // Learning
        public DbSet<Course> Courses => Set<Course>();
        public DbSet<Module> Modules => Set<Module>();
        public DbSet<Lesson> Lessons => Set<Lesson>();
        public DbSet<LessonFile> LessonFiles => Set<LessonFile>();
        public DbSet<LessonProgress> LessonProgresses => Set<LessonProgress>();

        // Assessments
        public DbSet<Assessment> Assessments => Set<Assessment>();
        public DbSet<AssessmentQuestion> AssessmentQuestions => Set<AssessmentQuestion>();
        public DbSet<QuestionOption> QuestionOptions => Set<QuestionOption>();
        public DbSet<AssessmentAttempt> AssessmentAttempts => Set<AssessmentAttempt>();
        public DbSet<AssessmentAnswer> AssessmentAnswers => Set<AssessmentAnswer>();

        // Certificates & Verification
        public DbSet<Certificate> Certificates => Set<Certificate>();
        public DbSet<CertificateVerificationLog> CertificateVerificationLogs => Set<CertificateVerificationLog>();

        // Administration & Audit
        public DbSet<ApplicationSetting> ApplicationSettings => Set<ApplicationSetting>();
        public DbSet<ActivityLog> ActivityLogs => Set<ActivityLog>();
        public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure Schemas
            modelBuilder.Entity<Office>().ToTable("Offices", "org");
            modelBuilder.Entity<Department>().ToTable("Departments", "org");
            modelBuilder.Entity<Designation>().ToTable("Designations", "org");

            modelBuilder.Entity<Role>().ToTable("Roles", "sec");
            modelBuilder.Entity<Permission>().ToTable("Permissions", "sec");
            modelBuilder.Entity<RolePermission>().ToTable("RolePermissions", "sec");
            modelBuilder.Entity<User>().ToTable("Users", "sec");
            modelBuilder.Entity<EmployeeSession>().ToTable("EmployeeSessions", "sec");
            modelBuilder.Entity<RefreshToken>().ToTable("RefreshTokens", "sec");

            modelBuilder.Entity<Employee>().ToTable("Employees", "emp");
            modelBuilder.Entity<EmployeeProfile>().ToTable("EmployeeProfiles", "emp");
            modelBuilder.Entity<EmployeeNotification>().ToTable("EmployeeNotifications", "emp");

            modelBuilder.Entity<Course>().ToTable("Courses", "lms");
            modelBuilder.Entity<Module>().ToTable("Modules", "lms");
            modelBuilder.Entity<Lesson>().ToTable("Lessons", "lms");
            modelBuilder.Entity<LessonFile>().ToTable("LessonFiles", "lms");
            modelBuilder.Entity<LessonProgress>().ToTable("LessonProgress", "lms");

            modelBuilder.Entity<Assessment>().ToTable("Assessments", "eval");
            modelBuilder.Entity<AssessmentQuestion>().ToTable("AssessmentQuestions", "eval");
            modelBuilder.Entity<QuestionOption>().ToTable("QuestionOptions", "eval");
            modelBuilder.Entity<AssessmentAttempt>().ToTable("AssessmentAttempts", "eval");
            modelBuilder.Entity<AssessmentAnswer>().ToTable("AssessmentAnswers", "eval");

            modelBuilder.Entity<Certificate>().ToTable("Certificates", "cert");
            modelBuilder.Entity<CertificateVerificationLog>().ToTable("CertificateVerificationLogs", "cert");

            modelBuilder.Entity<ApplicationSetting>().ToTable("ApplicationSettings", "adm");
            modelBuilder.Entity<ActivityLog>().ToTable("ActivityLogs", "adm");
            modelBuilder.Entity<AuditLog>().ToTable("AuditLogs", "adm");

            // Composite Keys
            modelBuilder.Entity<RolePermission>().HasKey(rp => new { rp.RoleId, rp.PermissionId });
            modelBuilder.Entity<AssessmentAnswer>().HasKey(aa => new { aa.AttemptId, aa.QuestionId });
            modelBuilder.Entity<ApplicationSetting>().HasKey(s => s.SettingKey);

            // RowVersion Optimistic Concurrency
            foreach (var entityType in modelBuilder.Model.GetEntityTypes())
            {
                if (typeof(BaseAuditableEntity).IsAssignableFrom(entityType.ClrType))
                {
                    modelBuilder.Entity(entityType.ClrType)
                        .Property(nameof(BaseAuditableEntity.RowVersion))
                        .IsRowVersion();
                }
            }

            // Global Soft Delete Filters
            foreach (var entityType in modelBuilder.Model.GetEntityTypes())
            {
                if (typeof(BaseAuditableEntity).IsAssignableFrom(entityType.ClrType))
                {
                    var parameter = Expression.Parameter(entityType.ClrType, "e");
                    var property = Expression.Property(parameter, nameof(BaseAuditableEntity.IsDeleted));
                    var falseConstant = Expression.Constant(false);
                    var lambda = Expression.Lambda(Expression.Equal(property, falseConstant), parameter);

                    modelBuilder.Entity(entityType.ClrType).HasQueryFilter(lambda);
                }
            }
        }
    }
}
