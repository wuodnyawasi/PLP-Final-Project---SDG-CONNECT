const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  emailNotifications: {
    type: Boolean,
    default: true,
  },
  autoApproveOffers: {
    type: Boolean,
    default: false,
  },
  maintenanceMode: {
    type: Boolean,
    default: false,
  },
  smtpServer: {
    type: String,
    default: 'smtp.gmail.com',
  },
  adminEmail: {
    type: String,
    default: 'owadgijagor@gmail.com',
  },
  siteName: {
    type: String,
    default: 'SDG Connect',
  },
  contactEmail: {
    type: String,
    default: 'owadgijagor@gmail.com',
  },
  maxProjectsPerUser: {
    type: Number,
    default: 10,
  },
  allowUserRegistration: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Ensure only one settings document exists
settingsSchema.pre('save', async function(next) {
  if (this.isNew) {
    const existing = await this.constructor.findOne();
    if (existing) {
      throw new Error('Only one settings document can exist');
    }
  }
  next();
});

module.exports = mongoose.model('Settings', settingsSchema);
