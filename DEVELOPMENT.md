# Kavach Development Guide

## Quick Start

### Automated Setup (Recommended)
```bash
./setup.sh
```

### Manual Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Setup Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start MongoDB**
   ```bash
   brew services start mongodb-community
   ```

4. **Build Frontend**
   ```bash
   npm run build
   ```

5. **Start Application**
   ```bash
   npm start
   ```

## Development Workflow

### Running in Dev Mode
```bash
npm run dev
```
This uses nodemon for auto-restart on file changes.

### Building Frontend
```bash
npm run build
```
Compiles React components with Webpack.

### Testing Features

#### 1. User Registration & Login
- Register with email, password, phone, and emergency contacts
- Login returns JWT token stored in localStorage
- Token required for all authenticated routes

#### 2. SOS Alert System
- **Button Trigger**: Click the red SOS button
- **Voice Trigger**: Enable voice activation and say "help", "emergency", or "SOS"
- **Location Tracking**: Geolocation API captures and broadcasts position every 30 seconds
- **Real-time Updates**: Socket.io sends alerts to all connected admins

#### 3. Complaint Filing
- Upload up to 5 images (max 5MB each)
- Automatic location capture
- View complaint history with status updates
- Receive real-time notifications when admin updates status

#### 4. Admin Dashboard
- View real-time SOS alerts with user location
- Manage complaints (update status, priority, add notes)
- View statistics (total users, active alerts, pending complaints)
- Click locations to view on Google Maps

#### 5. Fake Call Feature
- Choose caller name (presets or custom)
- Set delay (5-60 seconds)
- Realistic incoming call screen
- Suggested conversation starters

## Socket.io Events

### Client to Server
- `user-online`: User connects with userId
- `sos-alert`: User triggers SOS with location
- `location-update`: Continuous location updates during SOS

### Server to Client
- `new-sos-alert`: Broadcast to admins when SOS triggered
- `sos-confirmed`: Confirmation to user that SOS was sent
- `sos-error`: Error notification
- `new-complaint`: Notify admins of new complaint
- `complaint-updated`: Notify user of status changes
- `user-location-update`: Real-time location broadcasts
- `sos-resolved`: Alert resolution notification

## Database Schema

### Users Collection
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  emergencyContacts: [{ name, phone, relation }],
  role: String ('user' | 'admin'),
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Complaints Collection
```javascript
{
  userId: ObjectId (ref: User),
  title: String,
  description: String,
  category: String,
  location: { latitude, longitude, address },
  images: [{ filename, path, uploadedAt }],
  status: String ('pending' | 'investigating' | 'resolved' | 'closed'),
  priority: String ('low' | 'medium' | 'high' | 'critical'),
  adminNotes: String,
  resolvedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### SOS Alerts Collection
```javascript
{
  userId: ObjectId (ref: User),
  location: { latitude, longitude, accuracy, address },
  triggerType: String ('button' | 'voice' | 'shake'),
  isActive: Boolean,
  resolvedAt: Date,
  notifiedContacts: [{ name, phone, notifiedAt }],
  createdAt: Date,
  updatedAt: Date
}
```

## API Testing with cURL

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "phone": "1234567890",
    "emergencyContacts": [
      { "name": "Mom", "phone": "9876543210", "relation": "Mother" }
    ]
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### File Complaint (with auth token)
```bash
curl -X POST http://localhost:5000/api/complaints \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "title=Harassment Incident" \
  -F "description=Detailed description here" \
  -F "category=harassment" \
  -F "location={\"latitude\":28.7041,\"longitude\":77.1025}" \
  -F "images=@/path/to/image.jpg"
```

## Production Deployment Checklist

- [ ] Update JWT_SECRET in .env with strong random value
- [ ] Set NODE_ENV=production
- [ ] Configure MongoDB with authentication
- [ ] Setup SSL/HTTPS
- [ ] Configure CORS with specific origins
- [ ] Enable MongoDB replica set for production
- [ ] Setup proper logging (Winston, Morgan)
- [ ] Configure rate limiting
- [ ] Setup CDN for static assets
- [ ] Configure backup strategy for database
- [ ] Setup monitoring (PM2, New Relic, etc.)
- [ ] Test on multiple devices and browsers
- [ ] Setup error tracking (Sentry)
- [ ] Configure email/SMS notifications for emergency contacts
- [ ] Review and audit security measures

## Troubleshooting

### MongoDB Connection Error
```bash
# Check MongoDB status
brew services list

# Restart MongoDB
brew services restart mongodb-community

# Check logs
tail -f /usr/local/var/log/mongodb/mongo.log
```

### Port Already in Use
```bash
# Find process using port 5000
lsof -ti:5000

# Kill the process
kill -9 $(lsof -ti:5000)
```

### Webpack Build Errors
```bash
# Clear cache and rebuild
rm -rf node_modules public/bundle.js*
npm install
npm run build
```

### Geolocation Not Working
- Ensure HTTPS or localhost (required for Geolocation API)
- Check browser permissions for location access
- Test in different browsers

### Web Speech API Not Working
- Use Chrome or Edge (best support)
- Ensure microphone permissions granted
- Check console for errors

## Performance Optimization

1. **Frontend**
   - Code splitting with React.lazy
   - Image optimization before upload
   - Service workers for offline capability
   - Local storage for auth tokens

2. **Backend**
   - Database indexing on frequently queried fields
   - Connection pooling for MongoDB
   - Compression middleware for responses
   - Static file caching

3. **Socket.io**
   - Use rooms for targeted broadcasts
   - Implement reconnection logic
   - Throttle location updates

## Security Best Practices

1. **Authentication**
   - Strong password requirements (min 6 chars)
   - JWT token expiration (7 days)
   - Refresh token mechanism
   - Rate limiting on auth endpoints

2. **File Uploads**
   - File type validation (images only)
   - Size restrictions (5MB max)
   - Filename sanitization
   - Virus scanning in production

3. **Data Protection**
   - Helmet.js for HTTP headers
   - CORS configuration
   - Input validation and sanitization
   - SQL injection prevention (Mongoose)
   - XSS protection

## Contributing

When adding new features:
1. Follow existing code structure
2. Add proper error handling
3. Update this documentation
4. Test on multiple devices
5. Consider security implications

## Support

For technical support or emergency assistance:
- Technical Issues: Check console logs and network tab
- Emergency Help: Contact local authorities or use helpline numbers in the app

---

Built with ❤️ for women's safety
