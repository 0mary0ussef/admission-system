using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;

namespace SchoolAdmission.Models
{
    public class Admin
    {
        public int Id { get; set; }
        [Required]
        public string Email { get; set; }
        [Required]
        public string PasswordHash { get; set; }
        [Required]
        public string Role { get; set; }
        [Required]
        public string FullName { get; set; }
        public List<InterviewScore> InterviewScores { get; set; }
    }
} 