using System.ComponentModel.DataAnnotations;

namespace SchoolAdmission.Models
{
    public class Exam
    {
        public int Id { get; set; }
        public int StudentId { get; set; }
        public double MathScore { get; set; }
        public double EnglishScore { get; set; }
        public double ArabicScore { get; set; }
        public double SoftwareScore { get; set; }
        
        public Student Student { get; set; }
    }
} 