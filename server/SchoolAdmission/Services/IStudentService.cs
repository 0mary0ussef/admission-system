using SchoolAdmission.DTOs;
using SchoolAdmission.Models;

namespace SchoolAdmission.Services;

public interface IStudentService
{
    Task<Account?> GetStudentByNationalIdAsync(string nationalId);
    Task<bool> ValidateStudentForExamAsync(string nationalId);
    Task<bool> HasStudentCompletedExamAsync(long accountId);
    Task<AdmissionProfile?> GetStudentAdmissionProfileAsync(long accountId);
    Task UpdateStudentInfoAsync(string nationalId, StudentCompleteInfoDTO dto);
    Task<string> UploadStudentDocumentAsync(string nationalId, string documentType, IFormFile file, string webRootPath);
    Task<bool> StudentExistsAsync(string nationalId);
    Task<List<object>> GetAllStudentsAsync();
    Task SaveChangesAsync();
    Task<bool> IsAdmissionProfileCompleteAsync(string nationalId);
    Task<bool> AreExamQuestionsAvailableAsync();
}

