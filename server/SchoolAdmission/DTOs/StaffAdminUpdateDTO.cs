using System;

namespace SchoolAdmission.DTOs;

public class StaffAdminUpdateDTO
{
    public string? StudentName { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? Location { get; set; }
    public string? PhoneNumber { get; set; }
    public string? ParentPhoneNumber { get; set; }
    public decimal? MathScore { get; set; }
    public decimal? EnglishScore { get; set; }
    public decimal? ThirdPrepScore { get; set; }
    public string? ParentOccupation { get; set; }
    public string? City { get; set; }
    public string? District { get; set; }
    public string? StreetName { get; set; }
    public string? BuildingNo { get; set; }
    public string? PreviousSchoolType { get; set; }
}
