using System;
using System.Collections.Generic;

namespace SchoolAdmission.Models;

public partial class AccountType
{
    public long Id { get; set; }

    public string AccountTypeName { get; set; } = null!;

    public virtual ICollection<Account> Accounts { get; set; } = new List<Account>();
}
