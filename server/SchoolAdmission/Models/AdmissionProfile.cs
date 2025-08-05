using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace SchoolAdmission.Models;

public enum AdmissionStatus
{
    Pending,
    Accepted,
    Rejected,
    Waitlist
}

public partial class AdmissionProfile
{
    public long AccountId { get; set; }

    public DateOnly? DateOfBirth { get; set; }

    public string? Location { get; set; }

    public string? PhoneNumber { get; set; }

    public decimal? SoftwareInterviewScore { get; set; }

    public decimal? MathInterviewScore { get; set; }

    public decimal? EnglishInterviewScore { get; set; }

    public decimal? ArabicInterviewScore { get; set; }

    public string? StudentName { get; set; }

    public decimal? MathScore { get; set; }

    public decimal? EnglishScore { get; set; }

    public decimal? ThirdPrepScore { get; set; }

    public bool IsAcceptanceLetterReceived { get; set; }

    // Status field with default value
    public AdmissionStatus Status { get; set; } = AdmissionStatus.Pending;  

    // New fields for admission system
    public double MinistryExamPercentage { get; set; }
    
    [MaxLength(100)]
    public string? ParentOccupation { get; set; }
    
    [MaxLength(200)]
    public string? Address { get; set; }
    
    [MaxLength(50)]
    public string? City { get; set; }
    
    [MaxLength(50)]
    public string? District { get; set; }
    
    [MaxLength(100)]
    public string? StreetName { get; set; }
    
    [MaxLength(20)]
    public string? BuildingNo { get; set; }
    
    [MaxLength(500)]
    public string? BirthCertificatePath { get; set; }
    
    [MaxLength(500)]
    public string? SuccessReportPath { get; set; }
    
    [MaxLength(500)]
    public string? TuitionFeeReceiptPath { get; set; }
    
    [MaxLength(500)]
    public string? PreferencesSheetPath { get; set; }

    [JsonIgnore]
    public virtual Account Account { get; set; } = null!;
}
