using System.ComponentModel.DataAnnotations;

namespace SchoolAdmission.Models
{
    public class StudentExamAnswers
    {
        public long Id { get; set; }
        
        public long AccountId { get; set; }
        
        public long ExamId { get; set; }
        
        [Required]
        [MaxLength(200)]
        public string ChoosedAnswer { get; set; } = string.Empty;
        
        public bool Score { get; set; }
        
        // public virtual Account Account { get; set; } = null!;
        
        public virtual ExamQuestion Exam { get; set; } = null!;
    }
} 