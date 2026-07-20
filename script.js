const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.querySelector('.site-nav');

if (navToggle && siteNav) {
  navToggle.addEventListener('click', () => {
    siteNav.classList.toggle('open');
    const expanded = siteNav.classList.contains('open');
    navToggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    // focus first link for better keyboard flow when opened
    if (expanded) {
      const first = siteNav.querySelector('a');
      if (first) first.focus();
    }
  });
}

// Contact form fallback: open user's mail client with a prefilled message to avoid server 405
document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const name = data.get('name') || '';
    const email = data.get('email') || '';
    const message = data.get('message') || '';

    const subject = `Website enquiry from ${name || email}`;
    const bodyLines = [];
    if (name) bodyLines.push(`Name: ${name}`);
    if (email) bodyLines.push(`Email: ${email}`);
    bodyLines.push('-----');
    bodyLines.push(message);
    const body = encodeURIComponent(bodyLines.join('\n'));
    const mailto = `mailto:adikluke@gmail.com?subject=${encodeURIComponent(subject)}&body=${body}`;
      const note = document.querySelector('.form-note');

      // If a server endpoint is configured via data-endpoint, POST to it (Formspree/Netlify). Otherwise fallback to mailto.
      const endpoint = form.dataset.endpoint && form.dataset.endpoint.trim();
      if (endpoint && !endpoint.includes('your-form-id')) {
        // try server submission
        fetch(endpoint, {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: new URLSearchParams({ name, email, message, _subject: subject })
        }).then(r => {
          if (r.ok) {
            if (note) { note.style.display = 'block'; note.textContent = 'Message sent — thank you! We will reply to your email shortly.'; }
            form.reset();
          } else {
            if (note) { note.style.display = 'block'; note.textContent = 'Server rejected the message. Opening your mail client as fallback.'; }
            setTimeout(() => { window.location.href = mailto; }, 300);
          }
        }).catch(() => {
          if (note) { note.style.display = 'block'; note.textContent = 'Unable to reach server. Opening your mail client as fallback.'; }
          setTimeout(() => { window.location.href = mailto; }, 300);
        });
      } else {
        if (note) {
          note.style.display = 'block';
          note.textContent = 'A new email window should open in your mail app. If it does not, please email adikluke@gmail.com directly.';
        }
        setTimeout(() => { window.location.href = mailto; }, 250);
      }
  });
});

// Ensure nav-toggle initial state is reflected for accessibility
const navToggleBtn = document.querySelector('.nav-toggle');
if (navToggleBtn && !navToggleBtn.hasAttribute('aria-expanded')) {
  navToggleBtn.setAttribute('aria-expanded', 'false');
}

// Interactive 'dancing' background bubbles on click
(() => {
  const colors = ['tech-color-1', 'tech-color-2', 'tech-color-3', 'tech-color-4'];
  document.addEventListener('pointerdown', (e) => {
    const bubble = document.createElement('span');
    bubble.className = 'click-bubble ' + colors[Math.floor(Math.random() * colors.length)];
    const size = 12 + Math.floor(Math.random() * 48);
    bubble.style.width = size + 'px';
    bubble.style.height = size + 'px';
    bubble.style.left = e.clientX + 'px';
    bubble.style.top = e.clientY + 'px';
    document.body.appendChild(bubble);
    bubble.addEventListener('animationend', () => bubble.remove());
  });
})();

// Header nudge animation on nav click to show movement (not fixed)
(() => {
  const header = document.querySelector('.site-header');
  const navLinks = document.querySelectorAll('.site-nav a');
  if (!header || !navLinks.length) return;
  navLinks.forEach(a => {
    a.addEventListener('click', (e) => {
      header.classList.add('nav-animate');
      setTimeout(() => header.classList.remove('nav-animate'), 420);
    });
  });
})();
