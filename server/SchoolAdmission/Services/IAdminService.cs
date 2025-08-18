using SchoolAdmission.DTOs;
using SchoolAdmission.Models;

namespace SchoolAdmission.Services;

public interface IAdminService
{
    Task<List<dynamic>> GetStudentsForAdminAsync(string adminEmail);
    Task<List<dynamic>> GetStudentsForSuperAdminAsync(string superAdminEmail);
    Task<List<Account>> FilterStudentsAsync(string? name, string? nationalId);
    Task<bool> SetInterviewScoreAsync(long studentId, long adminId, double score);
    Task<bool> UpdateStudentStatusAsync(long studentId, string status);
    Task<int> GetExamTotalAsync(StudentExamResult? examResults);
    Task<string> GetCurrentAdminEmailAsync(System.Security.Claims.ClaimsPrincipal user);
    Task<Account?> GetAccountByEmailAsync(string email);
}
