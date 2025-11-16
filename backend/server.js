const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const axios = require('axios');
const User = require('./models/User');
const Offer = require('./models/Offer');
const Project = require('./models/Project');
const Contributor = require('./models/Contributor');
const Settings = require('./models/Settings');
const Donation = require('./models/Donation');
const errorHandler = require('./middleware/errorHandler');
const { validateRegistration, validateLogin, validateProjectCreation } = require('./middleware/validation');
const { apiLimiter, authLimiter, sensitiveLimiter } = require('./middleware/rateLimiter');
const { sanitizeUserInput, sanitizeProjectInput, sanitizeOfferInput, sanitizeDonationInput } = require('./middleware/sanitization');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(apiLimiter); // Apply general rate limiting to all routes

// Security middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Images only!'));
    }
  },
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sdg_connect', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Create transporter for sending emails
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;

  // Validate required fields
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'owadgijagor@gmail.com',
      subject: `Contact Form: ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// Register endpoint
app.post('/api/register', authLimiter, validateRegistration, async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create new user
    const user = new User({ name, email, password });
    await user.save();

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '7d' });

    res.status(201).json({ message: 'User registered successfully', token });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login endpoint
app.post('/api/login', authLimiter, validateLogin, async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check if user is disabled
    if (user.isDisabled) {
      return res.status(403).json({
        error: 'Account disabled',
        message: 'Your account has been disabled. Please contact us for assistance.',
        contactRequired: true,
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '7d' });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user profile endpoint
app.get('/api/profile', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      dateOfBirth: user.dateOfBirth,
      organization: user.organization || '',
      educationLevel: user.educationLevel || '',
      skills: user.skills || [],
      gender: user.gender || '',
      profilePicture: user.profilePicture || '',
      bio: user.bio || '',
      country: user.country || '',
      city: user.city || '',
      exactLocation: user.exactLocation || '',
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Update user profile endpoint
app.put('/api/profile', upload.single('profilePicture'), sanitizeUserInput, async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const {
    name, email, phone, gender, dateOfBirth, organization,
    skills, bio, country, city, exactLocation,
  } = req.body;

  // Validate required fields - for updates, keep existing values if not provided
  if (!name && !req.user?.name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  if (!email && !req.user?.email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if email is already taken by another user
    if (email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already in use' });
      }
    }

    // Handle profile picture upload
    let profilePicture = user.profilePicture;
    if (req.file) {
      profilePicture = `/uploads/${req.file.filename}`;
    }

    // Update user fields
    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.gender = gender || user.gender;
    user.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : user.dateOfBirth;
    user.organization = organization || user.organization;
    user.skills = Array.isArray(skills) ? skills : user.skills;
    user.profilePicture = profilePicture;
    user.bio = bio || user.bio;
    user.country = country || user.country;
    user.city = city || user.city;
    user.exactLocation = exactLocation || user.exactLocation;

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        organization: user.organization,
        skills: user.skills,
        profilePicture: user.profilePicture,
        bio: user.bio,
        country: user.country,
        city: user.city,
        exactLocation: user.exactLocation,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Profile update error:', error);
    if (error.message === 'Images only!') {
      return res.status(400).json({ error: 'Only image files are allowed' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// Middleware to verify admin status
const requireAdmin = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId);

    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Temporary bootstrap endpoint to set first admin (remove after use)
app.post('/api/admin/bootstrap/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndUpdate(userId, { isAdmin: true }, { new: true });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User set as admin', user });
  } catch (error) {
    console.error('Bootstrap error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Submit offer endpoint
app.post('/api/offer', sanitizeOfferInput, async (req, res) => {
  const {
    category,
    donorName,
    contact,
    isAnonymous,
    itemType,
    quantity,
    description,
    logistics,
    pickupLocation,
    contactPerson,
    skill,
    timeCommitment,
    method,
    experience,
    projectId, // Optional: link donation to a specific project
  } = req.body;

  // Validate required fields
  if (!category || !contact) {
    return res.status(400).json({ error: 'Category and contact are required' });
  }

  try {
    // Get user ID if authenticated
    let userId = null;
    if (projectId) {
      const token = req.headers.authorization?.split(' ')[1];
      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
          userId = decoded.userId;
        } catch (error) {
          // Token invalid, proceed without user ID
        }
      }
    }

    // Create new offer
    const offerData = {
      user: userId,
      category,
      donorName: isAnonymous ? null : donorName,
      contact,
      isAnonymous: isAnonymous || false,
    };

    // Add category-specific fields
    if (itemType) offerData.itemType = itemType;
    if (quantity) offerData.quantity = quantity;
    if (description) offerData.description = description;
    if (logistics) offerData.logistics = logistics;
    if (pickupLocation) offerData.pickupLocation = pickupLocation;
    if (contactPerson) offerData.contactPerson = contactPerson;
    if (skill) offerData.skill = skill;
    if (timeCommitment) offerData.timeCommitment = timeCommitment;
    if (method) offerData.method = method;
    if (experience) offerData.experience = experience;

    const offer = new Offer(offerData);
    await offer.save();

    // If projectId is provided and user is authenticated, create contributor record
    if (projectId) {
      const token = req.headers.authorization?.split(' ')[1];
      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
          const contributor = new Contributor({
            user: decoded.userId,
            project: projectId,
            contributionType: 'donor',
            donationCategory: category,
            quantity: quantity ? parseInt(quantity) : null,
            notes: description || `${category} donation`,
          });
          await contributor.save();
        } catch (error) {
          console.error('Error creating contributor record for donation:', error);
          // Don't fail the donation if contributor record creation fails
        }
      }
    }

    res.status(201).json({ message: 'Offer submitted successfully', offer });
  } catch (error) {
    console.error('Offer submission error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin Stats endpoint
app.get('/api/admin/stats', requireAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalOffers = await Offer.countDocuments();
    const pendingOffers = await Offer.countDocuments({ status: 'pending' });
    const totalProjects = await Project.countDocuments();
    const pendingProjects = await Project.countDocuments({ status: 'pending' });
    const totalDonations = await Donation.countDocuments();
    const totalDonatedResult = await Donation.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalDonated = totalDonatedResult.length > 0 ? totalDonatedResult[0].total : 0;

    res.json({
      totalUsers,
      totalOffers,
      pendingOffers,
      totalProjects,
      pendingProjects,
      totalDonations,
      totalDonated,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin Users endpoints
app.get('/api/admin/users', requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      };
    }

    const users = await User.find(query)
      .select('name email isAdmin isDisabled createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      users,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Admin users fetch error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/admin/users/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { isAdmin, isDisabled } = req.body;

  try {
    const updateData = {};
    if (isAdmin !== undefined) updateData.isAdmin = Boolean(isAdmin);
    if (isDisabled !== undefined) updateData.isDisabled = Boolean(isDisabled);

    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true },
    ).select('name email isAdmin isDisabled');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    console.error('Admin user update error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/admin/users/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent deletion of admin users
    if (user.isAdmin) {
      return res.status(400).json({ error: 'Cannot delete admin users' });
    }

    // Delete associated contributors
    await Contributor.deleteMany({ user: id });

    // Delete associated projects (optional - you might want to reassign ownership instead)
    // For now, we'll delete projects created by this user
    await Project.deleteMany({ createdBy: id });

    // Finally delete the user
    await User.findByIdAndDelete(id);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Admin user delete error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin Settings endpoints
app.get('/api/admin/settings', requireAdmin, async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      // Create default settings if none exist
      settings = new Settings();
      await settings.save();
    }
    res.json(settings);
  } catch (error) {
    console.error('Admin settings fetch error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/admin/settings', requireAdmin, async (req, res) => {
  try {
    const {
      emailNotifications,
      autoApproveOffers,
      maintenanceMode,
      smtpServer,
      adminEmail,
      siteName,
      contactEmail,
      maxProjectsPerUser,
      allowUserRegistration,
    } = req.body;

    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    // Update settings
    if (emailNotifications !== undefined) settings.emailNotifications = emailNotifications;
    if (autoApproveOffers !== undefined) settings.autoApproveOffers = autoApproveOffers;
    if (maintenanceMode !== undefined) settings.maintenanceMode = maintenanceMode;
    if (smtpServer !== undefined) settings.smtpServer = smtpServer;
    if (adminEmail !== undefined) settings.adminEmail = adminEmail;
    if (siteName !== undefined) settings.siteName = siteName;
    if (contactEmail !== undefined) settings.contactEmail = contactEmail;
    if (maxProjectsPerUser !== undefined) settings.maxProjectsPerUser = maxProjectsPerUser;
    if (allowUserRegistration !== undefined) settings.allowUserRegistration = allowUserRegistration;

    await settings.save();
    res.json({ message: 'Settings updated successfully', settings });
  } catch (error) {
    console.error('Admin settings update error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin Offers endpoints
app.get('/api/admin/offers', requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, category } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (status) query.status = status;
    if (category) query.category = category;

    const offers = await Offer.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Offer.countDocuments(query);

    res.json({
      offers,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Admin offers fetch error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/admin/offers/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['pending', 'approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    const offer = await Offer.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    );

    if (!offer) {
      return res.status(404).json({ error: 'Offer not found' });
    }

    res.json({ message: 'Offer updated successfully', offer });
  } catch (error) {
    console.error('Admin offer update error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/admin/donations/:id/status', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['pending', 'completed', 'failed'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    const donation = await Donation.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    );

    if (!donation) {
      return res.status(404).json({ error: 'Donation not found' });
    }

    res.json({ message: 'Donation status updated successfully', donation });
  } catch (error) {
    console.error('Admin donation status update error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/admin/donations/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const donation = await Donation.findByIdAndDelete(id);

    if (!donation) {
      return res.status(404).json({ error: 'Donation not found' });
    }

    res.json({ message: 'Donation deleted successfully' });
  } catch (error) {
    console.error('Admin donation delete error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/admin/offers/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const offer = await Offer.findByIdAndDelete(id);

    if (!offer) {
      return res.status(404).json({ error: 'Offer not found' });
    }

    res.json({ message: 'Offer deleted successfully' });
  } catch (error) {
    console.error('Admin offer delete error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin Projects endpoints
app.get('/api/admin/projects', requireAdmin, async (req, res) => {
  try {
    const { status } = req.query;

    let query = {};
    if (status) query.status = status;

    const projects = await Project.find(query)
      .populate('createdBy', 'name email phone')
      .sort({ createdAt: -1 });

    const total = await Project.countDocuments(query);

    res.json({
      projects: projects.map(project => ({
        id: project._id,
        type: project.type,
        title: project.title,
        sdgs: project.sdgs,
        startDate: project.startDate,
        endDate: project.endDate,
        country: project.country,
        city: project.city,
        exactLocation: project.exactLocation,
        sponsors: project.sponsors,
        organizers: project.organizers,
        briefInfo: project.briefInfo,
        peopleRequired: project.peopleRequired,
        slotsRemaining: project.slotsRemaining,
        resourcesRequired: project.resourcesRequired,
        otherInfo: project.otherInfo,
        projectImage: project.projectImage,
        status: project.status,
        createdAt: project.createdAt,
        createdBy: project.createdBy ? {
          id: project.createdBy._id,
          name: project.createdBy.name,
          email: project.createdBy.email,
          phone: project.createdBy.phone,
        } : null,
      })),
      total,
    });
  } catch (error) {
    console.error('Admin projects fetch error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/admin/projects/:id/status', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['pending', 'active', 'completed', 'cancelled', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    const project = await Project.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    ).populate('createdBy', 'name email');

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({
      message: 'Project status updated successfully',
      project: {
        id: project._id,
        title: project.title,
        status: project.status,
        createdBy: {
          name: project.createdBy.name,
          email: project.createdBy.email,
        },
      },
    });
  } catch (error) {
    console.error('Admin project status update error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/admin/projects/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const project = await Project.findByIdAndDelete(id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Admin project delete error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Submit project/event endpoint
app.post('/api/projects', upload.single('projectImage'), sanitizeProjectInput, validateProjectCreation, async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const {
    type,
    title,
    sdgs,
    startDate,
    endDate,
    country,
    city,
    exactLocation,
    sponsors,
    organizers,
    briefInfo,
    peopleRequired,
    resourcesRequired,
    otherInfo,
  } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Handle project image upload
    let projectImage = '';
    if (req.file) {
      projectImage = `/uploads/${req.file.filename}`;
    }

    // Create new project
    const project = new Project({
      type,
      title,
      sdgs: Array.isArray(sdgs) ? sdgs : JSON.parse(sdgs || '[]'),
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      country,
      city,
      exactLocation,
      sponsors,
      organizers,
      briefInfo,
      peopleRequired: peopleRequired ? parseInt(peopleRequired) : null,
      resourcesRequired,
      otherInfo,
      projectImage,
      createdBy: user._id,
    });

    await project.save();

    res.status(201).json({
      message: 'Project/Event created successfully',
      project: {
        id: project._id,
        type: project.type,
        title: project.title,
        sdgs: project.sdgs,
        startDate: project.startDate,
        endDate: project.endDate,
        country: project.country,
        city: project.city,
        exactLocation: project.exactLocation,
        sponsors: project.sponsors,
        organizers: project.organizers,
        briefInfo: project.briefInfo,
        peopleRequired: project.peopleRequired,
        slotsRemaining: project.slotsRemaining,
        resourcesRequired: project.resourcesRequired,
        otherInfo: project.otherInfo,
        projectImage: project.projectImage,
        status: project.status,
        createdAt: project.createdAt,
      },
    });
  } catch (error) {
    console.error('Project creation error:', error);
    if (error.message === 'Images only!') {
      return res.status(400).json({ error: 'Only image files are allowed' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user projects endpoint
app.get('/api/projects', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const projects = await Project.find({ createdBy: user._id })
      .populate('createdBy', 'name organization')
      .populate('participantsAttending')
      .populate('resourcesPromised')
      .sort({ createdAt: -1 });

    res.json({
      projects: projects.map(project => ({
        id: project._id,
        type: project.type,
        title: project.title,
        sdgs: project.sdgs,
        startDate: project.startDate,
        endDate: project.endDate,
        country: project.country,
        city: project.city,
        exactLocation: project.exactLocation,
        sponsors: project.sponsors,
        organizers: project.organizers,
        briefInfo: project.briefInfo,
        peopleRequired: project.peopleRequired,
        slotsRemaining: project.slotsRemaining,
        resourcesRequired: project.resourcesRequired,
        otherInfo: project.otherInfo,
        projectImage: project.projectImage,
        status: project.status,
        createdAt: project.createdAt,
        participantsAttending: project.participantsAttending?.map(participant => ({
          id: participant._id,
          user: {
            id: participant.user._id,
            name: participant.user.name,
            email: participant.user.email,
            phone: participant.user.phone,
          },
          joinedAt: participant.createdAt,
        })) || [],
        resourcesPromised: project.resourcesPromised?.map(resource => ({
          id: resource._id,
          user: {
            id: resource.user._id,
            name: resource.user.name,
            email: resource.user.email,
            phone: resource.user.phone,
          },
          resourceType: resource.resourceType,
          quantity: resource.quantity,
          deliveryDate: resource.deliveryDate,
          status: resource.status,
          resourcesDelivered: resource.resourcesDelivered,
          notes: resource.notes,
        })) || [],
      })),
    });
  } catch (error) {
    console.error('Projects fetch error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all projects for public view (Projects page)
app.get('/api/projects/public', async (req, res) => {
  try {
    const { page = 1, limit = 10, type, sdg } = req.query;
    const skip = (page - 1) * limit;

    // Check if user is authenticated
    const token = req.headers.authorization?.split(' ')[1];
    let user = null;
    let isAdmin = false;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        user = await User.findById(decoded.userId);
        isAdmin = user?.isAdmin || false;
      } catch (error) {
        // Invalid token, treat as unauthenticated
      }
    }

    let query = {};
    if (type) query.type = type;
    if (sdg) query.sdgs = { $in: [sdg] };

    if (isAdmin) {
      // Admin sees all projects
      // No additional filter
    } else if (user) {
      // Authenticated user sees active projects + their own pending/completed projects
      query.$or = [
        { status: 'active' },
        { createdBy: user._id, status: { $in: ['pending', 'completed'] } },
      ];
    } else {
      // Unauthenticated users see only active projects
      query.status = 'active';
    }

    const projects = await Project.find(query)
      .populate('createdBy', 'name organization')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Project.countDocuments(query);

    res.json({
      projects: projects.map(project => ({
        id: project._id,
        type: project.type,
        title: project.title,
        sdgs: project.sdgs,
        startDate: project.startDate,
        endDate: project.endDate,
        country: project.country,
        city: project.city,
        exactLocation: project.exactLocation,
        sponsors: project.sponsors,
        organizers: project.organizers,
        briefInfo: project.briefInfo,
        peopleRequired: project.peopleRequired,
        slotsRemaining: project.slotsRemaining,
        resourcesRequired: project.resourcesRequired,
        otherInfo: project.otherInfo,
        projectImage: project.projectImage,
        status: project.status,
        createdAt: project.createdAt,
        createdBy: {
          id: project.createdBy._id,
          name: project.createdBy.name,
          organization: project.createdBy.organization,
        },
        // participantsAttending and resourcesPromised are not included in public view
      })),
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Public projects fetch error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update project status endpoint
app.put('/api/projects/:id/status', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const { id } = req.params;
  const { status } = req.body;

  if (!['active', 'completed', 'cancelled'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Allow admin to update any project, or creator to update their own project
    let query = { _id: id };
    if (!user.isAdmin) {
      query.createdBy = decoded.userId;
    }

    const project = await Project.findOneAndUpdate(query, { status }, { new: true });

    if (!project) {
      return res.status(404).json({ error: 'Project not found or access denied' });
    }

    res.json({
      message: 'Project status updated successfully',
      project: {
        id: project._id,
        status: project.status,
      },
    });
  } catch (error) {
    console.error('Project status update error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Join project endpoint
app.post('/api/projects/:id/join', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const { id } = req.params;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user is already a participant
    const isParticipant = project.participants.some(p => p.user.toString() === decoded.userId);
    if (isParticipant) {
      return res.status(400).json({ error: 'Already joined this project' });
    }

    // Check if user is the creator
    if (project.createdBy.toString() === decoded.userId) {
      return res.status(400).json({ error: 'Cannot join your own project' });
    }

    // Check if slots are available
    if (project.slotsRemaining <= 0) {
      return res.status(400).json({ error: 'No slots available' });
    }

    // Add participant
    project.participants.push({
      user: decoded.userId,
      joinedAt: new Date(),
    });

    // Decrease slots remaining
    project.slotsRemaining -= 1;

    await project.save();

    // Create contributor record
    const contributor = new Contributor({
      user: decoded.userId,
      project: id,
      contributionType: 'participant',
    });
    await contributor.save();

    res.json({
      message: 'Successfully joined the project',
      project: {
        id: project._id,
        participantsCount: project.participants.length,
        slotsRemaining: project.slotsRemaining,
      },
    });
  } catch (error) {
    console.error('Join project error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Offer resources endpoint
app.post('/api/projects/:id/resources', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const { id } = req.params;
  const { resourceType, quantity, deliveryDate } = req.body;

  if (!resourceType || !quantity || !deliveryDate) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Add resource offer
    project.resources.push({
      offeredBy: decoded.userId,
      resourceType,
      quantity: parseInt(quantity),
      deliveryDate: new Date(deliveryDate),
      status: 'pending',
      offeredAt: new Date(),
    });

    await project.save();

    // Create contributor record
    const contributor = new Contributor({
      user: decoded.userId,
      project: id,
      contributionType: 'resource_provider',
      resourceType,
      quantity: parseInt(quantity),
      deliveryDate: new Date(deliveryDate),
    });
    await contributor.save();

    res.json({
      message: 'Resource offer submitted successfully',
      resource: {
        id: project.resources[project.resources.length - 1]._id,
        resourceType,
        quantity,
        deliveryDate,
        status: 'pending',
      },
    });
  } catch (error) {
    console.error('Offer resources error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get contributors endpoint (for admin or project creators)
app.get('/api/contributors', requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, projectId, userId, contributionType } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (projectId) query.project = projectId;
    if (userId) query.user = userId;
    if (contributionType) query.contributionType = contributionType;

    const contributors = await Contributor.find(query)
      .populate('user', 'name email')
      .populate('project', 'title type')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Contributor.countDocuments(query);

    res.json({
      contributors: contributors.map(contributor => ({
        id: contributor._id,
        user: contributor.user
          ? {
            id: contributor.user._id,
            name: contributor.user.name,
            email: contributor.user.email,
          }
          : null,
        project: contributor.project
          ? {
            id: contributor.project._id,
            title: contributor.project.title,
            type: contributor.project.type,
          }
          : null,
        contributionType: contributor.contributionType,
        resourceType: contributor.resourceType,
        quantity: contributor.quantity,
        deliveryDate: contributor.deliveryDate,
        donationCategory: contributor.donationCategory,
        status: contributor.status,
        notes: contributor.notes,
        createdAt: contributor.createdAt,
      })),
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Contributors fetch error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user contributions endpoint
app.get('/api/contributions', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const contributors = await Contributor.find({ user: decoded.userId })
      .populate('project', 'title type startDate endDate status')
      .sort({ createdAt: -1 });

    res.json({
      contributions: contributors.map(contributor => ({
        id: contributor._id,
        project: {
          id: contributor.project._id,
          title: contributor.project.title,
          type: contributor.project.type,
          startDate: contributor.project.startDate,
          endDate: contributor.project.endDate,
          status: contributor.project.status,
        },
        contributionType: contributor.contributionType,
        resourceType: contributor.resourceType,
        quantity: contributor.quantity,
        deliveryDate: contributor.deliveryDate,
        donationCategory: contributor.donationCategory,
        status: contributor.status,
        notes: contributor.notes,
        createdAt: contributor.createdAt,
      })),
    });
  } catch (error) {
    console.error('Contributions fetch error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark contributor as attended endpoint
app.put('/api/contributors/:id/attend', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const { id } = req.params;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    // Find the contributor and ensure the user owns the project
    const contributor = await Contributor.findById(id).populate('project');
    if (!contributor) {
      return res.status(404).json({ error: 'Contributor not found' });
    }

    if (contributor.project.createdBy.toString() !== decoded.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (contributor.contributionType !== 'participant') {
      return res.status(400).json({ error: 'Can only mark participants as attended' });
    }

    contributor.attended = 'yes';
    await contributor.save();

    res.json({ message: 'Participant marked as attended', contributor });
  } catch (error) {
    console.error('Mark attended error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark contributor resource as delivered endpoint
app.put('/api/contributors/:id/deliver', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const { id } = req.params;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    // Find the contributor and ensure the user owns the project
    const contributor = await Contributor.findById(id).populate('project');
    if (!contributor) {
      return res.status(404).json({ error: 'Contributor not found' });
    }

    if (contributor.project.createdBy.toString() !== decoded.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (contributor.contributionType !== 'resource_provider') {
      return res.status(400).json({ error: 'Can only mark resource providers as delivered' });
    }

    contributor.status = 'delivered';
    contributor.resourcesDelivered = 'delivered';
    await contributor.save();

    res.json({ message: 'Resource marked as delivered', contributor });
  } catch (error) {
    console.error('Mark delivered error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin Contributor Management Endpoints
app.put('/api/admin/contributors/:id/status', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['pending', 'confirmed', 'delivered', 'completed', 'cancelled'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    const contributor = await Contributor.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    ).populate('user', 'name email').populate('project', 'title type');

    if (!contributor) {
      return res.status(404).json({ error: 'Contributor not found' });
    }

    res.json({ message: 'Contributor status updated successfully', contributor });
  } catch (error) {
    console.error('Admin contributor status update error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/admin/contributors/:id/attend', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { attended } = req.body;

  if (!['pending', 'yes', 'no'].includes(attended)) {
    return res.status(400).json({ error: 'Invalid attended status' });
  }

  try {
    const contributor = await Contributor.findById(id);
    if (!contributor) {
      return res.status(404).json({ error: 'Contributor not found' });
    }

    if (contributor.contributionType !== 'participant') {
      return res.status(400).json({ error: 'Can only mark participants as attended' });
    }

    contributor.attended = attended;
    await contributor.save();

    res.json({ message: 'Attendance status updated successfully', contributor });
  } catch (error) {
    console.error('Admin contributor attend update error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/admin/contributors/:id/deliver', requireAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const contributor = await Contributor.findById(id);
    if (!contributor) {
      return res.status(404).json({ error: 'Contributor not found' });
    }

    if (contributor.contributionType !== 'resource_provider') {
      return res.status(400).json({ error: 'Can only mark resource providers as delivered' });
    }

    contributor.status = 'delivered';
    contributor.resourcesDelivered = 'delivered';
    await contributor.save();

    res.json({ message: 'Resource marked as delivered', contributor });
  } catch (error) {
    console.error('Admin contributor deliver update error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/admin/contributors/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const contributor = await Contributor.findByIdAndDelete(id);

    if (!contributor) {
      return res.status(404).json({ error: 'Contributor not found' });
    }

    res.json({ message: 'Contributor deleted successfully' });
  } catch (error) {
    console.error('Admin contributor delete error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin Donations endpoints
app.get('/api/admin/donations', requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (status) query.status = status;

    const donations = await Donation.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Donation.countDocuments(query);

    res.json({
      donations,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Admin donations fetch error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Public donation stats endpoint
app.get('/api/donations/stats', async (req, res) => {
  try {
    // Calculate total donated (sum of completed donations)
    const totalDonatedResult = await Donation.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalDonated = totalDonatedResult.length > 0 ? totalDonatedResult[0].total : 0;

    // Calculate donors count (unique non-anonymous donors with completed donations)
    const donorsCount = await Donation.distinct('email', {
      status: 'completed',
      anonymous: false,
    }).then(emails => emails.length);

    // Calculate highest and lowest donation amounts
    const donationAmounts = await Donation.find({ status: 'completed' }, 'amount');
    let highestDonation = 0;
    let lowestDonation = 0;

    if (donationAmounts.length > 0) {
      const amounts = donationAmounts.map(d => d.amount);
      highestDonation = Math.max(...amounts);
      lowestDonation = Math.min(...amounts);
    }

    res.json({
      totalDonated,
      donorsCount,
      highestDonation,
      lowestDonation,
    });
  } catch (error) {
    console.error('Donation stats fetch error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Recent donations endpoint
app.get('/api/donations/recent', async (req, res) => {
  try {
    // Fetch the 4 most recent completed donations, sorted by updatedAt descending (most recent first)
    const recentDonations = await Donation.find({ status: 'completed' })
      .sort({ updatedAt: -1 })
      .limit(4);

    // Log the donationIds for verification
    console.log('Recent donations - most recent completed:', recentDonations.map(d => ({ id: d.donationId, name: d.name, amount: d.amount, updatedAt: d.updatedAt })));

    // Format the data for frontend
    const formattedDonations = recentDonations.map(donation => {
      // Calculate relative time
      const now = new Date();
      const donationDate = new Date(donation.createdAt);
      const diffTime = Math.abs(now - donationDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let relativeTime;
      if (diffDays === 1) {
        relativeTime = '1 day ago';
      } else if (diffDays < 7) {
        relativeTime = `${diffDays} days ago`;
      } else if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        relativeTime = `${weeks} week${weeks > 1 ? 's' : ''} ago`;
      } else {
        const months = Math.floor(diffDays / 30);
        relativeTime = `${months} month${months > 1 ? 's' : ''} ago`;
      }

      return {
        donorName: donation.anonymous ? 'Anonymous Donor' : (donation.name || 'Anonymous Donor'),
        amount: `Ksh ${donation.amount.toLocaleString()}`,
        purpose: 'Donation to SDGConnect',
        date: relativeTime,
      };
    });

    res.json(formattedDonations);
  } catch (error) {
    console.error('Recent donations fetch error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single project with contributors (for project owners)
app.get('/api/projects/:id', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const { id } = req.params;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const project = await Project.findById(id)
      .populate('createdBy', 'name organization')
      .populate({
        path: 'participantsAttending',
        populate: {
          path: 'user',
          select: 'name email phone',
        },
      })
      .populate({
        path: 'resourcesPromised',
        populate: {
          path: 'user',
          select: 'name email phone',
        },
      });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user is the owner or admin
    const user = await User.findById(decoded.userId);
    if (project.createdBy._id.toString() !== decoded.userId && !user.isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      project: {
        id: project._id,
        type: project.type,
        title: project.title,
        sdgs: project.sdgs,
        startDate: project.startDate,
        endDate: project.endDate,
        country: project.country,
        city: project.city,
        exactLocation: project.exactLocation,
        sponsors: project.sponsors,
        organizers: project.organizers,
        briefInfo: project.briefInfo,
        peopleRequired: project.peopleRequired,
        slotsRemaining: project.slotsRemaining,
        resourcesRequired: project.resourcesRequired,
        otherInfo: project.otherInfo,
        projectImage: project.projectImage,
        status: project.status,
        createdAt: project.createdAt,
        createdBy: {
          id: project.createdBy._id,
          name: project.createdBy.name,
          organization: project.createdBy.organization,
        },
        participantsAttending: project.participantsAttending?.map(participant => ({
          _id: participant._id,
          user: {
            id: participant.user._id,
            name: participant.user.name,
            email: participant.user.email,
            phone: participant.user.phone,
          },
          attended: participant.attended,
          joinedAt: participant.createdAt,
        })) || [],
        resourcesPromised: project.resourcesPromised?.map(resource => ({
          _id: resource._id,
          user: {
            id: resource.user._id,
            name: resource.user.name,
            email: resource.user.email,
            phone: resource.user.phone,
          },
          resourceType: resource.resourceType,
          quantity: resource.quantity,
          deliveryDate: resource.deliveryDate,
          status: resource.status,
          resourcesDelivered: resource.resourcesDelivered,
          notes: resource.notes,
          offeredAt: resource.createdAt,
        })) || [],
      },
    });
  } catch (error) {
    console.error('Project fetch error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// M-Pesa access token generation
async function getMpesaAccessToken() {
  const auth = Buffer.from(`${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`).toString('base64');

  try {
    const response = await axios.get(
      process.env.MPESA_ENVIRONMENT === 'production'
        ? 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
        : 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      },
    );
    return response.data.access_token;
  } catch (error) {
    console.error('Error getting M-Pesa access token:', error);
    throw new Error('Failed to get M-Pesa access token');
  }
}

// M-Pesa STK Push initiation
app.post('/api/donations/initiate-stk-push', sensitiveLimiter, sanitizeDonationInput, async (req, res) => {
  const { amount, name, email, phone, anonymous } = req.body;

  // Validate required fields
  if (!amount || !email || !phone) {
    return res.status(400).json({ error: 'Amount, email, and phone are required' });
  }

  // Name is required only if not anonymous
  if (!anonymous && !name) {
    return res.status(400).json({ error: 'Name is required for non-anonymous donations' });
  }

  // Validate phone number format (Kenyan numbers)
  const phoneRegex = /^254[0-9]{9}$/;
  if (!phoneRegex.test(phone)) {
    return res.status(400).json({ error: 'Please enter a valid Kenyan phone number (254XXXXXXXXX)' });
  }

  // Check if M-Pesa environment variables are configured
  if (!process.env.MPESA_CONSUMER_KEY || !process.env.MPESA_CONSUMER_SECRET ||
      !process.env.MPESA_BUSINESS_SHORTCODE || !process.env.MPESA_PASSKEY) {
    console.error('M-Pesa environment variables not configured');
    return res.status(500).json({ error: 'Payment service not configured. Please contact administrator.' });
  }

  try {
    const accessToken = await getMpesaAccessToken();

    // Generate timestamp
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);

    // Generate password
    const password = Buffer.from(
      `${process.env.MPESA_BUSINESS_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`,
    ).toString('base64');

    // Prepare STK Push request
    const stkPushData = {
      BusinessShortCode: process.env.MPESA_BUSINESS_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.round(parseFloat(amount)), // Amount in KES
      PartyA: phone, // Customer phone number
      PartyB: process.env.MPESA_BUSINESS_SHORTCODE, // Business shortcode
      PhoneNumber: phone, // Customer phone number
      CallBackURL: `${process.env.BACKEND_URL}/api/donations/mpesa-callback`,
      AccountReference: 'SDGConnect Donation',
      TransactionDesc: anonymous ? 'Anonymous donation to SDGConnect Foundation' : `Donation from ${name}`,
    };

    const response = await axios.post(
      process.env.MPESA_ENVIRONMENT === 'production'
        ? 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
        : 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      stkPushData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );

    // Get user ID if authenticated
    let userId = null;
    const authToken = req.headers.authorization?.split(' ')[1];
    if (authToken) {
      try {
        const decoded = jwt.verify(authToken, process.env.JWT_SECRET || 'your-secret-key');
        userId = decoded.userId;
      } catch (error) {
        // Token invalid, proceed without user ID
      }
    }

    // Create a pending donation record in the database
    const pendingDonation = new Donation({
      user: userId,
      name: anonymous ? null : name,
      email,
      phone,
      amount: parseFloat(amount),
      anonymous: anonymous || false,
      status: 'pending',
      checkoutRequestId: response.data.CheckoutRequestID,
      transactionDate: new Date(),
    });

    await pendingDonation.save();

    console.log('Pending donation created:', {
      id: pendingDonation._id,
      checkoutRequestId: response.data.CheckoutRequestID,
      amount: amount,
      email: email,
    });

    res.json({
      checkoutRequestId: response.data.CheckoutRequestID,
      responseCode: response.data.ResponseCode,
      responseDescription: response.data.ResponseDescription,
      customerMessage: response.data.CustomerMessage,
    });
  } catch (error) {
    console.error('M-Pesa STK Push error:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to initiate payment',
      details: error.response?.data?.errorMessage || error.message,
    });
  }
});

// M-Pesa callback endpoint to handle payment confirmations
app.post('/api/donations/mpesa-callback', async (req, res) => {
  try {
    const callbackData = req.body;

    console.log('M-Pesa Callback received:', JSON.stringify(callbackData, null, 2));

    // Check if the callback contains successful payment data
    if (callbackData.Body && callbackData.Body.stkCallback) {
      const stkCallback = callbackData.Body.stkCallback;
      const checkoutRequestId = stkCallback.CheckoutRequestID;

      console.log('Processing callback for CheckoutRequestID:', checkoutRequestId);

      if (stkCallback.ResultCode === 0) {
        // Payment successful
        console.log('Payment successful for CheckoutRequestID:', checkoutRequestId);

        // Find the pending donation record
        const pendingDonation = await Donation.findOne({
          checkoutRequestId: checkoutRequestId,
          status: 'pending',
        });

        if (pendingDonation) {
          // Extract transaction details
          const callbackMetadata = stkCallback.CallbackMetadata.Item;
          const transactionId = callbackMetadata.find(item => item.Name === 'MpesaReceiptNumber')?.Value;
          const transactionDate = callbackMetadata.find(item => item.Name === 'TransactionDate')?.Value;
          const phoneNumber = callbackMetadata.find(item => item.Name === 'PhoneNumber')?.Value;

          console.log('Transaction details:', {
            transactionId,
            transactionDate,
            phoneNumber,
          });

          // Update the donation record with transaction details
          pendingDonation.status = 'completed';
          pendingDonation.mpesaTransactionId = transactionId;
          pendingDonation.transactionDate = new Date(transactionDate);

          await pendingDonation.save();

          console.log('Donation record updated successfully:', {
            id: pendingDonation._id,
            name: pendingDonation.name,
            email: pendingDonation.email,
            amount: pendingDonation.amount,
            transactionId: transactionId,
          });

          // Send confirmation email
          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: pendingDonation.email,
            subject: 'Thank you for your donation to SDGConnect!',
            html: `
              <h2>Thank you for your generous donation!</h2>
              <p>Dear ${pendingDonation.name || 'Valued Donor'},</p>
              <p>We have successfully received your donation of Ksh ${pendingDonation.amount} to SDGConnect Foundation.</p>
              <p><strong>Transaction Details:</strong></p>
              <ul>
                <li>Amount: Ksh ${pendingDonation.amount}</li>
                <li>Transaction ID: ${transactionId}</li>
                <li>Phone Number: ${phoneNumber}</li>
                <li>Date: ${new Date(transactionDate).toLocaleString()}</li>
              </ul>
              <p>Your support helps us achieve our sustainable development goals and make a positive impact in our communities.</p>
              <p>If you have any questions, please don't hesitate to contact us.</p>
              <br>
              <p>Best regards,<br>SDGConnect Foundation Team</p>
            `,
          };

          try {
            await transporter.sendMail(mailOptions);
            console.log('Confirmation email sent to:', pendingDonation.email);
          } catch (emailError) {
            console.error('Error sending confirmation email:', emailError);
          }

        } else {
          console.error('Pending donation not found for CheckoutRequestID:', checkoutRequestId);
        }
      } else {
        // Payment failed - update donation status to failed
        console.log('Payment failed for CheckoutRequestID:', checkoutRequestId, 'ResultDesc:', stkCallback.ResultDesc);

        const failedDonation = await Donation.findOneAndUpdate(
          { checkoutRequestId: checkoutRequestId, status: 'pending' },
          { status: 'failed' },
          { new: true },
        );

        if (failedDonation) {
          console.log('Donation marked as failed:', failedDonation._id);
        }
      }
    } else {
      console.log('Invalid callback data structure');
    }

    // Always respond with success to acknowledge receipt
    res.json({ received: true });
  } catch (error) {
    console.error('Error processing M-Pesa callback:', error);
    // Still respond with success to avoid retries
    res.json({ received: true });
  }
});

// Get user impact dashboard data
app.get('/api/user/impact', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const userId = decoded.userId;

    // Get user to access email for donation counting
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get completed projects count
    const completedProjects = await Project.countDocuments({
      createdBy: userId,
      status: 'completed',
    });

    // Get completed donations count (by email to include donations made when not logged in)
    const completedDonations = await Donation.countDocuments({
      email: user.email,
      status: 'completed',
    });

    // Get approved offers count
    const approvedOffers = await Offer.countDocuments({
      user: userId,
      status: 'approved',
    });

    // Get attended contributions count
    const attendedContributions = await Contributor.countDocuments({
      user: userId,
      attended: 'yes',
    });

    res.json({
      completedProjects,
      completedDonations,
      approvedOffers,
      attendedContributions,
    });
  } catch (error) {
    console.error('Impact dashboard fetch error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Start server only after MongoDB connection
mongoose.connection.once('open', () => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
