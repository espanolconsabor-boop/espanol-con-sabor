/* ===================================================
   ESPAÑOL CON SABOR — Application JavaScript
   =================================================== */

'use strict';

// ─── TAB NAVIGATION ──────────────────────────────────
const TABS = ['home', 'blog', 'about', 'book'];

function showTab(tabId) {
  if (!TABS.includes(tabId)) return;

  // Deactivate all tabs
  TABS.forEach(id => {
    const el = document.getElementById(`tab-${id}`);
    const nav = document.getElementById(`nav-${id}`);
    if (el) el.classList.remove('active');
    if (nav) nav.classList.remove('active');
  });

  // Activate selected
  const target = document.getElementById(`tab-${tabId}`);
  const navLink = document.getElementById(`nav-${tabId}`);
  if (target) target.classList.add('active');
  if (navLink) navLink.classList.add('active');

  // Scroll to top smoothly
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Update document title
  const titles = {
    home: 'Español con Sabor | Learn Colombian Spanish Online',
    blog: 'Blog | Español con Sabor',
    about: 'About Us | Español con Sabor',
    book: 'Book a Class | Español con Sabor'
  };
  document.title = titles[tabId] || titles.home;

  // Close mobile menu if open
  closeMobileMenu();
}

// ─── MOBILE MENU ──────────────────────────────────────
function closeMobileMenu() {
  const menu = document.getElementById('mobile-menu');
  const ham = document.getElementById('hamburger');
  if (menu) { menu.classList.remove('open'); menu.setAttribute('aria-hidden', 'true'); }
  if (ham) { ham.classList.remove('open'); ham.setAttribute('aria-expanded', 'false'); }
}

document.getElementById('hamburger')?.addEventListener('click', function () {
  const menu = document.getElementById('mobile-menu');
  const isOpen = menu.classList.toggle('open');
  this.classList.toggle('open', isOpen);
  this.setAttribute('aria-expanded', isOpen);
  menu.setAttribute('aria-hidden', !isOpen);
});

// ─── STICKY NAVBAR SHADOW ─────────────────────────────
window.addEventListener('scroll', () => {
  const navbar = document.getElementById('navbar');
  if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 10);
}, { passive: true });

// ─── DISMISS DISCOUNT BANNER ──────────────────────────
document.getElementById('dismiss-banner')?.addEventListener('click', () => {
  const banner = document.getElementById('discount-banner');
  if (banner) banner.classList.add('hidden');
  sessionStorage.setItem('banner-dismissed', 'true');
});

// Restore dismiss state on reload
if (sessionStorage.getItem('banner-dismissed') === 'true') {
  document.getElementById('discount-banner')?.classList.add('hidden');
}

// ─── COUNTDOWN TIMER (3h promo) ───────────────────────
(function initCountdown() {
  const KEY = 'promo-end-time';
  const DURATION_MS = 3 * 60 * 60 * 1000; // 3 hours

  let endTime = parseInt(sessionStorage.getItem(KEY), 10);
  if (!endTime || isNaN(endTime) || endTime <= Date.now()) {
    endTime = Date.now() + DURATION_MS;
    sessionStorage.setItem(KEY, endTime.toString());
  }

  function pad(n) { return String(n).padStart(2, '0'); }

  function tick() {
    const remaining = Math.max(0, endTime - Date.now());
    const totalSec = Math.floor(remaining / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;

    const hEl = document.getElementById('count-h');
    const mEl = document.getElementById('count-m');
    const sEl = document.getElementById('count-s');

    if (hEl) hEl.textContent = pad(h);
    if (mEl) mEl.textContent = pad(m);
    if (sEl) sEl.textContent = pad(s);

    if (remaining <= 0) {
      // Reset timer when it hits zero
      endTime = Date.now() + DURATION_MS;
      sessionStorage.setItem(KEY, endTime.toString());
    }
  }

  tick();
  setInterval(tick, 1000);
})();

// ─── LIVE ACTIVITY TICKER ─────────────────────────────
(function initTicker() {
  const messages = [
    '🔴 <strong>12 students</strong> booked a class in the last 24 hours',
    '⚡ Only <strong>3 spots</strong> left this week with Camila',
    '🎉 <strong>Sarah from New York</strong> just booked her trial class!',
    '🔴 <strong>10 classes</strong> scheduled in the past 24 hours',
    '⭐ <strong>James from London</strong> left a 5-star review today',
    '📅 <strong>Valentina</strong> has 2 new slots available this weekend',
  ];

  let idx = 0;
  const ticker = document.getElementById('ticker-text');

  setInterval(() => {
    if (!ticker) return;
    ticker.style.opacity = '0';
    ticker.style.transform = 'translateY(6px)';
    setTimeout(() => {
      idx = (idx + 1) % messages.length;
      ticker.innerHTML = messages[idx];
      ticker.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      ticker.style.opacity = '1';
      ticker.style.transform = 'translateY(0)';
    }, 350);
  }, 5000);
})();

// ─── FAQ ACCORDION ────────────────────────────────────
function toggleFaq(btn) {
  const answer = btn.nextElementSibling;
  const isOpen = btn.getAttribute('aria-expanded') === 'true';

  // Close all others
  document.querySelectorAll('.faq-question').forEach(q => {
    if (q !== btn) {
      q.setAttribute('aria-expanded', 'false');
      const a = q.nextElementSibling;
      if (a) a.classList.remove('open');
    }
  });

  // Toggle this one
  btn.setAttribute('aria-expanded', !isOpen);
  if (answer) answer.classList.toggle('open', !isOpen);
}

// ─── NEWSLETTER SIGNUP ────────────────────────────────
async function handleNewsletterSignup(e) {
  e.preventDefault();
  const emailInput = document.getElementById('newsletter-email');
  const btn = document.getElementById('newsletter-submit-btn');
  if (!emailInput || !emailInput.value) return;

  const email = emailInput.value;
  btn.textContent = 'Subscribing...';
  btn.disabled = true;

  const { error } = await supabaseClient
    .from('newsletter_subscribers')
    .insert([{ email: email, source: 'blog' }]);

  if (error) {
    btn.textContent = 'Subscribe Free →';
    btn.disabled = false;
    if (error.code === '23505') {
      showToast('Ya estás suscrito con ese email 😊');
    } else {
      showToast('Algo salió mal, intenta de nuevo');
      console.error(error);
    }
    return;
  }

  btn.textContent = '✅ Subscribed!';
  emailInput.value = '';
  showToast(`🎉 Welcome! We'll send weekly tips to ${email}`);
  setTimeout(() => {
    btn.textContent = 'Subscribe Free →';
    btn.disabled = false;
  }, 3000);
}

// ─── TOAST NOTIFICATIONS ──────────────────────────────
function showToast(message, duration = 3500) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.innerHTML = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

// ─── INTERSECTION OBSERVER — Animate on scroll ────────
(function initScrollAnimations() {
  const observerOpts = {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, observerOpts);

  function observeElements() {
    const animatables = document.querySelectorAll(
      '.step-card, .testimonial-card, .teacher-card, .blog-card, .pillar-card, .pricing-card, .booking-step'
    );
    animatables.forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transition = `opacity 0.5s ease ${i * 0.08}s, transform 0.5s ease ${i * 0.08}s`;
      observer.observe(el);
    });
  }

  // Run on tab switch too
  document.addEventListener('DOMContentLoaded', observeElements);
  window.addEventListener('tabChanged', observeElements);
})();

// ─── COUNTER ANIMATION (stat numbers) ─────────────────
(function initStatCounters() {
  const counters = [
    { el: document.querySelector('.stat-number'), target: 500, suffix: '+' },
  ];

  function animateCounter(el, target, suffix = '') {
    let current = 0;
    const increment = Math.ceil(target / 60);
    const interval = setInterval(() => {
      current = Math.min(current + increment, target);
      el.textContent = current + suffix;
      if (current >= target) clearInterval(interval);
    }, 25);
  }

  // Trigger on first visit
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.target || '500', 10);
        const suffix = el.dataset.suffix || '+';
        animateCounter(el, target, suffix);
        counterObserver.unobserve(el);
      }
    });
  });

  document.querySelectorAll('.stat-number').forEach(el => {
    const text = el.textContent;
    const match = text.match(/^(\d+)/);
    if (match) {
      el.dataset.target = match[1];
      el.dataset.suffix = text.replace(match[1], '');
    }
    counterObserver.observe(el);
  });
})();

// ─── PERIODIC ACTIVITY UPDATE ─────────────────────────
(function initActivityUpdates() {
  const activityCount = document.getElementById('activity-count');
  const counts = [8, 9, 10, 11, 12, 13];
  let idx = 0;

  setInterval(() => {
    if (!activityCount) return;
    idx = (idx + 1) % counts.length;
    const n = counts[idx];
    activityCount.innerHTML = `🗓️ <strong>${n} classes</strong> scheduled in the past 24 hours`;
  }, 17000);
})();

// ─── SMOOTH HOVER EFFECTS FOR IMAGES ─────────────────
document.querySelectorAll('.teacher-img, .blog-card-img, .founder-img').forEach(img => {
  img.addEventListener('error', function () {
    this.style.background = 'linear-gradient(135deg, #2A9D8F 0%, #0E5A60 100%)';
    this.style.display = 'flex';
    this.style.alignItems = 'center';
    this.style.justifyContent = 'center';
    this.style.minHeight = '200px';
    this.style.color = 'rgba(255,255,255,0.5)';
    this.style.fontSize = '3rem';
    this.textContent = '👤';
  });
});

// ─── LOGO / HOME SHORTCUT ─────────────────────────────
document.getElementById('logo-link')?.addEventListener('click', (e) => {
  e.preventDefault();
  showTab('home');
});

// ─── KEYBOARD NAVIGATION ─────────────────────────────
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeMobileMenu();
});

// ─── INIT ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Ensure home tab is visible by default
  showTab('home');

  // Show a welcome toast after a brief delay
  setTimeout(() => {
    showToast('☕ ¡Bienvenido! Book your $15 trial class today →');
  }, 2500);
});
