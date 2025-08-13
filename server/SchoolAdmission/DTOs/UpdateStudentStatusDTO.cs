using System.ComponentModel.DataAnnotations;

namespace SchoolAdmission.DTOs
{
    public class UpdateStudentStatusDTO
    {
        public string Status { get; set; } = string.Empty;
    }

    public class UpdateStudentInfoDTO
    {
        // Registration information
        public string? StudentName { get; set; }
        public string? NationalId { get; set; }
        public double? MathScore { get; set; }
        public double? EnglishScore { get; set; }
        public double? FinalYearScore { get; set; }
        public double? MinistryExamPercentage { get; set; }
        public string? DateOfBirth { get; set; }
        
        // Complete information
        public string? ParentOccupation { get; set; }
        public string? Address { get; set; }
        public string? City { get; set; }
        public string? District { get; set; }
        public string? StreetName { get; set; }
        public string? BuildingNo { get; set; }
        public string? PhoneNumber { get; set; }
        public string? StudentPhoneNumber { get; set; }
        public bool? IsArabicStudy { get; set; }
        public bool? IsLanguagesStudy { get; set; }
        public string? Email { get; set; }
    }
} 