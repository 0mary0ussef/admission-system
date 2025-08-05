using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace SchoolAdmission.Models;

public partial class Account
{
    public long Id { get; set; }

    public string NationalId { get; set; } = null!;

    public string PasswordHash { get; set; } = null!;

    public string Email { get; set; } = null!;

    public long AccountTypeId { get; set; }

    public string FullNameEn { get; set; } = null!;

    public string FullNameAr { get; set; } = null!;

    public string? ResetToken { get; set; }

    public DateTime? ResetTokenExpiry { get; set; }

    public bool IsActive { get; set; }

    public virtual AccountType AccountType { get; set; } = null!;

    [JsonIgnore]
    public virtual AdmissionProfile? AdmissionProfile { get; set; }

    [JsonIgnore]
    public virtual ICollection<Login> Logins { get; set; } = new List<Login>();

    [JsonIgnore]
    public virtual StudentExtension? StudentExtension { get; set; }
}
