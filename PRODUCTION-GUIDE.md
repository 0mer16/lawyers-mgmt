# Lawyers Management System - Production Deployment Guide

## Table of Contents
- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Security Considerations](#security-considerations)
- [Production Deployment](#production-deployment)
- [Maintenance](#maintenance)

## Overview

A comprehensive case management system for law firms. This application helps lawyers manage cases, clients, hearings, and documents with role-based access control.

### Key Features
- 🔐 **Secure Authentication** - JWT-based authentication with bcrypt password hashing
- 📁 **Case Management** - Track cases, hearings, outcomes, and related documents
- 👥 **Client Management** - Maintain client information and case history
- 📅 **Calendar** - Schedule and manage hearings, meetings, and deadlines
- 📄 **Document Management** - Upload and organize legal documents
- 🎯 **Role-Based Access** - Admin, Lawyer, and Paralegal roles
- 🔍 **Search & Filter** - Advanced search across cases and clients
- 📊 **Dashboard** - Overview of active cases, pending hearings, and success rate

## Prerequisites

- **Node.js** 18.17.0 or later
- **PostgreSQL** 14 or later
- **npm** or **pnpm** package manager
- **Git** for version control

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/0mer16/lawyers-mgmt.git
cd lawyers-mgmt
```

### 2. Install Dependencies

```bash
npm install
# or
pnpm install
```

### 3. Install jose for JWT

```bash
npm install jose
# or
pnpm add jose
```

## Environment Configuration

### 1. Copy Environment Template

```bash
cp .env.example .env
```

### 2. Configure Environment Variables

Edit `.env` with your settings:

```env
# Database - Replace with your PostgreSQL connection string
DATABASE_URL="postgresql://username:password@localhost:5432/lawyers_db"

# Authentication Secrets - Generate secure random strings
# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET="your-nextauth-secret-here"
JWT_SECRET="your-jwt-secret-here"

# Application URLs
NEXTAUTH_URL="http://localhost:3000"  # Change for production
APP_URL="http://localhost:3000"

# Environment
NODE_ENV="development"  # Change to "production" for deployment

# File Upload Settings (Optional)
MAX_FILE_SIZE_MB=5
ALLOWED_FILE_TYPES="pdf,doc,docx,xls,xlsx,jpg,jpeg,png"
```

### 3. Generate Secure Secrets

**For NEXTAUTH_SECRET and JWT_SECRET:**

```bash
# On Linux/Mac
openssl rand -base64 32

# On Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

⚠️ **Important**: Use different secrets for NEXTAUTH_SECRET and JWT_SECRET in production!

## Database Setup

### 1. Create PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE lawyers_db;

# Exit psql
\q
```

### 2. Run Database Migrations

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Or run migrations
npx prisma migrate deploy
```

### 3. Seed Initial Data (Optional)

```bash
npm run db:seed
```

This creates:
- Admin user: `admin@example.com` / `admin123`
- Lawyer user: `lawyer@example.com` / `lawyer123`
- Sample clients and cases

⚠️ **Production**: Change these passwords immediately after first login!

## Security Considerations

### 1. Password Security
- Minimum 6 characters required
- Passwords are hashed with bcrypt (10 rounds)
- JWT tokens expire after 7 days (configurable)

### 2. API Security
- Rate limiting implemented (100 req/15min for API, 5 req/15min for auth)
- CORS configured for production domain
- Security headers enabled (X-Frame-Options, CSP, etc.)

### 3. File Upload Security
- File size limited to 5MB
- File type validation
- Files stored in `/public/uploads` (consider cloud storage for production)

### 4. Database Security
- Use strong PostgreSQL passwords
- Enable SSL for database connections in production
- Regular backups recommended

### 5. Environment Security
- Never commit `.env` file to Git
- Use environment-specific secrets
- Rotate secrets regularly

## Production Deployment

### Option 1: Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables
   - Deploy!

3. **Configure Database**
   - Use Vercel Postgres or external PostgreSQL
   - Update DATABASE_URL in Vercel environment variables

### Option 2: Docker

```dockerfile
# Dockerfile included in project
docker build -t lawyers-mgmt .
docker run -p 3000:3000 --env-file .env lawyers-mgmt
```

### Option 3: Traditional VPS

1. **Install Node.js and PostgreSQL**
2. **Clone and setup**
   ```bash
   git clone <repo>
   cd lawyers-mgmt
   npm install
   npm run build
   ```
3. **Use PM2 for process management**
   ```bash
   npm install -g pm2
   pm2 start npm --name "lawyers-mgmt" -- start
   pm2 save
   pm2 startup
   ```

### Post-Deployment Checklist

- [ ] Update NEXTAUTH_URL to production domain
- [ ] Generate new production secrets
- [ ] Enable SSL/HTTPS
- [ ] Configure backups
- [ ] Change default user passwords
- [ ] Test all functionality
- [ ] Setup monitoring (e.g., Sentry)
- [ ] Configure email notifications (if needed)

## Development

### Run Development Server

```bash
npm run dev
```

Access at [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

### Database Commands

```bash
# View database in browser
npx prisma studio

# Create new migration
npx prisma migrate dev --name description

# Reset database (⚠️ deletes all data)
npx prisma migrate reset

# Seed database
npm run db:seed
```

## Maintenance

### Database Backups

```bash
# Backup
pg_dump -U username -d lawyers_db > backup.sql

# Restore
psql -U username -d lawyers_db < backup.sql
```

### Updating Dependencies

```bash
npm update
npx prisma generate
```

### Logs

- Check application logs in production
- Monitor rate limit hits
- Review authentication failures

## Troubleshooting

### Database Connection Issues
1. Verify DATABASE_URL is correct
2. Check PostgreSQL is running
3. Verify firewall allows connections
4. Test connection: `psql "postgresql://..."`

### Authentication Issues
1. Clear browser cookies
2. Verify JWT_SECRET is set
3. Check token expiration (default 7 days)
4. Review middleware.ts logs

### File Upload Issues
1. Check `/public/uploads` directory exists and is writable
2. Verify file size is under limit
3. Check file type is allowed
4. For production, consider using cloud storage (AWS S3, Cloudinary)

### Build Errors
1. Clear `.next` folder: `rm -rf .next`
2. Clear node_modules: `rm -rf node_modules && npm install`
3. Regenerate Prisma: `npx prisma generate`

## Support

For issues and questions:
- Create an issue on GitHub
- Check existing documentation
- Review error logs

## License

MIT License - See LICENSE file for details

---

**Version**: 1.0.0  
**Last Updated**: November 2025
