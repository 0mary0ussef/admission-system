using System.ComponentModel.DataAnnotations;

namespace SchoolAdmission.Models
{
    public class StudentExamResults
    {
        public long AccountId { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string StudentName { get; set; } = string.Empty;
        
        public int ExamArabicScore { get; set; }
        
        public int ExamEnglishScore { get; set; }
        
        public int ExamMathScore { get; set; }
        
        public int ExamSoftwareScore { get; set; }
        
        // public virtual Account Account { get; set; } = null!;
    }
} 