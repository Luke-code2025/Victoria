# Apex Digital — Node Email Server

This repository includes a lightweight Node/Express server that accepts contact form submissions and forwards them to an email address via SMTP using `nodemailer`.

Quick start

1. Install dependencies:

```bash
npm install
```

2. Copy the example environment file and fill in your SMTP credentials:

```bash
cp .env.example .env
# edit .env and add your SMTP host/user/pass and desired TO_EMAIL
```

3. Start the server:

```bash
npm start
```

By default the server listens on port `3000` and exposes `POST /api/contact` which expects `name`, `email`, and `message` fields (form encoded or JSON).

Integration with the front-end

- In `index.html` set the form's `data-endpoint` to the server URL (e.g. `https://your-domain.com/api/contact` or `/api/contact` when hosting both app and server together).
- The front-end already attempts to POST to the configured endpoint and falls back to opening the user's mail client when a server isn't configured or is unreachable.

Security note

Do not commit your real `.env` to version control. Use secure environment management for production.
