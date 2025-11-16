const mongoose = require('mongoose');

const contributorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  contributionType: {
    type: String,
    required: true,
    enum: ['participant', 'resource_provider', 'donor'],
  },
  // For resource contributions
  resourceType: {
    type: String,
    trim: true,
  },
  quantity: {
    type: Number,
    min: 0,
  },
  deliveryDate: {
    type: Date,
  },
  // For donations
  donationCategory: {
    type: String,
    enum: ['food-perishables', 'clothing-bedding', 'home-furniture', 'money', 'skills-time', 'other'],
  },
  // Status tracking
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'delivered', 'completed', 'cancelled'],
    default: 'confirmed',
  },
  resourcesDelivered: {
    type: String,
    enum: ['Not delivered', 'delivered'],
    default: 'Not delivered',
  },
  attended: {
    type: String,
    default: 'pending',
  },
  notes: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

// Index for efficient queries
contributorSchema.index({ user: 1, project: 1 });
contributorSchema.index({ project: 1, contributionType: 1 });
contributorSchema.index({ user: 1, contributionType: 1 });

module.exports = mongoose.model('Contributor', contributorSchema);
