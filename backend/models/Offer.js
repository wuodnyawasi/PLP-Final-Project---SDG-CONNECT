const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  category: {
    type: String,
    required: true,
    enum: ['food-perishables', 'clothing-bedding', 'home-furniture', 'money', 'skills-time', 'other'],
  },
  donorName: {
    type: String,
    trim: true,
  },
  contact: {
    type: String,
    required: true,
    trim: true,
  },
  isAnonymous: {
    type: Boolean,
    default: false,
  },
  // Physical items fields
  itemType: {
    type: String,
    trim: true,
  },
  quantity: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  logistics: {
    type: String,
    enum: ['delivery', 'pickup'],
  },
  pickupLocation: {
    type: String,
    trim: true,
  },
  contactPerson: {
    type: String,
    trim: true,
  },
  // Skills fields
  skill: {
    type: String,
    trim: true,
  },
  timeCommitment: {
    type: String,
    trim: true,
  },
  method: {
    type: String,
    trim: true,
    validate: {
      validator: function(value) {
        // Only validate if value is provided
        if (!value) return true;
        return ['online', 'in-person'].includes(value);
      },
      message: 'Method must be either online or in-person',
    },
  },
  experience: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Offer', offerSchema);
