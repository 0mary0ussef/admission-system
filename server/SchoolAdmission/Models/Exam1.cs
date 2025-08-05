using System.ComponentModel.DataAnnotations;

namespace SchoolAdmission.Models
{
    public class ExamQuestion
    {
        public long Id { get; set; }
        
        [Required]
        [MaxLength(500)]
        public string QuestionTitle { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(200)]
        public string Choice1 { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(200)]
        public string Choice2 { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(200)]
        public string Choice3 { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(200)]
        public string Choice4 { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(200)]
        public string CorrectAnswer { get; set; } = string.Empty;
        
        public long SectionId { get; set; }
        
        public virtual Section Section { get; set; } = null!;
        
        public virtual ICollection<StudentExamAnswers> StudentExamAnswers { get; set; } = new List<StudentExamAnswers>();
    }
} 