# ⚡ Quick Deploy to Render

## Copy-Paste Commands & Values

### 1️⃣ Database Setup (2 minutes)
- Go to: https://dashboard.render.com/
- Click: **New +** → **PostgreSQL**
- Name: `lawyers-mgmt-db`
- Region: Choose closest
- Click: **Create Database**
- ✅ Copy the **External Database URL**

---

### 2️⃣ Web Service Setup (3 minutes)
- Click: **New +** → **Web Service**
- Connect: `0mer16/lawyers-mgmt`
- Name: `lawyers-management-system`

**Build Command** (copy-paste):
```bash
npm install --legacy-peer-deps && npm run build
```

**Start Command** (copy-paste):
```bash
npm start
```

---

### 3️⃣ Environment Variables (5 minutes)

Click **Add Environment Variable** for each:

**1. NODE_ENV**
```
production
```

**2. DATABASE_URL**
```
[Paste your External Database URL from step 1]
```

**3. JWT_SECRET** (generate with this command):
```bash
openssl rand -base64 32
```
Then paste the output

**4. NEXTAUTH_SECRET**
```
[Same value as JWT_SECRET above]
```

**5. NEXTAUTH_URL**
```
https://lawyers-management-system.onrender.com
```
(Or your custom domain)

---

### 4️⃣ Deploy & Migrate (5 minutes)

1. Click **Create Web Service**
2. Wait for build (5-8 minutes)
3. When ready, click **Shell**
4. Run migration:
```bash
npx prisma migrate deploy
```

5. (Optional) Seed database:
```bash
npx prisma db seed
```

---

## ✅ Test Your Deployment

Visit: `https://lawyers-management-system.onrender.com`

- [ ] Landing page loads
- [ ] Click "Create Account"
- [ ] Register new user
- [ ] Sign in
- [ ] Dashboard appears
- [ ] Navigate to Cases
- [ ] Navigate to Clients
- [ ] Navigate to Calendar
- [ ] Theme switcher works
- [ ] Sign out works

---

## 🔧 If Something Goes Wrong

**Build fails?**
- Check logs in Render dashboard
- Verify build command is correct

**Can't connect to database?**
- Verify DATABASE_URL is correct
- Check database is running

**Authentication errors?**
- Ensure JWT_SECRET = NEXTAUTH_SECRET
- Both must be 32+ characters
- Update NEXTAUTH_URL to match your domain

**App loads forever?**
- This is normal on first load (cold start)
- Loading screen should appear
- Wait 30-60 seconds
- Free tier apps sleep after 15 min inactivity

---

## 📊 Expected Results

✅ First load: 30-60 seconds (shows loading screen)
✅ Active loads: <2 seconds
✅ All features working
✅ HTTPS automatic
✅ Mobile responsive
✅ Theme switcher functional

---

## 🎯 Production URLs

**Your App**: https://lawyers-management-system.onrender.com
**Health Check**: https://lawyers-management-system.onrender.com/api/health
**GitHub Repo**: https://github.com/0mer16/lawyers-mgmt

---

**Total Time**: ~15 minutes
**Status**: Ready to Deploy ✅
