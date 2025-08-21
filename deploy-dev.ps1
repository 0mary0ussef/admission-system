# Development Deployment Script
param(
    [string]$Environment = "Development"
)

Write-Host "Starting development deployment for environment: $Environment" -ForegroundColor Green

# Set environment name
$env:ASPNETCORE_ENVIRONMENT = $Environment

# Read sensitive values from environment variables
$dbConnectionString = $env:DB_CONNECTION_STRING
$jwtKey = $env:JWT_KEY
$jwtIssuer = $env:JWT_ISSUER
$corsAllowedOrigins = $env:CORS_ALLOWED_ORIGINS

# Validate required environment variables
if (-not $dbConnectionString) {
    Write-Host "ERROR: DB_CONNECTION_STRING environment variable is not set!" -ForegroundColor Red
    Write-Host "Please set the environment variable or use the env.development file." -ForegroundColor Yellow
    exit 1
}

if (-not $jwtKey) {
    Write-Host "ERROR: JWT_KEY environment variable is not set!" -ForegroundColor Red
    Write-Host "Please set the environment variable or use the env.development file." -ForegroundColor Yellow
    exit 1
}

if (-not $jwtIssuer) {
    Write-Host "ERROR: JWT_ISSUER environment variable is not set!" -ForegroundColor Red
    Write-Host "Please set the environment variable or use the env.development file." -ForegroundColor Yellow
    exit 1
}

# Set CORS origins - use environment variable if available, otherwise use default development origins
if (-not $corsAllowedOrigins) {
    $corsAllowedOrigins = "http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173"
    Write-Host "CORS_ALLOWED_ORIGINS not set, using default development origins" -ForegroundColor Yellow
}

# Set the environment variables for the application
$env:DB_CONNECTION_STRING = $dbConnectionString
$env:JWT_KEY = $jwtKey
$env:JWT_ISSUER = $jwtIssuer
$env:CORS_ALLOWED_ORIGINS = $corsAllowedOrigins

Write-Host "Environment variables loaded successfully:" -ForegroundColor Green
Write-Host "  - ASPNETCORE_ENVIRONMENT: $env:ASPNETCORE_ENVIRONMENT" -ForegroundColor Cyan
Write-Host "  - DB_CONNECTION_STRING: [HIDDEN]" -ForegroundColor Cyan
Write-Host "  - JWT_KEY: [HIDDEN]" -ForegroundColor Cyan
Write-Host "  - JWT_ISSUER: $env:JWT_ISSUER" -ForegroundColor Cyan
Write-Host "  - CORS_ALLOWED_ORIGINS: $env:CORS_ALLOWED_ORIGINS" -ForegroundColor Cyan

# Build the application
Write-Host "Building application..." -ForegroundColor Yellow
dotnet build --configuration Debug

# Start the application
Write-Host "Starting application..." -ForegroundColor Green
dotnet run --configuration Debug

Write-Host "Development deployment completed successfully!" -ForegroundColor Green
