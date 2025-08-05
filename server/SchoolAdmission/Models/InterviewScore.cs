using System.ComponentModel.DataAnnotations;

namespace SchoolAdmission.Models
{
    public class InterviewScore
    {
        public int Id { get; set; }
        public long StudentId { get; set; } // References Account.Id (Student)
        public long AdminId { get; set; }   // References Account.Id (Admin)
        public double Score { get; set; }
        
        // Note: Navigation properties removed as they referenced deleted models
        // The AdminController handles the relationships manually using Account queries
    }
} 