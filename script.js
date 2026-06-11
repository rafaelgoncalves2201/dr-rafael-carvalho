  // ===== HEADER SCROLL =====
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 60);
  });

  // ===== MOBILE MENU =====
  const hamburger = document.getElementById('hamburgerBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileClose = document.getElementById('mobileClose');

  hamburger.addEventListener('click', () => {
    mobileMenu.style.display = 'flex';
    requestAnimationFrame(() => mobileMenu.classList.add('open'));
  });

  function closeMobile() {
    mobileMenu.classList.remove('open');
    setTimeout(() => { mobileMenu.style.display = 'none'; }, 300);
  }

  mobileClose.addEventListener('click', closeMobile);
  document.querySelectorAll('.mobile-link').forEach(l => l.addEventListener('click', closeMobile));

  // ===== SCROLL REVEAL =====
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(el => observer.observe(el));

  // ===== FAQ ACCORDION =====
  document.querySelectorAll('.faq-question').forEach(q => {
    q.addEventListener('click', () => {
      const item = q.parentElement;
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });

  // ===== COUNTER ANIMATION =====
  function animateCounters() {
    document.querySelectorAll('.numero-value').forEach(el => {
      const text = el.textContent;
      const match = text.match(/(\+?)(\d+)(\D*)/);
      if (!match) return;
      const prefix = match[1];
      const target = parseInt(match[2]);
      const suffix = match[3];
      let current = 0;
      const step = target / 60;
      const interval = setInterval(() => {
        current = Math.min(current + step, target);
        el.textContent = prefix + Math.floor(current) + suffix;
        if (current >= target) clearInterval(interval);
      }, 25);
    });
  }

  const numSection = document.getElementById('numeros');
  const numObs = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) { animateCounters(); numObs.disconnect(); }
  }, { threshold: 0.3 });
  numObs.observe(numSection);

  // ===== SMOOTH SCROLL =====
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
