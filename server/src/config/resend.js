import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY;

let resend = null;

if (RESEND_API_KEY) {
  resend = new Resend(RESEND_API_KEY);
}

export default resend;
