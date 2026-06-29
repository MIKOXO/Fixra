import transporter from '../config/nodemailer.js';

const sendEmail = async (to, subject, htmlBody) => {
  const data = await transporter.sendMail({
    from: process.env.FROM_EMAIL,
    to,
    subject,
    html: htmlBody,
  });
  return { success: true, data };
};

export { sendEmail };
