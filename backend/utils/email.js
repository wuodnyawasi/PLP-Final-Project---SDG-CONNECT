const { TransactionalEmailsApi, TransactionalEmailsApiApiKeys } = require('@getbrevo/brevo');

const createEmailClient = () => {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    throw new Error('BREVO_API_KEY environment variable is not set');
  }

  const apiInstance = new TransactionalEmailsApi();
  apiInstance.setApiKey(TransactionalEmailsApiApiKeys.apiKey, apiKey);

  return apiInstance;
};

const sendEmail = async (mailOptions) => {
  const apiInstance = createEmailClient();

  const sendSmtpEmail = {
    sender: { email: mailOptions.from },
    to: [{ email: mailOptions.to }],
    subject: mailOptions.subject,
    textContent: mailOptions.text,
  };

  try {
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('Email sent successfully:', result);
    return result;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = { sendEmail };
