using System;
using System.ComponentModel.DataAnnotations;

namespace SchoolAdmission.DTOs
{
    public class StudentRegisterDTO
    {
        [Required]
        public string StudentName { get; set; }
        
        [Required]
        public string NationalId { get; set; }
        
        [Required]
        public double MathScore { get; set; }
        
        [Required]
        public double EnglishScore { get; set; }
        
        [Required]
        public double FinalYearScore { get; set; }
        
        [Required]
        public bool IsAcceptanceLetterReceived { get; set; }
        
        public double? MinistryExamPercentage { get; set; }
        
        [Required]
        public DateTime DateOfBirth { get; set; }
    }
} 