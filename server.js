require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const multer = require('multer');
const { body, validationResult } = require('express-validator');

// Models
const User = require('./UserModel');
const Complaint = require('./ComplaintModel');
const SOSAlert = require('./SOSModel');

// Middleware
const { authMiddleware, adminMiddleware, generateToken } = require('./authMiddleware');

// Initialize Express
const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST']
  }
});

// Middleware Setup
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kavach')
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error('❌ MongoDB Connection Error:', err));

// File Upload Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Socket.IO - Real-time SOS Tracking
const activeUsers = new Map();

io.on('connection', (socket) => {
  console.log('👤 User connected:', socket.id);

  socket.on('user-online', (userId) => {
    activeUsers.set(userId, socket.id);
    socket.userId = userId;
  });

  socket.on('sos-alert', async (data) => {
    try {
      const sosAlert = new SOSAlert({
        userId: data.userId,
        location: data.location,
        triggerType: data.triggerType || 'button'
      });
      await sosAlert.save();

      // Broadcast to all admins
      io.emit('new-sos-alert', {
        alertId: sosAlert._id,
        userId: data.userId,
        userName: data.userName,
        location: data.location,
        triggerType: data.triggerType,
        timestamp: new Date()
      });

      // Notify emergency contacts
      socket.emit('sos-confirmed', { alertId: sosAlert._id });
    } catch (error) {
      socket.emit('sos-error', { message: 'Failed to send SOS alert' });
    }
  });

  socket.on('location-update', (data) => {
    io.emit('user-location-update', {
      userId: data.userId,
      location: data.location,
      timestamp: new Date()
    });
  });

  socket.on('disconnect', () => {
    if (socket.userId) {
      activeUsers.delete(socket.userId);
    }
    console.log('👤 User disconnected:', socket.id);
  });
});

// ==================== AUTH ROUTES ====================

// Register
app.post('/api/auth/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').notEmpty().withMessage('Phone number is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, phone, emergencyContacts } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = new User({ name, email, password, phone, emergencyContacts });
    await user.save();

    const token = generateToken(user._id);
    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login
app.post('/api/auth/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is inactive' });
    }

    const token = generateToken(user._id);
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        emergencyContacts: user.emergencyContacts
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get Current User
app.get('/api/auth/me', authMiddleware, async (req, res) => {
  res.json({ user: req.user });
});

// ==================== COMPLAINT ROUTES ====================

// File Complaint with Image Upload
app.post('/api/complaints', authMiddleware, upload.array('images', 5), async (req, res) => {
  try {
    const { title, description, category, location } = req.body;

    const images = req.files?.map(file => ({
      filename: file.filename,
      path: file.path
    })) || [];

    const complaint = new Complaint({
      userId: req.user._id,
      title,
      description,
      category,
      location: location ? JSON.parse(location) : undefined,
      images
    });

    await complaint.save();

    // Notify admins via Socket.IO
    io.emit('new-complaint', {
      complaintId: complaint._id,
      userName: req.user.name,
      title: complaint.title,
      category: complaint.category,
      timestamp: complaint.createdAt
    });

    res.status(201).json({
      message: 'Complaint filed successfully',
      complaint
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to file complaint', error: error.message });
  }
});

// Get User's Complaints
app.get('/api/complaints/my', authMiddleware, async (req, res) => {
  try {
    const complaints = await Complaint.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    res.json({ complaints });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch complaints', error: error.message });
  }
});

// Get All Complaints (Admin Only)
app.get('/api/complaints', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status, priority } = req.query;
    const filter = {};
    
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const complaints = await Complaint.find(filter)
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });
    
    res.json({ complaints });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch complaints', error: error.message });
  }
});

// Update Complaint Status (Admin Only)
app.patch('/api/complaints/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status, priority, adminNotes } = req.body;
    const updateData = { status, priority, adminNotes };
    
    if (status === 'resolved' || status === 'closed') {
      updateData.resolvedAt = new Date();
    }

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('userId', 'name email phone');

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Notify user via Socket.IO
    const userSocketId = activeUsers.get(complaint.userId._id.toString());
    if (userSocketId) {
      io.to(userSocketId).emit('complaint-updated', {
        complaintId: complaint._id,
        status: complaint.status,
        adminNotes: complaint.adminNotes
      });
    }

    res.json({ message: 'Complaint updated', complaint });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update complaint', error: error.message });
  }
});

// ==================== SOS ROUTES ====================

// Get Active SOS Alerts (Admin Only)
app.get('/api/sos/active', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const alerts = await SOSAlert.find({ isActive: true })
      .populate('userId', 'name email phone emergencyContacts')
      .sort({ createdAt: -1 });
    
    res.json({ alerts });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch SOS alerts', error: error.message });
  }
});

// Get User's SOS History
app.get('/api/sos/history', authMiddleware, async (req, res) => {
  try {
    const alerts = await SOSAlert.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);
    
    res.json({ alerts });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch SOS history', error: error.message });
  }
});

// Resolve SOS Alert (Admin Only)
app.patch('/api/sos/:id/resolve', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const alert = await SOSAlert.findByIdAndUpdate(
      req.params.id,
      { isActive: false, resolvedAt: new Date() },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    io.emit('sos-resolved', { alertId: alert._id });
    res.json({ message: 'SOS alert resolved', alert });
  } catch (error) {
    res.status(500).json({ message: 'Failed to resolve SOS alert', error: error.message });
  }
});

// ==================== DASHBOARD STATS ====================

// Admin Dashboard Stats
app.get('/api/admin/stats', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [
      totalUsers,
      totalComplaints,
      pendingComplaints,
      activeSOSAlerts,
      resolvedComplaints
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: 'pending' }),
      SOSAlert.countDocuments({ isActive: true }),
      Complaint.countDocuments({ status: 'resolved' })
    ]);

    res.json({
      totalUsers,
      totalComplaints,
      pendingComplaints,
      activeSOSAlerts,
      resolvedComplaints
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch stats', error: error.message });
  }
});

// Serve React App
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Kavach Server running on port ${PORT}`);
  console.log(`📱 Open http://localhost:${PORT} in your browser`);
});

module.exports = { app, io };
