using Microsoft.EntityFrameworkCore;
using SchoolAdmission.Data;
using SchoolAdmission.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using OfficeOpenXml;
using DotNetEnv;

// Load the appropriate .env file first
Console.WriteLine(Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT"));

if (Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development")
    Env.Load(".env.development");
else
    Env.Load(".env.production");


var builder = WebApplication.CreateBuilder(args);

// Set EPPlus license context
ExcelPackage.LicenseContext = LicenseContext.NonCommercial;


// Read environment variables
var environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production";
var connectionString = Environment.GetEnvironmentVariable("DB_CONNECTION_STRING") 
    ?? throw new InvalidOperationException("DB_CONNECTION_STRING is not set.");
var jwtKey = Environment.GetEnvironmentVariable("JWT_KEY") 
    ?? throw new InvalidOperationException("JWT_KEY is not set.");
var jwtIssuer = Environment.GetEnvironmentVariable("JWT_ISSUER") 
    ?? throw new InvalidOperationException("JWT_ISSUER is not set.");
var corsOriginsEnv = Environment.GetEnvironmentVariable("CORS_ALLOWED_ORIGINS");

// Parse CORS origins
string[] allowedOrigins;
if (!string.IsNullOrEmpty(corsOriginsEnv))
{
    allowedOrigins = corsOriginsEnv.Split(',', StringSplitOptions.RemoveEmptyEntries)
                                   .Select(o => o.Trim())
                                   .ToArray();
}
else
{
    allowedOrigins = new[] { "http://localhost:3000", "http://localhost:5173" };
}

// Add DbContext
builder.Services.AddDbContext<SchoolAdmissionDbContext>(options =>
    options.UseSqlServer(connectionString)
);

// Add services
builder.Services.AddScoped<AccountSeedingService>();
builder.Services.AddScoped<IAccountService, AccountService>();
builder.Services.AddScoped<IStudentService, StudentService>();
builder.Services.AddScoped<IAdminService, AdminService>();

// CORS configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// JWT Authentication
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
        ClockSkew = TimeSpan.FromMinutes(5)
    };
});

// Swagger and Controllers
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddControllers();

var app = builder.Build();

// Seed data
using (var scope = app.Services.CreateScope())
{
    var accountSeedingService = scope.ServiceProvider.GetRequiredService<AccountSeedingService>();
    await accountSeedingService.SeedAccountsAsync();
}

// Middleware
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    app.UseHttpsRedirection();
}

app.UseCors("AllowAll");
app.UseStaticFiles();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
