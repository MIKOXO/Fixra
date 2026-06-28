import resend from '../config/resend.js';

const sendEmail = async (to, subject, htmlBody) => {
  if (!resend) {
    throw new Error('Resend client not configured');
  }

  const data = await resend.emails.send({
    from: process.env.FROM_EMAIL,
    to,
    subject,
    html: htmlBody,
  });
  return { success: true, data };
};

export { sendEmail };
