# Database Migration Guide

## Current Issue

The application is showing an error message: `The column "Case.caseType" does not exist in the current database`. This is happening because there have been changes to the database schema, but the migration hasn't been applied yet.

## What are the changes?

1. Added `caseType` field to the Case model
2. Added a `Note` model for case notes
3. Updated the relationships between models

## How to fix it

### Option 1: Using the PowerShell Script (Windows)

1. Right-click on PowerShell and select "Run as Administrator"
2. Navigate to your project directory
3. Run the following command to temporarily allow script execution:
   ```
   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
   ```
4. Run the migration script:
   ```
   .\apply-migrations.ps1
   ```

### Option 2: Using Node.js Script

1. Open a terminal or command prompt
2. Navigate to your project directory
3. Run:
   ```
   node prisma/migrations/apply-pending-migrations.js
   ```

### Option 3: Manual Migration

If the above scripts don't work, you can manually apply the migrations:

1. Generate the migration files:
   ```
   npx prisma migrate dev --name add-case-type-and-notes --create-only
   ```

2. Apply the migrations:
   ```
   npx prisma migrate dev
   ```

3. Update the Prisma client:
   ```
   npx prisma generate
   ```

## After Migration

Once the migration is complete, restart your application with:
```
npm run dev
```

## Troubleshooting

If you encounter issues during migration:

1. Ensure your database server is running
2. Check that your DATABASE_URL in the .env file is correct
3. Make sure you have the necessary database permissions
4. For a clean start (warning: this deletes all data), you can run:
   ```
   npx prisma migrate reset
   ``` 