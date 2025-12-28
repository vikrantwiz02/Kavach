# Kavach - Women's Safety Web Application 🛡️

A production-ready, comprehensive Women's Safety Platform featuring real-time SOS alerts, complaint filing, voice-activated distress triggers, fake call simulation, and live admin monitoring.

## 🚀 Features

### Core Safety Features
- **🚨 One-Tap SOS Button**: Instant emergency alert with real-time location broadcasting via Geolocation API and Socket.io
- **🎤 Voice-Activated SOS**: Hands-free distress trigger using Web Speech API (Say "help", "emergency", or "SOS")
- **📝 Complaint Filing Portal**: Secure incident reporting with image upload (up to 5 images) and automatic location capture
- **⚙️ Live Admin Dashboard**: Real-time monitoring of SOS alerts and complaint management with status updates
- **📞 Fake Call Simulator**: Realistic incoming call simulation to escape uncomfortable situations
- **🔐 JWT Authentication**: Secure user registration and login system

### Technical Features
- Real-time location tracking (updates every 30 seconds during SOS)
- Socket.io for instant communication between users and admins
- Mongoose database for persistent data storage
- Multer for secure image uploads
- Responsive design for mobile and desktop
- Progressive Web App capabilities

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- Modern web browser with Geolocation and Web Speech API support

## 🛠️ Installation

1. **Clone or navigate to the project directory:**
   ```bash
   cd /Users/vikrant/Desktop/Kavach
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables in `.env`:**
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/kavach
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   CLIENT_URL=http://localhost:5000
   ```

5. **Ensure MongoDB is running:**
   ```bash
   # macOS with Homebrew
   brew services start mongodb-community
   
   # Or manually
   mongod --dbpath /usr/local/var/mongodb
   ```

6. **Build the React frontend:**
   ```bash
   npm run build
   ```

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The application will be available at: `http://localhost:5000`

## 📱 Usage

### For Users:

1. **Register**: Create account with emergency contacts
2. **Login**: Access the dashboard
3. **SOS Alert**: 
   - One-tap button for instant alert
   - Enable voice activation for hands-free SOS
   - Location automatically tracked and shared
4. **File Complaint**: Report incidents with photos and location
5. **Fake Call**: Simulate incoming call to exit unsafe situations

### For Admins:

1. **Login** with admin credentials
2. **Monitor Dashboard**: View real-time SOS alerts and statistics
3. **Manage Complaints**: Update status, priority, and add notes
4. **Track Locations**: See user locations on map during SOS
5. **Resolve Alerts**: Mark SOS alerts as resolved

### Creating Admin User

Run in MongoDB shell:
```javascript
use kavach
db.users.updateOne(
  { email: "admin@kavach.com" },
  { 
    $set: { 
      role: "admin",
      name: "Admin",
      phone: "1234567890"
    }
  },
  { upsert: true }
)
```

Or register normally and manually update the role in MongoDB.

## 📂 Project Structure

```
Kavach/
├── server.js              # Main Express server with Socket.io
├── package.json           # Dependencies and scripts
├── webpack.config.js      # Webpack bundling configuration
├── index.jsx              # React entry point
├── App.jsx                # Main React component with routing
├── App.css                # Complete styling
├── UserModel.js           # User schema and authentication
├── ComplaintModel.js      # Complaint data model
├── SOSModel.js            # SOS alert model
├── authMiddleware.js      # JWT authentication middleware
├── Login.jsx              # Login component
├── Register.jsx           # Registration with emergency contacts
├── Dashboard.jsx          # User dashboard
├── SOSButton.jsx          # SOS with Geolocation & Voice API
├── ComplaintForm.jsx      # Complaint filing with image upload
├── AdminDashboard.jsx     # Real-time admin monitoring
├── FakeCall.jsx           # Fake call simulator
├── public/
│   └── index.html         # HTML template
├── uploads/               # Image storage directory
├── .env.example           # Environment variables template
├── .gitignore             # Git ignore rules
└── README.md              # This file
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Complaints
- `POST /api/complaints` - File new complaint (with images)
- `GET /api/complaints/my` - Get user's complaints
- `GET /api/complaints` - Get all complaints (Admin)
- `PATCH /api/complaints/:id` - Update complaint status (Admin)

### SOS Alerts
- `GET /api/sos/active` - Get active SOS alerts (Admin)
- `GET /api/sos/history` - Get user's SOS history
- `PATCH /api/sos/:id/resolve` - Resolve SOS alert (Admin)

### Admin
- `GET /api/admin/stats` - Dashboard statistics (Admin)

### Socket.io Events
- `user-online` - User connects
- `sos-alert` - SOS triggered
- `location-update` - Location broadcast
- `new-sos-alert` - Broadcast to admins
- `new-complaint` - New complaint notification

## 🔒 Security Features

- Bcrypt password hashing
- JWT token authentication
- Helmet.js for HTTP headers security
- CORS configuration
- Input validation with express-validator
- File upload restrictions (images only, 5MB limit)
- Role-based access control

## 🌐 Browser Compatibility

- Chrome 80+ (recommended)
- Firefox 75+
- Safari 13+
- Edge 80+

**Required APIs:**
- Geolocation API
- Web Speech API (for voice activation)
- Notification API (for fake call)

## 🎨 Color Scheme

- Primary: `#667eea` (Purple-Blue)
- Secondary: `#764ba2` (Purple)
- Alert: `#ff6b6b` (Red)
- Success: `#4caf50` (Green)
- Warning: `#ffa502` (Orange)

## 🤝 Support

For support, emergency help numbers:
- Police: 100
- Women Helpline: 1091 / 181
- Ambulance: 102

## 📄 License

MIT License - Feel free to use this project for educational and safety purposes.

## 🙏 Acknowledgments

- Built with React, Express, Socket.io, and MongoDB
- Uses Web APIs: Geolocation, Web Speech, Notifications
- Designed for women's safety and empowerment

---

**Stay Safe! 🛡️**
