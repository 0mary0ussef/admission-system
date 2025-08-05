using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace SchoolAdmission.Models;

public partial class StudentExtension
{
    public long AccountId { get; set; }

    public bool IsLeader { get; set; }

    public long? ClassId { get; set; }

    [JsonIgnore]
    public virtual Account Account { get; set; } = null!;
}
