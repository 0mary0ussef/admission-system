using System;
using System.ComponentModel.DataAnnotations;

namespace SchoolAdmission.DTOs
{
    public class StudentCompleteInfoDTO
    {
        [Required]
        public string NationalId { get; set; }
        public DateTime DateOfBirth { get; set; }
        public string ParentOccupation { get; set; }
        public string Address { get; set; }
        public string PhoneNumber { get; set; }
        public string Email { get; set; }
        public string City { get; set; }
        public string District { get; set; }
        public string StreetName { get; set; }
        public string BuildingNo { get; set; }
        
        public string? BirthCertificatePath { get; set; }
        public string? SuccessReportPath { get; set; }
        public string? TuitionFeeReceiptPath { get; set; }
        public string? PreferencesSheetPath { get; set; }
    }
} 