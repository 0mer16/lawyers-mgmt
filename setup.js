#!/usr/bin/env node

/**
 * Setup script for Lawyers Management System
 * This script helps set up the development environment
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  console.log('\n🏛️  Lawyers Management System - Setup Script\n');
  
  // Check if .env exists
  const envPath = path.join(__dirname, '.env');
  const envExamplePath = path.join(__dirname, '.env.example');
  
  if (!fs.existsSync(envPath)) {
    console.log('⚠️  No .env file found. Creating from .env.example...\n');
    
    if (fs.existsSync(envExamplePath)) {
      fs.copyFileSync(envExamplePath, envPath);
      console.log('✅ Created .env file\n');
      console.log('⚠️  IMPORTANT: Please edit the .env file with your actual configuration!\n');
      
      const editNow = await question('Do you want to edit it now? (y/n): ');
      if (editNow.toLowerCase() === 'y') {
        console.log('\nPlease edit the .env file and press Enter when done...');
        await question('');
      }
    } else {
      console.error('❌ .env.example not found!');
      process.exit(1);
    }
  } else {
    console.log('✅ .env file exists\n');
  }
  
  // Install dependencies
  console.log('📦 Installing dependencies...\n');
  try {
    execSync('npm install --legacy-peer-deps', { stdio: 'inherit' });
    console.log('\n✅ Dependencies installed\n');
  } catch (error) {
    console.error('❌ Failed to install dependencies');
    process.exit(1);
  }
  
  // Generate Prisma client
  console.log('🔧 Generating Prisma client...\n');
  try {
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('\n✅ Prisma client generated\n');
  } catch (error) {
    console.error('❌ Failed to generate Prisma client');
    process.exit(1);
  }
  
  // Ask about database setup
  const setupDb = await question('Do you want to set up the database now? (y/n): ');
  
  if (setupDb.toLowerCase() === 'y') {
    console.log('\n🗄️  Setting up database...\n');
    
    try {
      // Push schema to database
      execSync('npx prisma db push', { stdio: 'inherit' });
      console.log('\n✅ Database schema created\n');
      
      // Ask about seeding
      const seedDb = await question('Do you want to seed the database with sample data? (y/n): ');
      
      if (seedDb.toLowerCase() === 'y') {
        console.log('\n🌱 Seeding database...\n');
        execSync('npx prisma db seed', { stdio: 'inherit' });
        console.log('\n✅ Database seeded\n');
        console.log('\n📝 Demo credentials:');
        console.log('   Email: lawyer@example.com');
        console.log('   Password: lawyer123\n');
      }
    } catch (error) {
      console.error('\n❌ Database setup failed');
      console.error('Please check your DATABASE_URL in .env file\n');
    }
  }
  
  console.log('\n✨ Setup complete!\n');
  console.log('To start the development server, run:');
  console.log('   npm run dev\n');
  
  rl.close();
}

main().catch(console.error);
