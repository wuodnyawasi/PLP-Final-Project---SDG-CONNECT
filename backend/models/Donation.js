const mongoose = require('mongoose');

// Auto-increment counter schema
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

const Counter = mongoose.model('Counter', counterSchema);

const donationSchema = new mongoose.Schema({
  donationId: {
    type: Number,
    unique: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  name: {
    type: String,
    required: function() {
      return !this.anonymous;
    },
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 1,
  },
  anonymous: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending',
  },
  mpesaTransactionId: {
    type: String,
    trim: true,
  },
  transactionDate: {
    type: Date,
  },
  checkoutRequestId: {
    type: String,
    trim: true,
  },
  donationUsedFor: {
    type: String,
    trim: true,
    default: '',
  },
}, {
  timestamps: true,
});

// Pre-save middleware to auto-increment donationId
donationSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'donationId' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true },
      );
      this.donationId = counter.seq;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Index for efficient queries
donationSchema.index({ donationId: 1 });
donationSchema.index({ email: 1 });
donationSchema.index({ status: 1 });
donationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Donation', donationSchema);
