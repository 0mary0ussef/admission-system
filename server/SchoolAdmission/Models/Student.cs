using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace SchoolAdmission.Models
{
    public enum StudentStatus
    {
        Pending,
        Accepted,
        Waitlist,
        Rejected
    }

    public class Student
    {
        public int Id { get; set; }
        [Required]
        public string FullName { get; set; }
        [Required]
        public string NationalId { get; set; }
        public double MathScore { get; set; }
        public double EnglishScore { get; set; }
        public double FinalYearScore { get; set; }
        [Required]
        public double MinistryExamPercentage { get; set; }
        
        public DateTime? DateOfBirth { get; set; }
        public string? ParentOccupation { get; set; }
        public string? Address { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Email { get; set; }
        public string? City { get; set; }
        public string? District { get; set; }
        public string? StreetName { get; set; }
        public string? BuildingNo { get; set; }
        
        public string? BirthCertificatePath { get; set; }
        public string? SuccessReportPath { get; set; }
        public string? TuitionFeeReceiptPath { get; set; }
        public string? PreferencesSheetPath { get; set; }
        
        public StudentStatus Status { get; set; } = StudentStatus.Pending;
        
        public Exam Exam { get; set; }
        public List<InterviewScore> InterviewScores { get; set; }
    }
} 