#!/usr/bin/env pwsh
# Setup script for Lawyers Management System
# This script will set up the project for development or production

param(
    [switch]$Production,
    [switch]$SkipInstall,
    [switch]$SkipMigrations
)

Write-Host "=================================" -ForegroundColor Cyan
Write-Host "Lawyers Management System Setup" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js is not installed. Please install Node.js 18.17.0 or later." -ForegroundColor Red
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Host "✓ npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ npm is not installed." -ForegroundColor Red
    exit 1
}

Write-Host ""

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "⚠ .env file not found. Creating from .env.example..." -ForegroundColor Yellow
    
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "✓ .env file created. Please update it with your configuration." -ForegroundColor Green
        Write-Host ""
        Write-Host "IMPORTANT: Update the following in your .env file:" -ForegroundColor Yellow
        Write-Host "  - DATABASE_URL: Your PostgreSQL connection string" -ForegroundColor Yellow
        Write-Host "  - NEXTAUTH_SECRET: Generate with: openssl rand -base64 32" -ForegroundColor Yellow
        Write-Host "  - JWT_SECRET: Generate with: openssl rand -base64 32" -ForegroundColor Yellow
        Write-Host ""
        $continue = Read-Host "Press Enter to continue after updating .env file, or Ctrl+C to exit"
    } else {
        Write-Host "✗ .env.example not found. Cannot create .env file." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✓ .env file found" -ForegroundColor Green
}

Write-Host ""

# Install dependencies
if (-not $SkipInstall) {
    Write-Host "Installing dependencies..." -ForegroundColor Cyan
    npm install --legacy-peer-deps
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Dependencies installed successfully" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "⊘ Skipping dependency installation" -ForegroundColor Yellow
}

Write-Host ""

# Generate Prisma Client
Write-Host "Generating Prisma Client..." -ForegroundColor Cyan
npx prisma generate

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Prisma Client generated successfully" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to generate Prisma Client" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Run database migrations
if (-not $SkipMigrations) {
    Write-Host "Running database migrations..." -ForegroundColor Cyan
    
    if ($Production) {
        npx prisma migrate deploy
    } else {
        npx prisma migrate dev
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Database migrations completed successfully" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed to run database migrations" -ForegroundColor Red
        Write-Host "  Please check your DATABASE_URL in .env file" -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "⊘ Skipping database migrations" -ForegroundColor Yellow
}

Write-Host ""

# Seed database (only in development)
if (-not $Production) {
    $seed = Read-Host "Do you want to seed the database with sample data? (y/N)"
    
    if ($seed -eq "y" -or $seed -eq "Y") {
        Write-Host "Seeding database..." -ForegroundColor Cyan
        npx prisma db seed
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Database seeded successfully" -ForegroundColor Green
            Write-Host ""
            Write-Host "Demo credentials:" -ForegroundColor Cyan
            Write-Host "  Admin: admin@example.com / admin123" -ForegroundColor White
            Write-Host "  Lawyer: lawyer@example.com / lawyer123" -ForegroundColor White
        } else {
            Write-Host "⚠ Failed to seed database (not critical)" -ForegroundColor Yellow
        }
    }
}

Write-Host ""
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "Setup completed successfully! 🎉" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

if ($Production) {
    Write-Host "To start the production server:" -ForegroundColor Cyan
    Write-Host "  npm run build" -ForegroundColor White
    Write-Host "  npm start" -ForegroundColor White
} else {
    Write-Host "To start the development server:" -ForegroundColor Cyan
    Write-Host "  npm run dev" -ForegroundColor White
}

Write-Host ""
Write-Host "Visit http://localhost:3000 to access the application" -ForegroundColor Cyan
Write-Host ""
