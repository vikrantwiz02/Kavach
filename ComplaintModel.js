const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['harassment', 'stalking', 'assault', 'domestic_violence', 'cyber_crime', 'other'],
    required: true
  },
  location: {
    latitude: Number,
    longitude: Number,
    address: String
  },
  images: [{
    filename: String,
    path: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  status: {
    type: String,
    enum: ['pending', 'investigating', 'resolved', 'closed'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  adminNotes: String,
  resolvedAt: Date
}, { timestamps: true });

module.exports = mongoose.model('Complaint', complaintSchema);
