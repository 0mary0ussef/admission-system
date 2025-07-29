using Microsoft.EntityFrameworkCore;
using SchoolAdmission.Models;

namespace SchoolAdmission.Data
{
    public class SchoolAdmissionDbContext : DbContext
    {
        public SchoolAdmissionDbContext(DbContextOptions<SchoolAdmissionDbContext> options) : base(options) { }

        public DbSet<Student> Students { get; set; }
        public DbSet<Teacher> Teachers { get; set; }
        public DbSet<Admin> Admins { get; set; }
        public DbSet<Exam> Exams { get; set; }
        public DbSet<InterviewScore> InterviewScores { get; set; }
    }

    public static class DbInitializer
    {
        public static void SeedTeachers(SchoolAdmissionDbContext context)
        {
            if (!context.Teachers.Any())
            {
                context.Teachers.AddRange(
                    new Teacher
                    {
                        Email = "t1@gmail.com",
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword("1234"),
                        FullName = "Teacher One"
                    },
                    new Teacher
                    {
                        Email = "t2@gmail.com",
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword("1234"),
                        FullName = "Teacher Two"
                    }
                );
                context.SaveChanges();
            }
        }

        public static void SeedAdmins(SchoolAdmissionDbContext context)
        {
            if (!context.Admins.Any())
            {
                context.Admins.AddRange(
                    new Admin
                    {
                        Email = "saif@school.com",
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
                        Role = "admin",
                        FullName = "Saif",
                        InterviewScores = new List<InterviewScore>(),
                    },
                    new Admin
                    {
                        Email = "mohamed@school.com",
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
                        Role = "admin",
                        FullName = "Mohamed",
                        InterviewScores = new List<InterviewScore>(),
                    },
                    new Admin
                    {
                        Email = "ahmed@school.com",
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
                        Role = "admin",
                        FullName = "Ahmed",
                        InterviewScores = new List<InterviewScore>(),
                    },
                    new Admin
                    {
                        Email = "superadmin@school.com",
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword("superadmin123"),
                        Role = "superadmin",
                        FullName = "Super Admin",
                        InterviewScores = new List<InterviewScore>(),
                    }
                );
                context.SaveChanges();
            }
        }
    }
} 