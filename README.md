# Apex Digital Solutions

A responsive marketing website for Apex Digital Solutions with a Node.js/Express inquiry API. The frontend is semantic HTML, CSS and vanilla JavaScript; inquiry submissions are emailed through SMTP with Nodemailer. No database or frontend framework is used.

## Run locally

1. Install Node.js (20 or newer), then install the project dependencies:

   ```sh
   npm install
   ```

2. Copy `.env.example` to `.env` and set your SMTP credentials, sender, recipient and allowed origin. For local use, keep `ALLOWED_ORIGIN=http://localhost:3000`. If you host the frontend on another origin, set that exact origin instead.

3. Start the website and API:

   ```sh
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000). The Express server serves the website and accepts `POST /api/inquiry`; the frontend submits JSON to this same-origin endpoint.

The inquiry endpoint requires a name, valid email, selected service, project details and message. Budget is optional. SMTP settings are required to send email; until configured, the API responds with `503` and a clear error. Allowed origins can be a comma-separated list. Keep `.env` private and never commit real credentials.
