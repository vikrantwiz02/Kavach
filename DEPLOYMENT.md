# ⚠️ IMPORTANT: Vercel Deployment Limitations

## The Problem
Vercel uses **serverless functions** which are:
- Stateless (no persistent connections)
- Short-lived (10s execution limit on free tier, 60s on pro)
- Not ideal for Socket.IO real-time features

**Socket.IO won't work properly on Vercel** because it requires persistent WebSocket connections.

## ✅ Recommended Solution: Use Railway.app

Railway.app supports long-running Node.js servers with Socket.IO perfectly.

### Deploy to Railway (Recommended)

1. **Go to [railway.app](https://railway.app)** and sign in with GitHub
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select **`vikrantwiz02/Kavach`**
4. Railway will auto-detect Node.js and deploy

5. **Add Environment Variables:**
   - Go to your project → **Variables** tab
   - Add all variables from your `.env` file:
     ```
     MONGODB_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret
     TWILIO_SID=your_twilio_account_sid
     TWILIO_AUTH=your_twilio_auth_token
     TWILIO_PHONE=your_twilio_phone_number
     NODE_ENV=production
     PORT=3000
     ```

6. **Generate Domain:**
   - Go to **Settings** → **Networking**
   - Click **"Generate Domain"**
   - Copy your URL: `https://your-app.up.railway.app`

7. **Update CLIENT_URL:**
   - Add `CLIENT_URL` = `https://your-app.up.railway.app`
   - Railway will auto-redeploy

### Pricing
- **Free Tier:** $5 credit per month (enough for development)
- **After free tier:** ~$5-10/month depending on usage

---

## Alternative: Render.com (Also Free)

1. Go to [render.com](https://render.com) and sign in
2. Click **"New +"** → **"Web Service"**
3. Connect GitHub repo `vikrantwiz02/Kavach`
4. Configure:
   - **Name:** kavach
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
5. Add environment variables (same as Railway)
6. Click **"Create Web Service"**

Free tier available with some limitations (spins down after inactivity).

---

## What Works on Vercel?

On Vercel, these features will work:
- ✅ Login/Register (JWT auth)
- ✅ Complaint filing
- ✅ Admin dashboard (viewing complaints)
- ✅ Fake call
- ✅ Static content

These features **won't work properly**:
- ❌ Real-time SOS alerts (Socket.IO)
- ❌ Live location broadcasting
- ❌ Real-time admin notifications

---

## Quick Comparison

| Feature | Vercel | Railway | Render |
|---------|--------|---------|--------|
| Socket.IO | ❌ No | ✅ Yes | ✅ Yes |
| Free Tier | ✅ Yes | ✅ $5/mo credit | ✅ Yes |
| Custom Domain | ✅ Yes | ✅ Yes | ✅ Yes |
| Auto-deploy | ✅ Yes | ✅ Yes | ✅ Yes |
| Best For | Static/API | Full-stack | Full-stack |

---

## Current Status

Your code is pushed to GitHub and **will deploy on Vercel**, but:
- Most features will work
- Real-time Socket.IO features will be broken
- Use Railway or Render for full functionality

**Recommended Action:** Deploy to Railway.app for production use.
