    # Production Deployment Script
    param(
        [string]$Environment = "Production",
        [string]$Domain = "your-production-domain.com"
    )

    Write-Host "Starting deployment for environment: $Environment" -ForegroundColor Green

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
        Write-Host "Please set the environment variable or use the env.production file." -ForegroundColor Yellow
        exit 1
    }

    if (-not $jwtKey) {
        Write-Host "ERROR: JWT_KEY environment variable is not set!" -ForegroundColor Red
        Write-Host "Please set the environment variable or use the env.production file." -ForegroundColor Yellow
        exit 1
    }

    if (-not $jwtIssuer) {
        Write-Host "ERROR: JWT_ISSUER environment variable is not set!" -ForegroundColor Red
        Write-Host "Please set the environment variable or use the env.production file." -ForegroundColor Yellow
        exit 1
    }

    # Set CORS origins - use environment variable if available, otherwise use domain parameter
    if (-not $corsAllowedOrigins) {
        $corsAllowedOrigins = "https://$Domain"
        Write-Host "CORS_ALLOWED_ORIGINS not set, using domain parameter: $corsAllowedOrigins" -ForegroundColor Yellow
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
    dotnet build --configuration Release

    # Run database migrations (if any)
    Write-Host "Running database migrations..." -ForegroundColor Yellow
    dotnet ef database update

    # Start the application
    Write-Host "Starting application..." -ForegroundColor Green
    dotnet run --configuration Release

    Write-Host "Deployment completed successfully!" -ForegroundColor Green
