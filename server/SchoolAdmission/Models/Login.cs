using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace SchoolAdmission.Models;

public partial class Login
{
    public long Id { get; set; }

    public long AccountId { get; set; }

    public string Email { get; set; } = null!;

    public string PasswordHash { get; set; } = null!;

    [JsonIgnore]
    public virtual Account Account { get; set; } = null!;
}
