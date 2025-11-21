const nodemailer = require('nodemailer');

const createTransporter = () => {
  // Use Brevo for email sending
  return nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.BREVO_SMTP_USER,
      pass: process.env.BREVO_SMTP_PASS,
    },
    // Add timeout to prevent connection timeout errors
    connectionTimeout: 60000, // 60 seconds
    socketTimeout: 60000,
  });
};

module.exports = createTransporter;
