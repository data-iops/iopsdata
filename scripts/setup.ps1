# =============================================================================
# iOpsData Development Setup Script (Windows PowerShell)
# =============================================================================

$ErrorActionPreference = "Stop"

# Get the project root directory (parent of scripts directory)
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir

Write-Host "=============================================" -ForegroundColor Green
Write-Host "  iOpsData Development Setup" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""

# Check Python version
Write-Host "Checking Python installation..." -ForegroundColor Yellow
try {
    $PythonVersion = python --version 2>&1
    if ($PythonVersion -match "Python (\d+)\.(\d+)") {
        $Major = [int]$Matches[1]
        $Minor = [int]$Matches[2]
        if ($Major -ge 3 -and $Minor -ge 11) {
            Write-Host "Python $PythonVersion found" -ForegroundColor Green
        } else {
            Write-Host "Error: Python 3.11+ required, found $PythonVersion" -ForegroundColor Red
            exit 1
        }
    }
} catch {
    Write-Host "Error: Python not found. Please install Python 3.11+" -ForegroundColor Red
    exit 1
}

# Check Node.js version
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $NodeVersion = node --version 2>&1
    if ($NodeVersion -match "v(\d+)") {
        $NodeMajor = [int]$Matches[1]
        if ($NodeMajor -ge 18) {
            Write-Host "Node.js $NodeVersion found" -ForegroundColor Green
        } else {
            Write-Host "Error: Node.js 18+ required, found $NodeVersion" -ForegroundColor Red
            exit 1
        }
    }
} catch {
    Write-Host "Error: Node.js not found. Please install Node.js 18+" -ForegroundColor Red
    exit 1
}

# Check npm
try {
    $null = npm --version 2>&1
} catch {
    Write-Host "Error: npm not found. Please install npm" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Setup Backend
Write-Host "Setting up backend..." -ForegroundColor Yellow
Set-Location "$ProjectRoot\backend"

# Create virtual environment
if (-not (Test-Path ".venv")) {
    Write-Host "Creating Python virtual environment..."
    python -m venv .venv
}

# Activate virtual environment and install dependencies
Write-Host "Installing Python dependencies..."
& ".venv\Scripts\Activate.ps1"
pip install --upgrade pip
pip install -e ".[dev]"

# Copy environment file if it doesn't exist
if (-not (Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "Created backend\.env from .env.example" -ForegroundColor Green
    }
}

deactivate

Write-Host "Backend setup complete!" -ForegroundColor Green
Write-Host ""

# Setup Frontend
Write-Host "Setting up frontend..." -ForegroundColor Yellow
Set-Location "$ProjectRoot\frontend"

# Install npm dependencies
Write-Host "Installing npm dependencies..."
npm install

# Copy environment file if it doesn't exist
if (-not (Test-Path ".env.local")) {
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env.local"
        Write-Host "Created frontend\.env.local from .env.example" -ForegroundColor Green
    }
}

Write-Host "Frontend setup complete!" -ForegroundColor Green
Write-Host ""

# Setup root environment
Set-Location $ProjectRoot
if (-not (Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "Created .env from .env.example" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "=============================================" -ForegroundColor Green
Write-Host "  Setup Complete!" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""
Write-Host "To start the development servers:"
Write-Host ""
Write-Host "Backend:" -ForegroundColor Yellow
Write-Host "  cd backend"
Write-Host "  .venv\Scripts\Activate.ps1"
Write-Host "  uvicorn src.iopsdata.main:app --reload --port 8000"
Write-Host ""
Write-Host "Frontend:" -ForegroundColor Yellow
Write-Host "  cd frontend"
Write-Host "  npm run dev"
Write-Host ""
Write-Host "Then open:"
Write-Host "  - Frontend: http://localhost:3000"
Write-Host "  - API Docs: http://localhost:8000/docs"
Write-Host ""
