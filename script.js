const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!expanded));
    navLinks.classList.toggle('is-open', !expanded);
  });

  navLinks.addEventListener('click', (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      menuToggle.setAttribute('aria-expanded', 'false');
      navLinks.classList.remove('is-open');
    }
  });
}

document.querySelectorAll('[data-service]').forEach((link) => {
  link.addEventListener('click', () => {
    const service = document.querySelector('#service');
    if (service instanceof HTMLSelectElement) service.value = link.dataset.service;
  });
});

const year = document.querySelector('#year');
if (year) year.textContent = String(new Date().getFullYear());

const inquiryForm = document.querySelector('#inquiry-form');
const formStatus = document.querySelector('#form-status');

if (inquiryForm instanceof HTMLFormElement && formStatus instanceof HTMLElement) {
  inquiryForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    formStatus.textContent = '';
    formStatus.removeAttribute('data-state');

    if (!inquiryForm.reportValidity()) return;

    const submitButton = inquiryForm.querySelector('button[type="submit"]');
    const submitLabel = submitButton?.querySelector('.submit-label');
    if (!(submitButton instanceof HTMLButtonElement)) return;

    submitButton.disabled = true;
    if (submitLabel) submitLabel.textContent = 'Sending…';

    const formData = new FormData(inquiryForm);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'We could not send your inquiry. Please try again.');
      }

      inquiryForm.reset();
      formStatus.dataset.state = 'success';
      formStatus.textContent = result.message || 'Thanks for reaching out. We’ll be in touch soon.';
    } catch (error) {
      formStatus.dataset.state = 'error';
      formStatus.textContent = error instanceof Error ? error.message : 'Something went wrong. Please try again.';
    } finally {
      submitButton.disabled = false;
      if (submitLabel) submitLabel.textContent = 'Send your inquiry';
    }
  });
}
