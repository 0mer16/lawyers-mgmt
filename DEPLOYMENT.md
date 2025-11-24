# Production Deployment Guide

This guide covers deploying the Lawyers Management System to production.

## Prerequisites

- Node.js 18.17.0 or later
- PostgreSQL database
- Domain name (optional but recommended)

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@host:5432/database"

# Authentication
NEXTAUTH_SECRET="your-secret-key-here-use-openssl-rand-base64-32"
NEXTAUTH_URL="https://yourdomain.com"
JWT_SECRET="another-secret-key-here"

# Node Environment
NODE_ENV="production"
```

**Important:** Generate secure secrets using:
```bash
openssl rand -base64 32
```

## Deployment Options

### Option 1: Traditional Server (VPS, Dedicated Server)

1. **Install dependencies:**
   ```bash
   npm install --production --legacy-peer-deps
   ```

2. **Build the application:**
   ```bash
   npm run build
   ```

3. **Run database migrations:**
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

4. **Start the application:**
   ```bash
   npm start
   ```

5. **Use PM2 for process management (recommended):**
   ```bash
   npm install -g pm2
   pm2 start npm --name "lawyers-mgmt" -- start
   pm2 save
   pm2 startup
   ```

### Option 2: Vercel (Recommended for Next.js)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel --prod
   ```

4. **Set environment variables in Vercel dashboard**
   - Go to your project settings
   - Add all environment variables from `.env`
   - Redeploy

### Option 3: Docker

1. **Build Docker image:**
   ```bash
   docker build -t lawyers-mgmt .
   ```

2. **Run container:**
   ```bash
   docker run -p 3000:3000 \
     -e DATABASE_URL="..." \
     -e NEXTAUTH_SECRET="..." \
     -e JWT_SECRET="..." \
     lawyers-mgmt
   ```

### Option 4: Docker Compose

```bash
docker-compose up -d
```

## Database Setup

### PostgreSQL Setup

1. **Create database:**
   ```sql
   CREATE DATABASE lawyers_management_system;
   CREATE USER lawyers_user WITH ENCRYPTED PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE lawyers_management_system TO lawyers_user;
   ```

2. **Update DATABASE_URL in .env:**
   ```
   DATABASE_URL="postgresql://lawyers_user:your_password@localhost:5432/lawyers_management_system"
   ```

### Managed Database Services

- **Supabase:** Create a PostgreSQL database and use the connection string
- **Neon:** Create a serverless Postgres database
- **Railway:** One-click PostgreSQL deployment
- **AWS RDS:** Enterprise-grade managed PostgreSQL

## Nginx Configuration (for VPS)

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## SSL Certificate (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

## Performance Optimization

1. **Enable caching in Nginx**
2. **Use CDN for static assets**
3. **Enable compression**
4. **Monitor with PM2 or application monitoring services**
5. **Set up database connection pooling**

## Security Checklist

- [ ] Generate secure secrets for JWT and NextAuth
- [ ] Enable HTTPS/SSL
- [ ] Set secure cookie settings
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Set up firewall rules
- [ ] Regular backups of database
- [ ] Keep dependencies updated
- [ ] Monitor application logs

## Backup Strategy

### Database Backup (PostgreSQL)

```bash
# Manual backup
pg_dump -U lawyers_user lawyers_management_system > backup.sql

# Automated daily backup (cron job)
0 2 * * * pg_dump -U lawyers_user lawyers_management_system > /backups/backup_$(date +\%Y\%m\%d).sql
```

### Restore from Backup

```bash
psql -U lawyers_user lawyers_management_system < backup.sql
```

## Monitoring

1. **Application Monitoring:**
   - PM2 Dashboard
   - New Relic
   - DataDog
   - Sentry for error tracking

2. **Server Monitoring:**
   - htop for real-time monitoring
   - Prometheus + Grafana
   - CloudWatch (AWS)

3. **Database Monitoring:**
   - PostgreSQL logs
   - pg_stat_statements
   - Database-specific monitoring tools

## Troubleshooting

### Application won't start

1. Check environment variables are set correctly
2. Verify database connection
3. Check logs: `pm2 logs` or `docker logs <container-id>`
4. Ensure all dependencies are installed

### Database connection issues

1. Verify DATABASE_URL format
2. Check PostgreSQL is running
3. Verify firewall rules allow connection
4. Test connection manually: `psql <DATABASE_URL>`

### Performance issues

1. Check database indexes
2. Monitor query performance
3. Enable caching
4. Scale horizontally if needed

## Scaling

### Horizontal Scaling

1. Deploy multiple instances behind a load balancer
2. Use managed database service
3. Implement Redis for session storage
4. Use CDN for static assets

### Vertical Scaling

1. Increase server resources (CPU, RAM)
2. Optimize database queries
3. Add database read replicas

## Cost Optimization

- Use serverless platforms (Vercel, Netlify) for automatic scaling
- Implement caching to reduce database queries
- Use CDN to reduce bandwidth costs
- Consider managed services for database

## Support

For issues or questions:
1. Check the main README.md
2. Review application logs
3. Check GitHub issues
4. Contact system administrator
