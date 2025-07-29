using System.ComponentModel.DataAnnotations;

namespace SchoolAdmission.DTOs
{
    public class StudentRegisterDTO
    {
        [Required]
        public string FullName { get; set; }
        [Required]
        public string NationalId { get; set; }
        [Required]
        public double MathScore { get; set; }
        [Required]
        public double EnglishScore { get; set; }
        [Required]
        public double FinalYearScore { get; set; }
        [Required]
        public double MinistryExamPercentage { get; set; }
    }
} 