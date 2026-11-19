require('dotenv').config();

const path = require('node:path');
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
const PORT = Number.parseInt(process.env.PORT || '3000', 10);
const allowedOrigins = (process.env.ALLOWED_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedServices = new Set([
  'Custom web design',
  'Full-stack build',
  'E-commerce website',
  'SEO & performance',
  'Maintenance & support',
  'Something else'
]);
const allowedBudgets = new Set([
  '',
  'Under KSh 50,000',
  'KSh 50,000–100,000',
  'KSh 100,000–250,000',
  'KSh 250,000+',
  'Not sure yet'
]);

const mailConfig = {
  host: process.env.SMTP_HOST,
  port: Number.parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true',
  user: process.env.SMTP_USER,
  pass: process.env.SMTP_PASS,
  from: process.env.MAIL_FROM || process.env.SMTP_USER,
  to: process.env.MAIL_TO
};
const mailReady = Boolean(mailConfig.host && mailConfig.user && mailConfig.pass && mailConfig.from && mailConfig.to);
const transporter = mailReady
  ? nodemailer.createTransport({
      host: mailConfig.host,
      port: mailConfig.port,
      secure: mailConfig.secure,
      auth: { user: mailConfig.user, pass: mailConfig.pass }
    })
  : null;

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    const error = new Error('Origin is not allowed.');
    error.code = 'ORIGIN_NOT_ALLOWED';
    return callback(error);
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json({ limit: '12kb' }));

function cleanText(value, maxLength) {
  if (typeof value !== 'string') return '';
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/\r\n?/g, '\n')
    .trim()
    .slice(0, maxLength);
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get(['/style.css', '/script.js'], (req, res) => {
  res.sendFile(path.join(__dirname, path.basename(req.path)));
});

app.get('/logo', (req, res) => {
  res.sendFile(path.join(__dirname, 'Apex logo.png'));
});

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.post('/api/inquiry', async (req, res) => {
  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const name = cleanText(body.name, 100).replace(/\s+/g, ' ');
  const email = cleanText(body.email, 254).toLowerCase();
  const service = cleanText(body.service, 80);
  const budget = cleanText(body.budget, 80);
  const details = cleanText(body.details, 3000);
  const message = cleanText(body.message, 2000);
  const honeypot = cleanText(body.website, 200);

  if (honeypot) {
    return res.status(400).json({ ok: false, error: 'Unable to accept this inquiry.' });
  }

  const errors = {};
  if (name.length < 2) errors.name = 'Please enter your name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errors.email = 'Please enter a valid email address.';
  if (!allowedServices.has(service)) errors.service = 'Please select a valid service.';
  if (!allowedBudgets.has(budget)) errors.budget = 'Please select a valid budget range.';
  if (details.length < 10) errors.details = 'Please tell us a little more about your project.';
  if (message.length < 3) errors.message = 'Please add a message.';

  if (Object.keys(errors).length) {
    return res.status(400).json({ ok: false, error: 'Please check the highlighted information and try again.', fields: errors });
  }

  if (!transporter) {
    console.error('Inquiry email is not configured. Set SMTP and MAIL variables in .env.');
    return res.status(503).json({ ok: false, error: 'The inquiry service is temporarily unavailable. Please try again later.' });
  }

  const subject = `Website inquiry: ${service} — ${name}`;
  const text = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Service: ${service}`,
    `Budget: ${budget || 'Not specified'}`,
    '',
    'Project details:',
    details,
    '',
    'Additional message:',
    message
  ].join('\n');
  const html = [
    `<p><strong>Name:</strong> ${escapeHtml(name)}</p>`,
    `<p><strong>Email:</strong> ${escapeHtml(email)}</p>`,
    `<p><strong>Service:</strong> ${escapeHtml(service)}</p>`,
    `<p><strong>Budget:</strong> ${escapeHtml(budget || 'Not specified')}</p>`,
    `<p><strong>Project details:</strong><br>${escapeHtml(details).replace(/\n/g, '<br>')}</p>`,
    `<p><strong>Additional message:</strong><br>${escapeHtml(message).replace(/\n/g, '<br>')}</p>`
  ].join('');

  try {
    await transporter.sendMail({
      from: mailConfig.from,
      to: mailConfig.to,
      replyTo: email,
      subject,
      text,
      html
    });
    return res.status(200).json({ ok: true, message: 'Thanks for reaching out. We’ll be in touch soon.' });
  } catch (error) {
    console.error('Failed to send inquiry email:', error.message);
    return res.status(502).json({ ok: false, error: 'We could not send your inquiry right now. Please try again shortly.' });
  }
});

app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  if (err.code === 'ORIGIN_NOT_ALLOWED') {
    return res.status(403).json({ ok: false, error: 'This origin is not allowed.' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ ok: false, error: 'Your inquiry is too large.' });
  }
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ ok: false, error: 'Request body must be valid JSON.' });
  }
  console.error('Unhandled request error:', err.message);
  return res.status(500).json({ ok: false, error: 'An unexpected error occurred.' });
});

if (!mailReady) {
  console.warn('SMTP is not configured; inquiry submissions will return 503 until .env is completed.');
}

app.listen(PORT, () => {
  console.log(`Apex Digital Solutions is running at http://localhost:${PORT}`);
});
