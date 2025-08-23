# Environment Variables Loader Script
param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("Development", "Production")]
    [string]$Environment
)

Write-Host "Loading environment variables for $Environment..." -ForegroundColor Green

# Determine the env file path
$envFile = "env.$($Environment.ToLower())"

if (-not (Test-Path $envFile)) {
    Write-Host "ERROR: Environment file '$envFile' not found!" -ForegroundColor Red
    Write-Host "Please ensure the file exists in the current directory." -ForegroundColor Yellow
    exit 1
}

# Read and parse the env file
$envContent = Get-Content $envFile -ErrorAction Stop

foreach ($line in $envContent) {
    # Skip comments and empty lines
    if ($line.Trim().StartsWith("#") -or [string]::IsNullOrWhiteSpace($line)) {
        continue
    }
    
    # Parse key=value pairs
    if ($line.Contains("=")) {
        $parts = $line.Split("=", 2)
        $key = $parts[0].Trim()
        $value = $parts[1].Trim()
        
        # Set environment variable
        [Environment]::SetEnvironmentVariable($key, $value, "Process")
        Write-Host "  Set $key = [HIDDEN]" -ForegroundColor Cyan
    }
}

Write-Host "Environment variables loaded successfully from $envFile" -ForegroundColor Green
Write-Host "You can now run the deployment script." -ForegroundColor Yellow
