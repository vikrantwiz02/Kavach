const mongoose = require('mongoose');

const sosAlertSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  location: {
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    },
    accuracy: Number,
    address: String
  },
  triggerType: {
    type: String,
    enum: ['button', 'voice', 'shake'],
    default: 'button'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  resolvedAt: Date,
  notifiedContacts: [{
    name: String,
    phone: String,
    notifiedAt: Date
  }]
}, { timestamps: true });

module.exports = mongoose.model('SOSAlert', sosAlertSchema);
