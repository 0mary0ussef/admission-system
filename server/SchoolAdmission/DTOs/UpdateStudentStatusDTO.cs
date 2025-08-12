using System.ComponentModel.DataAnnotations;

namespace SchoolAdmission.DTOs
{
    public class UpdateStudentStatusDTO
    {
        [Required]
        public string Status { get; set; } = string.Empty;
    }
} 