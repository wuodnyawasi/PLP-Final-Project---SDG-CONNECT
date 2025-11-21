const { Resend } = require('resend');

const createEmailClient = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY environment variable is not set');
  }

  return new Resend(apiKey);
};

const sendEmail = async (mailOptions) => {
  const resend = createEmailClient();

  try {
    const result = await resend.emails.send({
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
      html: mailOptions.html,
    });
    console.log('Email sent successfully:', result);
    return result;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

const createTransporter = () => {
  return {
    sendMail: sendEmail,
  };
};

module.exports = { sendEmail, createTransporter };
