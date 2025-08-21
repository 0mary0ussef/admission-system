namespace SchoolAdmission.DTOs;

public class TimeExtensionDTO
{
    public string NationalId { get; set; } = string.Empty;
    public string TeacherEmail { get; set; } = string.Empty;
    public string TeacherPassword { get; set; } = string.Empty;
    public int ExtensionMinutes { get; set; }
}
