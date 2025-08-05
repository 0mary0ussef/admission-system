using System.ComponentModel.DataAnnotations;

namespace SchoolAdmission.Models
{
    public class Section
    {
        public long Id { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string SectionName { get; set; } = string.Empty;
        
        public virtual ICollection<ExamQuestion> Exams { get; set; } = new List<ExamQuestion>();
    }
} 