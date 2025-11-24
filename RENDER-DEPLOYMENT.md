# Render Deployment Guide

## Prerequisites
- GitHub account with the repository
- Render account (free tier works)
- PostgreSQL database (can be created on Render)

## Step 1: Create PostgreSQL Database on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "PostgreSQL"
3. Configure:
   - **Name**: `lawyers-mgmt-db`
   - **Database**: `lawyers_management`
   - **User**: (auto-generated)
   - **Region**: Choose closest to your location
   - **Plan**: Free
4. Click "Create Database"
5. **Copy the External Database URL** (starts with `postgres://`)

## Step 2: Deploy Web Service

1. In Render Dashboard, click "New +" → "Web Service"
2. Connect your GitHub repository: `0mer16/lawyers-mgmt`
3. Configure the service:

### Basic Settings
- **Name**: `lawyers-management-system`
- **Region**: Same as database
- **Branch**: `main`
- **Root Directory**: (leave empty)
- **Runtime**: Node
- **Build Command**: 
  ```
  npm install --legacy-peer-deps && npx prisma generate && npm run build
  ```
- **Start Command**: 
  ```
  npm start
  ```

### Environment Variables
Add these environment variables (click "Add Environment Variable"):

1. **NODE_ENV**
   - Value: `production`

2. **DATABASE_URL**
   - Value: Paste the External Database URL from Step 1
   - Example: `postgres://user:password@dpg-xxxxx.oregon-postgres.render.com/lawyers_management`

3. **JWT_SECRET**
   - Value: Generate a random 32-character string
   - Example: `openssl rand -base64 32` (run in terminal)

4. **NEXTAUTH_SECRET**
   - Value: Same as JWT_SECRET (must match)

5. **NEXTAUTH_URL**
   - Value: Your Render app URL
   - Example: `https://lawyers-management-system.onrender.com`
   - (You can add this after deployment or use the auto-generated URL)

### Advanced Settings
- **Auto-Deploy**: Yes
- **Health Check Path**: `/`
- **Plan**: Free (or choose paid for better performance)

## Step 3: Initial Database Setup

After deployment:

1. Go to your Render web service dashboard
2. Click "Shell" to open a terminal
3. Run the migration:
   ```bash
   npx prisma migrate deploy
   ```
4. (Optional) Seed the database:
   ```bash
   npx prisma db seed
   ```

## Step 4: Update NEXTAUTH_URL

1. Copy your deployed app URL (e.g., `https://lawyers-management-system.onrender.com`)
2. Go to Environment → Edit `NEXTAUTH_URL`
3. Update with your actual URL
4. Click "Save Changes" (this will trigger a redeploy)

## Important Notes

### Cold Start Issue
Render's free tier puts apps to sleep after 15 minutes of inactivity. The custom loading screen (`app/loading-screen.tsx` and `app/render-init.tsx`) handles this gracefully by:
- Showing a professional loading animation
- Waiting for the app to wake up
- Ensuring DOM is ready before rendering

### Performance Optimization
The app includes:
- ✅ Custom loading screen for cold starts
- ✅ Proper error boundaries
- ✅ Optimized image loading
- ✅ JWT session persistence
- ✅ Database connection pooling

### Common Issues

**Issue: App won't start**
- Check build logs in Render dashboard
- Verify all environment variables are set
- Ensure DATABASE_URL is correct

**Issue: Database connection fails**
- Verify the database is running
- Check DATABASE_URL format
- Ensure database and web service are in same region

**Issue: JWT errors**
- Ensure JWT_SECRET and NEXTAUTH_SECRET match
- Must be at least 32 characters
- No special characters that need escaping

**Issue: Slow first load**
- This is normal on free tier (cold start)
- Loading screen handles this UX
- Consider paid plan for instant wake-up

### Testing After Deployment

1. Visit your app URL
2. Create a new account
3. Sign in
4. Test navigation:
   - Dashboard
   - Cases
   - Clients
   - Calendar
   - Hearings
5. Verify all features work

### Monitoring

Check these in Render dashboard:
- **Logs**: View real-time application logs
- **Metrics**: Monitor CPU, memory usage
- **Events**: See deployment history
- **Shell**: Access terminal for debugging

## Support

If you encounter issues:
1. Check Render logs first
2. Verify environment variables
3. Test database connection
4. Review GitHub Actions (if enabled)

## Cost Considerations

**Free Tier Includes:**
- Web service with 750 hours/month
- PostgreSQL database (90 days, then expires)
- SSL certificate
- Custom domain support

**Upgrade to paid plan for:**
- No cold starts
- Persistent database
- More resources
- Better performance

## Security Checklist

- ✅ Environment variables properly set
- ✅ Database credentials secured
- ✅ JWT secrets are random and strong
- ✅ HTTPS enabled (automatic on Render)
- ✅ No secrets in code or repository
- ✅ Database has proper access controls

---

**Deployment Status**: Ready for production ✅
**Last Updated**: November 2025
