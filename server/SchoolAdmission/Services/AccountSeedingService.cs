using SchoolAdmission.Models;
using SchoolAdmission.Data;
using Microsoft.EntityFrameworkCore;

namespace SchoolAdmission.Services
{
    public class AccountSeedingService
    {
        private readonly SchoolAdmissionDbContext _context;

        public AccountSeedingService(SchoolAdmissionDbContext context)
        {
            _context = context;
        }

        public async Task SeedAccountsAsync()
        {
            // Force seed regardless of existing data
            if (await _context.Accounts.AnyAsync())
                return;

            // Create AccountTypes if they don't exist
            await SeedAccountTypesAsync();

            // Seed Teachers
            await SeedTeachersAsync();

            // Seed Admins
            await SeedAdminsAsync();

            await _context.SaveChangesAsync();
        }

        private async Task SeedAccountTypesAsync()
        {
            if (!await _context.AccountTypes.AnyAsync())
            {
                var accountTypes = new List<AccountType>
                {
                    new AccountType { AccountTypeName = "SuperAdmin" },
                    new AccountType { AccountTypeName = "Teacher" },
                    new AccountType { AccountTypeName = "Student" },
                    new AccountType { AccountTypeName = "Admin" }
                };

                _context.AccountTypes.AddRange(accountTypes);
                await _context.SaveChangesAsync();
            }
        }

        private async Task SeedTeachersAsync()
        {
            var teacherAccount = new Account
            {
                NationalId = "teacher@school.com", // Using email as NationalId for teachers
                Email = "teacher@school.com",
                FullNameEn = "Teacher One",
                FullNameAr = "مدرس واحد",
                AccountTypeId = await GetAccountTypeId("Teacher"),
                IsActive = true,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("1234")
            };

            _context.Accounts.Add(teacherAccount);
            await _context.SaveChangesAsync();

            var teacherLogin = new Login
            {
                AccountId = teacherAccount.Id,
                Email = teacherAccount.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("1234")
            };

            _context.Logins.Add(teacherLogin);
        }

        private async Task SeedAdminsAsync()
        {
            var adminAccounts = new List<Account>
            {
                new Account
                {
                    NationalId = "admin1@school.com",
                    Email = "admin1@school.com",
                    FullNameEn = "Admin One",
                    FullNameAr = "مدير واحد",
                    AccountTypeId = await GetAccountTypeId("Admin"),
                    IsActive = true,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123")
                },
                new Account
                {
                    NationalId = "admin2@school.com",
                    Email = "admin2@school.com",
                    FullNameEn = "Admin Two",
                    FullNameAr = "مدير اثنين",
                    AccountTypeId = await GetAccountTypeId("Admin"),
                    IsActive = true,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123")
                },
                new Account
                {
                    NationalId = "admin3@school.com",
                    Email = "admin3@school.com",
                    FullNameEn = "Admin Three",
                    FullNameAr = "مدير ثلاثة",
                    AccountTypeId = await GetAccountTypeId("Admin"),
                    IsActive = true,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123")
                },
                new Account
                {
                    NationalId = "superadmin@school.com",
                    Email = "superadmin@school.com",
                    FullNameEn = "Super Admin",
                    FullNameAr = "مدير عام",
                    AccountTypeId = await GetAccountTypeId("SuperAdmin"),
                    IsActive = true,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("superadmin123")
                }
            };

            _context.Accounts.AddRange(adminAccounts);
            await _context.SaveChangesAsync();

            var adminLogins = new List<Login>
            {
                new Login
                {
                    AccountId = adminAccounts[0].Id,
                    Email = adminAccounts[0].Email,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123")
                },
                new Login
                {
                    AccountId = adminAccounts[1].Id,
                    Email = adminAccounts[1].Email,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123")
                },
                new Login
                {
                    AccountId = adminAccounts[2].Id,
                    Email = adminAccounts[2].Email,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123")
                },
                new Login
                {
                    AccountId = adminAccounts[3].Id,
                    Email = adminAccounts[3].Email,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("superadmin123")
                }
            };

            _context.Logins.AddRange(adminLogins);
        }

        private async Task<long> GetAccountTypeId(string accountTypeName)
        {
            var accountType = await _context.AccountTypes
                .FirstOrDefaultAsync(at => at.AccountTypeName == accountTypeName);
            return accountType?.Id ?? 1; // Default to 1 if not found
        }
    }
} 