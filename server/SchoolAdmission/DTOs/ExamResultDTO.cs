using System.ComponentModel.DataAnnotations;

namespace SchoolAdmission.DTOs
{
    public class ExamResultDTO
    {
        [Required]
        public string NationalId { get; set; }
        public double MathScore { get; set; }
        public double EnglishScore { get; set; }
        public double ArabicScore { get; set; }
        public double SoftwareScore { get; set; }
    }
} 