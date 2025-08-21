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
            await SeedAccountTypesAsync();
            await _context.SaveChangesAsync();
        }

        private async Task SeedAccountTypesAsync()
        {
            if (!await _context.Roles.AnyAsync())
            {
                var accountTypes = new List<Role>
                {
                    new Role { RoleName = "SuperAdmin" },
                    new Role { RoleName = "Teacher" },
                    new Role { RoleName = "Student" },
                    new Role { RoleName = "Admin" },
                    new Role { RoleName = "StaffAdmin" }

                };

                _context.Roles.AddRange(accountTypes);
                await _context.SaveChangesAsync();
            }
        }


        private async Task<long> GetAccountTypeId(string accountTypeName)
        {
            var accountType = await _context.Roles
                .FirstOrDefaultAsync(at => at.RoleName == accountTypeName);
            return accountType?.Id ?? 1; // Default to 1 if not found
        }
    }
} 