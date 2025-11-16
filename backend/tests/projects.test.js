const request = require('supertest');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const User = require('../models/User');
const Project = require('../models/Project');

// Create a test app without starting the server
const app = express();
app.use(cors());
app.use(express.json());

// Import middleware
const errorHandler = require('../middleware/errorHandler');
const { validateProjectCreation } = require('../middleware/validation');
const { sanitizeProjectInput } = require('../middleware/sanitization');

// Configure multer for file uploads (mock for testing)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Add routes directly to test app
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
      projectImage: req.file ? `/uploads/${req.file.filename}` : '',
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

// Error handling middleware
app.use(errorHandler);

describe('Project API', () => {
  let testUser;
  let authToken;

  beforeEach(async () => {
    // Create a test user
    testUser = await User.create({
      name: 'Project Creator',
      email: 'projectcreator@example.com',
      password: 'password123',
    });

    // Generate auth token
    authToken = jwt.sign(
      { userId: testUser._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' },
    );
  });

  describe('POST /api/projects', () => {
    it('should create a new project successfully', async () => {
      const projectData = {
        type: 'project',
        title: 'Clean Water Initiative',
        sdgs: ['6'],
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        country: 'Kenya',
        city: 'Nairobi',
        exactLocation: 'Westlands',
        sponsors: 'UNICEF',
        organizers: 'Local NGO',
        briefInfo: 'Providing clean water to rural communities',
        peopleRequired: '50',
        resourcesRequired: 'Water filters, pipes',
        otherInfo: 'Community training included',
      };

      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .field('type', projectData.type)
        .field('title', projectData.title)
        .field('sdgs', JSON.stringify(projectData.sdgs))
        .field('startDate', projectData.startDate)
        .field('endDate', projectData.endDate)
        .field('country', projectData.country)
        .field('city', projectData.city)
        .field('exactLocation', projectData.exactLocation)
        .field('sponsors', projectData.sponsors)
        .field('organizers', projectData.organizers)
        .field('briefInfo', projectData.briefInfo)
        .field('peopleRequired', projectData.peopleRequired)
        .field('resourcesRequired', projectData.resourcesRequired)
        .field('otherInfo', projectData.otherInfo)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'Project/Event created successfully');
      expect(response.body.project).toHaveProperty('title', projectData.title);
      expect(response.body.project).toHaveProperty('type', projectData.type);
      expect(response.body.project).toHaveProperty('country', projectData.country);
      expect(response.body.project).toHaveProperty('city', projectData.city);
      expect(response.body.project).toHaveProperty('status', 'pending');
    });

    it('should return error for missing required fields', async () => {
      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Test Project' }) // Missing required fields
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return error for unauthorized request', async () => {
      const response = await request(app)
        .post('/api/projects')
        .send({
          type: 'project',
          title: 'Test Project',
          country: 'Kenya',
          city: 'Nairobi',
          briefInfo: 'Test brief',
        })
        .expect(401);

      expect(response.body).toHaveProperty('error', 'No token provided');
    });

    it('should sanitize input data', async () => {
      const maliciousData = {
        type: 'project',
        title: '<script>alert("xss")</script>Clean Project',
        country: 'Kenya<script>alert("xss")</script>',
        city: 'Nairobi',
        briefInfo: 'Clean water project',
      };

      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .field('type', maliciousData.type)
        .field('title', maliciousData.title)
        .field('country', maliciousData.country)
        .field('city', maliciousData.city)
        .field('briefInfo', maliciousData.briefInfo)
        .expect(201);

      // Check that HTML/script tags were escaped
      expect(response.body.project.title).not.toContain('<script>');
      expect(response.body.project.country).not.toContain('<script>');
    });
  });
});
