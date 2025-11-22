/**
 * Apply Pending Migrations Script
 * 
 * This script helps apply pending migrations to the database.
 * Run with: node prisma/migrations/apply-pending-migrations.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colorized log output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

console.log(`${colors.cyan}======================================${colors.reset}`);
console.log(`${colors.cyan}  Lawyer Management System${colors.reset}`);
console.log(`${colors.cyan}  Database Migration Helper${colors.reset}`);
console.log(`${colors.cyan}======================================${colors.reset}\n`);

try {
  // Step 1: Generate migration from schema changes
  console.log(`${colors.yellow}Step 1: Generating migration from schema changes...${colors.reset}`);
  execSync('npx prisma migrate dev --name add-case-type-and-notes --create-only', { stdio: 'inherit' });
  
  console.log(`\n${colors.green}Migration files created successfully!${colors.reset}`);
  console.log(`${colors.yellow}Review the migration file if needed, then continue...${colors.reset}\n`);
  
  // Step 2: Apply the migrations
  console.log(`${colors.yellow}Step 2: Applying migrations to the database...${colors.reset}`);
  execSync('npx prisma migrate dev', { stdio: 'inherit' });
  
  console.log(`\n${colors.green}Migrations applied successfully!${colors.reset}\n`);
  
  // Step 3: Generate updated Prisma client
  console.log(`${colors.yellow}Step 3: Generating updated Prisma client...${colors.reset}`);
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  console.log(`\n${colors.green}Prisma client generated successfully!${colors.reset}`);
  console.log(`${colors.green}All steps completed. Your database is now up to date.${colors.reset}\n`);
  
  console.log(`${colors.magenta}You can now restart your application with:${colors.reset}`);
  console.log(`${colors.cyan}npm run dev${colors.reset}\n`);
  
} catch (error) {
  console.error(`\n${colors.red}Error during migration process:${colors.reset}`, error.message);
  console.log(`\n${colors.yellow}Troubleshooting tips:${colors.reset}`);
  console.log(`1. Make sure your database is running and accessible`);
  console.log(`2. Check your .env file for correct DATABASE_URL`);
  console.log(`3. If using PostgreSQL, ensure you have the proper permissions`);
  console.log(`4. Try running 'npx prisma migrate reset' to reset the database (WARNING: This deletes all data!)\n`);
  
  process.exit(1);
} 