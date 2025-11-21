const nodemailer = require('nodemailer');

const createTransporter = () => {
  // Use Brevo for email sending
  return nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.BREVO_SMTP_USER || '9c355e001@smtp-brevo.com',
      pass: process.env.BREVO_SMTP_PASS || 'wL1FqkmAdUzrRIV3',
    },
    // Add timeout to prevent connection timeout errors
    connectionTimeout: 60000, // 60 seconds
    socketTimeout: 60000,
    // Enable debug logging
    debug: true,
    logger: true,
  });
};

module.exports = createTransporter;
