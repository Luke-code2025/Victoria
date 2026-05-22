require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Read configuration from environment variables
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_SECURE = process.env.SMTP_SECURE === 'true';
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const FROM_EMAIL = process.env.FROM_EMAIL || SMTP_USER;
const TO_EMAIL = process.env.TO_EMAIL || 'adikluke@gmail.com';

if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
  console.warn('Warning: SMTP credentials are not fully set. Please configure SMTP_HOST, SMTP_USER, SMTP_PASS in .env');
}

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE,
  auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
});

// Optional verification
transporter.verify()
  .then(() => console.log('SMTP transporter ready'))
  .catch(err => console.warn('SMTP verification failed (may be ok for some providers):', err && err.message));

app.get('/', (req, res) => {
  res.send('Victoria Digital email API running');
});

app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body || {};
    if (!email || !message) return res.status(400).json({ ok: false, error: 'Missing required fields' });

    const subject = `Website enquiry from ${name || email}`;
    const textLines = [];
    if (name) textLines.push(`Name: ${name}`);
    textLines.push(`Email: ${email}`);
    textLines.push('---');
    textLines.push(message);
    const text = textLines.join('\n');

    const mailOptions = {
      from: FROM_EMAIL,
      to: TO_EMAIL,
      subject,
      text,
      html: `<p>${text.replace(/\n/g, '<br/>')}</p>`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info && info.messageId);
    return res.json({ ok: true });
  } catch (err) {
    console.error('Error sending email:', err && err.message);
    return res.status(500).json({ ok: false, error: 'Failed to send message' });
  }
});

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
