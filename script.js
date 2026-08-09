const navToggle = document.querySelector('.nav-toggle');
const navList = document.querySelector('.nav-list');

if (navToggle && navList) {
  navToggle.addEventListener('click', () => {
    const isOpen = navList.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
  });
  navList.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    navList.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  }));
}

const contactForm = document.querySelector('#contact-form');
const formStatus = document.querySelector('.form-status');

document.querySelectorAll('a[href="tel:+0704244657"]').forEach((phoneLink) => {
  phoneLink.href = 'tel:+254704244657';
  phoneLink.textContent = '+254704244657';
});

document.querySelectorAll('.contact-details').forEach((contactDetails) => {
  contactDetails.querySelectorAll('p').forEach((item) => {
    const label = item.querySelector('strong')?.textContent.trim();
    if (label === 'Email') {
      item.innerHTML = '<strong>Email</strong><br><a href="mailto:alalopoko@gmail.com">alalopoko@gmail.com</a>';
    }
    if (label === 'Phone') {
      item.innerHTML = '<strong>Phone</strong><br><a href="tel:+254704244657">+254704244657</a><br><a href="tel:+254704813110">+254704813110</a>';
    }
    if (label === 'Location') {
      item.innerHTML = '<strong>Location</strong><br>Nairobi, Kenya';
    }
  });
});

document.querySelectorAll('.site-footer').forEach((footer) => {
  const contactHeading = [...footer.querySelectorAll('h3')].find((heading) => heading.textContent.trim() === 'Contact');
  const contactBlock = contactHeading?.parentElement;
  const contactText = contactBlock?.querySelector('p');
  if (contactText) {
    contactText.innerHTML = '<a href="mailto:alalopoko@gmail.com">alalopoko@gmail.com</a><a href="tel:+254704244657">+254704244657</a><a href="tel:+254704813110">+254704813110</a>Nairobi, Kenya';
  }
});

if (contactForm && formStatus) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!contactForm.checkValidity()) { contactForm.reportValidity(); return; }
    const formData = new FormData(contactForm);
    const subject = `Website inquiry from ${formData.get('name')}`;
    const details = [
      `Full Name: ${formData.get('name')}`,
      `Business / Organization: ${formData.get('business') || 'Not provided'}`,
      `Email: ${formData.get('email')}`,
      `Phone: ${formData.get('phone') || 'Not provided'}`,
      `Service Needed: ${formData.get('service')}`,
      `Budget Range: ${formData.get('budget') || 'Not provided'}`,
      `Preferred Contact Method: ${formData.get('contact-method') || 'Not provided'}`,
      '',
      'Project Description:',
      formData.get('message')
    ].join('\\n');
    formStatus.textContent = 'Opening your email app with the inquiry details.';
    window.location.href = `mailto:alalopoko@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(details)}`;
  });
}
