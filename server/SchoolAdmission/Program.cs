using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using SchoolAdmission.Data;
using SchoolAdmission.Services;
using OfficeOpenXml;

var builder = WebApplication.CreateBuilder(args);

// Set EPPlus license context
ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

// Get configuration
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
var jwtKey = builder.Configuration["Jwt:Key"] ?? "DefaultKey123456789012345678901234567890";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "DefaultIssuer";
var corsOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
    ?? new[] { "http://localhost:3000", "http://localhost:5173", "https://localhost:5173" };

// Add DbContext
builder.Services.AddDbContext<SchoolAdmissionDbContext>(options =>
    options.UseSqlServer(connectionString, sqlServerOptionsAction: sqlOptions =>
    {
        sqlOptions.EnableRetryOnFailure(
            maxRetryCount: 5,
            maxRetryDelay: TimeSpan.FromSeconds(30),
            errorNumbersToAdd: null);
    })
);

Console.WriteLine(connectionString);
// Add services
builder.Services.AddScoped<IAccountService, AccountService>();
builder.Services.AddScoped<IStudentService, StudentService>();
builder.Services.AddScoped<IAdminService, AdminService>();

// Simple CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Simple JWT Authentication
builder.Services.AddAuthentication("Bearer")
    .AddJwtBearer("Bearer", options =>
    {
        options.TokenValidationParameters = new()
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(
                System.Text.Encoding.UTF8.GetBytes(jwtKey)
            )
        };
    });

// Controllers
builder.Services.AddControllers();

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "School Admission API", Version = "v1" });
});

var app = builder.Build();

// Middleware
app.UseCors("AllowAll");
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "School Admission API V1");
    c.RoutePrefix = "swagger";
});

app.UseStaticFiles();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
