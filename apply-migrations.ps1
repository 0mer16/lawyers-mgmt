# Apply Pending Migrations Script for PowerShell
# This script helps apply pending migrations to the database.
# Run in PowerShell with: .\apply-migrations.ps1

# Allow script execution temporarily for this session
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

Write-Host ""
Write-Host "======================================"
Write-Host "  Lawyer Management System"
Write-Host "  Database Migration Helper"
Write-Host "======================================"
Write-Host ""

try {
    # Step 1: Generate migration from schema changes
    Write-Host "Step 1: Generating migration from schema changes..." -ForegroundColor Yellow
    npx prisma migrate dev --name add-case-type-and-notes --create-only
    
    Write-Host "`nMigration files created successfully!" -ForegroundColor Green
    Write-Host "Review the migration file if needed, then continue...`n" -ForegroundColor Yellow
    
    # Step 2: Apply the migrations
    Write-Host "Step 2: Applying migrations to the database..." -ForegroundColor Yellow
    npx prisma migrate dev
    
    Write-Host "`nMigrations applied successfully!`n" -ForegroundColor Green
    
    # Step 3: Generate updated Prisma client
    Write-Host "Step 3: Generating updated Prisma client..." -ForegroundColor Yellow
    npx prisma generate
    
    Write-Host "`nPrisma client generated successfully!" -ForegroundColor Green
    Write-Host "All steps completed. Your database is now up to date.`n" -ForegroundColor Green
    
    Write-Host "You can now restart your application with:" -ForegroundColor Magenta
    Write-Host "npm run dev`n" -ForegroundColor Cyan
    
} catch {
    Write-Host "`nError during migration process:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    
    Write-Host "`nTroubleshooting tips:" -ForegroundColor Yellow
    Write-Host "1. Make sure your database is running and accessible"
    Write-Host "2. Check your .env file for correct DATABASE_URL"
    Write-Host "3. If using PostgreSQL, ensure you have the proper permissions"
    Write-Host "4. Try running 'npx prisma migrate reset' to reset the database (WARNING: This deletes all data!)`n"
    
    exit 1
} 