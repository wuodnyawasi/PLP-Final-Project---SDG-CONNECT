const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['project', 'event'],
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  sdgs: [{
    type: String,
    trim: true,
  }],
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
  },
  country: {
    type: String,
    trim: true,
  },
  city: {
    type: String,
    trim: true,
  },
  exactLocation: {
    type: String,
    trim: true,
  },
  sponsors: {
    type: String,
    trim: true,
  },
  organizers: {
    type: String,
    trim: true,
  },
  briefInfo: {
    type: String,
    required: true,
    trim: true,
  },
  peopleRequired: {
    type: Number,
    min: 0,
  },
  slotsRemaining: {
    type: Number,
    min: 0,
    default: function() {
      return this.peopleRequired || 0;
    },
  },
  resourcesRequired: {
    type: String,
    trim: true,
  },
  otherInfo: {
    type: String,
    trim: true,
  },
  projectImage: {
    type: String, // URL or path to image
    trim: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  resources: [{
    offeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    resourceType: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    deliveryDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'delivered'],
      default: 'pending',
    },
    offeredAt: {
      type: Date,
      default: Date.now,
    },
  }],
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'cancelled', 'rejected'],
    default: 'pending',
  },
}, {
  timestamps: true,
});

// Virtual for all participants (from Contributor table)
projectSchema.virtual('participantsAttending', {
  ref: 'Contributor',
  localField: '_id',
  foreignField: 'project',
  match: { contributionType: 'participant' },
  options: {
    populate: {
      path: 'user',
      select: 'name email phone',
    },
  },
});

// Virtual for all resource providers (from Contributor table)
projectSchema.virtual('resourcesPromised', {
  ref: 'Contributor',
  localField: '_id',
  foreignField: 'project',
  match: { contributionType: 'resource_provider' },
  options: {
    populate: {
      path: 'user',
      select: 'name email phone',
    },
  },
});

// Include virtuals in JSON output
projectSchema.set('toJSON', { virtuals: true });
projectSchema.set('toObject', { virtuals: true });

// Index for efficient queries
projectSchema.index({ createdBy: 1, status: 1 });
projectSchema.index({ type: 1 });
projectSchema.index({ sdgs: 1 });

module.exports = mongoose.model('Project', projectSchema);
