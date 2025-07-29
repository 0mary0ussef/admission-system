using System.ComponentModel.DataAnnotations;

namespace SchoolAdmission.Models
{
    public class InterviewScore
    {
        public int Id { get; set; }
        public int StudentId { get; set; }
        public int AdminId { get; set; }
        public double Score { get; set; }
        
        public Student Student { get; set; }
        public Admin Admin { get; set; }
    }
} 