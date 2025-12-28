# 🚨 Kavach - Women's Safety Web Application

A production-ready women's safety platform with real-time SOS alerts, voice activation, complaint filing, and emergency contact notifications.

## ✨ Features

- **🚨 One-Tap SOS Button** - Instant emergency alerts with real-time location tracking
- **🎤 Voice Activation** - Say "help", "emergency", or "SOS" to trigger alerts
- **📝 Complaint Filing** - Report incidents with image uploads and location
- **👮 Admin Dashboard** - Real-time monitoring of SOS alerts and complaints
- **📞 Fake Call** - Emergency exit strategy with realistic incoming call simulator
- **🔐 JWT Authentication** - Secure user authentication and authorization
- **📱 SMS Notifications** - Automatic Twilio SMS to emergency contacts
- **🗺️ Live Location Broadcasting** - Real-time location updates via Socket.IO

## 🛠️ Tech Stack

**Frontend:** React 18, React Router v6, Socket.io Client, Axios  
**Backend:** Node.js, Express.js, Socket.IO, MongoDB, Mongoose  
**Authentication:** JWT, bcrypt  
**APIs:** Geolocation API, Web Speech API, Notifications API  
**SMS:** Twilio  
**Security:** Helmet, CORS, express-validator

## 🚀 Deployment on Vercel

### Prerequisites
- GitHub account
- Vercel account (free tier works!)
- MongoDB Atlas cluster (already configured)
- Twilio account (already configured)

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit - Kavach Women's Safety App"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/kavach.git
git push -u origin main
```

### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"New Project"**
3. Import your `kavach` repository
4. Configure **Environment Variables** (click "Environment Variables"):

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret_key
TWILIO_SID=your_twilio_account_sid
TWILIO_AUTH=your_twilio_auth_token
TWILIO_PHONE=your_twilio_phone_number
NODE_ENV=production
PORT=3000
```

**Note:** Use your actual credentials from `.env` file (don't commit real credentials to GitHub)

5. Click **"Deploy"** and wait ~2 minutes

### Step 3: Update CLIENT_URL
After deployment, get your Vercel URL (e.g., `https://kavach-xyz.vercel.app`)

Add one more environment variable:
- `CLIENT_URL` = `https://your-actual-vercel-url.vercel.app`

Then click **"Redeploy"**

### ⚠️ Important: Socket.IO on Vercel
Vercel's serverless functions have limitations. For production Socket.IO, consider:
- **Railway.app** (recommended for Socket.IO)
- **Render.com** (free tier available)
- **Heroku** (still works great)

Or deploy just the frontend on Vercel and backend elsewhere.

## 📦 Local Development

### Installation
```bash
npm install
```

### Environment Variables
Create a `.env` file in the root directory:
```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret_key
CLIENT_URL=http://localhost:3000
NODE_ENV=development
TWILIO_SID=your_twilio_account_sid
TWILIO_AUTH=your_twilio_auth_token
TWILIO_PHONE=your_twilio_phone_number
```

**Get your credentials from:**
- MongoDB: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Twilio: [Twilio Console](https://www.twilio.com/console)

### Build & Run
```bash
npm run build    # Build frontend
npm start        # Start server
```

Open [http://localhost:3000](http://localhost:3000)

## 📝 User Registration

When registering, users must provide:
- Name, Email, Password (min 6 chars)
- Phone number
- **Emergency Contacts** (name, phone, relation)

Emergency contacts receive SMS alerts when SOS is triggered.

## 🎤 Voice Commands

Enable voice activation and say:
- "help"
- "emergency"
- "SOS"
- "danger"

## 📱 Browser Compatibility

- **Chrome/Edge** - Full support (Web Speech API)
- **Firefox/Safari** - SOS works, voice activation not available

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcrypt
- Helmet security headers
- CORS protection
- Input validation
- XSS protection

## 🌍 Geolocation

The app uses dual-fallback for location:
1. High accuracy GPS (8s timeout)
2. Low accuracy fallback (10s timeout)

**SOS works even without location** - emergency contacts are notified regardless.

### Location Troubleshooting
- Enable WiFi (even without connecting)
- Allow browser location permissions
- Check System Settings → Privacy & Security → Location Services
- Move near a window or outdoors

## 📊 Admin Features

Admin users can:
- View all active SOS alerts in real-time
- Monitor complaint submissions
- Resolve incidents
- Access user emergency contacts

To create admin user, manually update MongoDB:
```javascript
db.users.updateOne(
  { email: "admin@kavach.com" },
  { $set: { role: "admin" } }
)
```

## 🆘 Emergency Numbers (India)

- **Police:** 100
- **Women Helpline:** 1091
- **Ambulance:** 102
- **National Emergency:** 112

## 📸 Screenshots

### Dashboard
- SOS Button with one-tap activation
- Voice activation toggle
- Emergency contacts display
- Quick action buttons

### Admin Panel
- Real-time SOS alerts
- Complaint management
- User emergency contact access
- Location tracking map links

## 🛠️ File Structure

```
Kavach/
├── server.js              # Express + Socket.IO server
├── UserModel.js           # User schema with emergency contacts
├── ComplaintModel.js      # Complaint schema
├── SOSModel.js           # SOS alert schema
├── authMiddleware.js     # JWT auth & admin middleware
├── index.jsx             # React app entry
├── App.jsx               # Main React component
├── SOSButton.jsx         # SOS + Voice feature
├── Dashboard.jsx         # User dashboard
├── AdminDashboard.jsx    # Admin panel
├── ComplaintForm.jsx     # File complaint
├── FakeCall.jsx          # Fake call simulator
├── Login.jsx             # Login page
├── Register.jsx          # Registration with emergency contacts
├── App.css               # Complete styling
├── webpack.config.js     # Build configuration
├── vercel.json           # Vercel deployment config
└── package.json          # Dependencies
```

## 🤝 Contributing

This is a production-ready application. For improvements:
1. Fork the repository
2. Create feature branch
3. Submit pull request

## 📄 License

MIT License - feel free to use for safety initiatives

## 🙏 Credits

Built with ❤️ for women's safety

---

**Always prioritize calling local authorities in real emergencies**
