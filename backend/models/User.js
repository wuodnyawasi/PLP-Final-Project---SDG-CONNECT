const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  dateOfBirth: {
    type: Date,
  },
  organization: {
    type: String,
    trim: true,
  },
  educationLevel: {
    type: String,
    enum: ['High School', 'Associate Degree', 'Bachelor\'s Degree', 'Master\'s Degree', 'Doctorate', 'Other'],
    trim: true,
  },
  skills: [{
    type: String,
    trim: true,
  }],
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Non-binary', 'Prefer not to say', 'Other'],
    trim: true,
  },
  profilePicture: {
    type: String, // URL or path to image
    trim: true,
  },
  bio: {
    type: String,
    trim: true,
    maxlength: 500,
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
  isAdmin: {
    type: Boolean,
    default: false,
  },
  isDisabled: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
