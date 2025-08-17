using Microsoft.EntityFrameworkCore;
using SchoolAdmission.Data;
using SchoolAdmission.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using OfficeOpenXml;

var builder = WebApplication.CreateBuilder(args);

// Set EPPlus license context for EPPlus 6.x
ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

// Add DbContext with MySQL
builder.Services.AddDbContext<SchoolAdmissionDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")
    ));

// Add services
builder.Services.AddScoped<AccountSeedingService>();
builder.Services.AddScoped<IAccountService, AccountService>();
builder.Services.AddScoped<IStudentService, StudentService>();
builder.Services.AddScoped<IAdminService, AdminService>();

// Add CORS policy
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
    });
});

// Add JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"];
var jwtIssuer = builder.Configuration["Jwt:Issuer"];

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtIssuer,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        ClockSkew = TimeSpan.FromMinutes(5) // Allow 5 minutes clock skew
    };
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddControllers();

var app = builder.Build();

// Seed data
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<SchoolAdmissionDbContext>();
    var accountSeedingService = scope.ServiceProvider.GetRequiredService<AccountSeedingService>();
    
    // Check what's in the database
    Console.WriteLine("=== Checking Database Contents ===");
        
    var accountTypes = await db.AccountTypes.ToListAsync();
    Console.WriteLine($"AccountTypes ({accountTypes.Count}):");
    foreach (var at in accountTypes)
    {
        Console.WriteLine($"  - {at.Id}: {at.AccountTypeName}");
    }
    
    var accounts = await db.Accounts.Include(a => a.AccountType).ToListAsync();
    Console.WriteLine($"Accounts ({accounts.Count}):");
    foreach (var acc in accounts)
    {
        Console.WriteLine($"  - {acc.Id}: {acc.Email} ({acc.AccountType?.AccountTypeName})");
    }
    
    var logins = await db.Logins.ToListAsync();
    Console.WriteLine($"Logins ({logins.Count}):");
    foreach (var login in logins)
    {
        Console.WriteLine($"  - {login.Id}: {login.Email} (AccountId: {login.AccountId})");
    }
    
    Console.WriteLine("=== End Database Check ===");
    
    // Seed new system data only
    await accountSeedingService.SeedAccountsAsync();
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowAll");
app.UseStaticFiles(); // Add this line to serve static files
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();

