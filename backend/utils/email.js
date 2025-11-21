const nodemailer = require('nodemailer');

const createTransporter = () => {
  if (process.env.SENDPULSE_SMTP_USER && process.env.SENDPULSE_SMTP_PASS) {
    // Use SendPulse for email sending
    return nodemailer.createTransport({
      host: 'smtp-pulse.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SENDPULSE_SMTP_USER,
        pass: process.env.SENDPULSE_SMTP_PASS,
      },
    });
  } else {
    // Fallback to SendGrid if SendPulse not configured
    return nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false,
      auth: {
        user: process.env.SENDGRID_USER,
        pass: process.env.SENDGRID_PASS,
      },
    });
  }
};

module.exports = createTransporter;
