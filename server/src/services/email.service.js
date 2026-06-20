import resend from '../config/resend.js';

const sendEmail = async (to, subject, htmlBody) => {
  if (!resend) {
    return { success: false, error: 'Resend client not configured' };
  }

  try {
    const data = await resend.emails.send({
      from: process.env.FROM_EMAIL,
      to,
      subject,
      html: htmlBody,
    });
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export { sendEmail };
