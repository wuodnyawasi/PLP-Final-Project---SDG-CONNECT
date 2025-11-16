const request = require('supertest');
const express = require('express');
const cors = require('cors');
const User = require('../models/User');

// Create a test app without starting the server
const app = express();
app.use(cors());
app.use(express.json());

// Import middleware
const errorHandler = require('../middleware/errorHandler');
const { validateRegistration, validateLogin } = require('../middleware/validation');

// Add routes directly to test app
app.post('/api/register', validateRegistration, async (req, res) => {
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
    const token = require('jsonwebtoken').sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' },
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/login', validateLogin, async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = require('jsonwebtoken').sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' },
    );

    res.json({
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Error handling middleware
app.use(errorHandler);

describe('Authentication API', () => {
  describe('POST /api/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      const response = await request(app)
        .post('/api/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'User registered successfully');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('name', userData.name);
      expect(response.body.user).toHaveProperty('email', userData.email);
    });

    it('should return error for missing required fields', async () => {
      const response = await request(app)
        .post('/api/register')
        .send({ name: 'Test User' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation failed');
    });

    it('should return error for duplicate email', async () => {
      // First create a user
      await User.create({
        name: 'Existing User',
        email: 'existing@example.com',
        password: 'password123',
      });

      // Try to create another with same email
      const response = await request(app)
        .post('/api/register')
        .send({
          name: 'Another User',
          email: 'existing@example.com',
          password: 'password123',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'User already exists');
    });
  });

  describe('POST /api/login', () => {
    beforeEach(async () => {
      // Create a test user
      await User.create({
        name: 'Login Test User',
        email: 'login@example.com',
        password: 'password123',
      });
    });

    it('should login successfully with correct credentials', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          email: 'login@example.com',
          password: 'password123',
        })
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Login successful');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('name', 'Login Test User');
      expect(response.body.user).toHaveProperty('email', 'login@example.com');
    });

    it('should return error for invalid credentials', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          email: 'login@example.com',
          password: 'wrongpassword',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });

    it('should return error for non-existent user', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });
  });
});
