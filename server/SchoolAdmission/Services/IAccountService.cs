using SchoolAdmission.DTOs;
using SchoolAdmission.Models;

namespace SchoolAdmission.Services;

public interface IAccountService
{
    Task<Account> CreateTeacherAccountAsync(CreateTeacherDTO dto);
    Task<Account> CreateAdminAccountAsync(CreateAdminDTO dto);
    Task<Account> CreateSuperAdminAccountAsync(CreateSuperAdminDTO dto);
    Task<Account> CreateStaffAdminAccountAsync(CreateStaffAdminDTO dto);
    Task<Account> RegisterStudentAsync(StudentRegisterDTO dto);
    Task<bool> ValidateCredentialsAsync(string email, string password);
    Task<Account?> GetAccountByEmailAsync(string email);
    Task<Account?> GetAccountByNationalIdAsync(string nationalId);
    Task<string> GenerateJwtTokenAsync(Account account);
    Task<bool> IsSuperAdminAsync(string email);
    Task<bool> IsAdminAsync(string email);
    Task<bool> IsTeacherAsync(string email);
    Task<bool> IsStaffAdminAsync(string email);
}
