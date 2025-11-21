const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const { sendEmail } = require('../utils/email');

// POST /api/contact
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Basic validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Save to database
    const contact = new Contact({ name, email, subject, message });
    await contact.save();

    // Send email notification
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@sdgconnect.org',
      to: 'owadgijagor@gmail.com',
      subject: `New Contact Form Submission: ${subject}`,
      text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\nMessage: ${message}`,
    };

    await sendEmail(mailOptions);

    res.status(200).json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error sending contact message:', error);
    // Log additional details for debugging
    if (error.response) {
      console.error('Brevo API response error:', error.response.data);
    }
    res.status(500).json({ message: 'Failed to send message', error: error.message });
  }
});

module.exports = router;
