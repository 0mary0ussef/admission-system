using System.ComponentModel.DataAnnotations;

namespace SchoolAdmission.Models
{
    public class Teacher
    {
        public int Id { get; set; }
        [Required]
        public string Email { get; set; }
        [Required]
        public string PasswordHash { get; set; }
        public string FullName { get; set; }
    }
} 