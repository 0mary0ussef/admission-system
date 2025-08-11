using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace SchoolAdmission.Models;

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

    public long StatusId { get; set; }

    public decimal MinistryExamPercentage { get; set; }

    public string? ParentOccupation { get; set; }

    public string? Address { get; set; }

    public string? City { get; set; }

    public string? District { get; set; }

    public string? StreetName { get; set; }

    public string? BuildingNo { get; set; }

    public string? BirthCertificatePath { get; set; }

    public string? SuccessReportPath { get; set; }

    public string? TuitionFeeReceiptPath { get; set; }

    public string? PreferencesSheetPath { get; set; }

    [JsonIgnore]
    public virtual Account Account { get; set; } = null!;

    // Computed property for Status enum
    [NotMapped]
    public AdmissionStatus Status
    {
        get => (AdmissionStatus)StatusId;
        set => StatusId = (long)value;
    }
}
