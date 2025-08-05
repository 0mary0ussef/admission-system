using Microsoft.EntityFrameworkCore;
using SchoolAdmission.Models;

namespace SchoolAdmission.Data
{
    public class SchoolAdmissionDbContext : DbContext
    {
        public SchoolAdmissionDbContext(DbContextOptions<SchoolAdmissionDbContext> options) : base(options) { }

        // Scaffolded models from ElsewedySchoolSys database
        public DbSet<Account> Accounts { get; set; }
        public DbSet<Login> Logins { get; set; }
        public DbSet<AdmissionProfile> AdmissionProfiles { get; set; }
        public DbSet<StudentExtension> StudentExtensions { get; set; }
        public DbSet<AccountType> AccountTypes { get; set; }

        // InterviewScore - Still used by AdminController
        public DbSet<InterviewScore> InterviewScores { get; set; }

        // New project-specific models
        public DbSet<Section> Sections { get; set; }
        public DbSet<ExamQuestion> ExamQuestions { get; set; }
        public DbSet<StudentExamResults> StudentExamResults { get; set; }
        public DbSet<StudentExamAnswers> StudentExamAnswers { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Use the more developed tables (with 's')
            modelBuilder.Entity<Account>().ToTable("Accounts");
            modelBuilder.Entity<AccountType>().ToTable("AccountTypes");
            modelBuilder.Entity<AdmissionProfile>().ToTable("AdmissionProfiles");
            modelBuilder.Entity<Login>().ToTable("Logins");
            modelBuilder.Entity<StudentExtension>().ToTable("StudentExtensions");

            // Configure primary keys for scaffolded models
            modelBuilder.Entity<AdmissionProfile>()
                .HasKey(ap => ap.AccountId);

            modelBuilder.Entity<StudentExtension>()
                .HasKey(se => se.AccountId);

            // Configure relationships for new models
            modelBuilder.Entity<ExamQuestion>()
                .HasOne(e => e.Section)
                .WithMany(s => s.Exams)
                .HasForeignKey(e => e.SectionId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<StudentExamResults>()
                .HasKey(ser => ser.AccountId);

            modelBuilder.Entity<StudentExamResults>()
                .HasOne<Account>()
                .WithOne()
                .HasForeignKey<StudentExamResults>(ser => ser.AccountId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<StudentExamAnswers>()
                .HasOne(sea => sea.Exam)
                .WithMany(e => e.StudentExamAnswers)
                .HasForeignKey(sea => sea.ExamId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<StudentExamAnswers>()
                .HasOne<Account>()
                .WithMany()
                .HasForeignKey(sea => sea.AccountId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure composite key for StudentExamAnswers if needed
            modelBuilder.Entity<StudentExamAnswers>()
                .HasIndex(sea => new { sea.AccountId, sea.ExamId })
                .IsUnique();
        }
    }

    // Note: Old seeding methods removed as they referenced deleted models
    // New seeding is handled by AccountSeedingService
} 