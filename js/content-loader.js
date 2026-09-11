/* ===================================================
   ESPAÑOL CON SABOR — Dynamic Content Loader (Supabase)
   =================================================== */

async function loadTeachers() {
  const container = document.querySelector('.teachers-grid');
  if (!container) return;
  const { data, error } = await supabaseClient.from('teachers').select('*').order('display_order');
  if (error || !data || !data.length) return; // Si falla o no hay datos, deja las cards de respaldo

  container.innerHTML = data.map(t => {
    const firstName = t.name ? t.name.split(' ')[0] : 'Teacher';
    const photo = t.photo_url || 'images/founder_avatar.jpg';
    return `
      <article class="teacher-card">
        <div class="teacher-img-wrapper">
          <img src="${photo}" alt="${t.name}" class="teacher-img" loading="lazy" />
        </div>
        <div class="teacher-body">
          <div class="teacher-header">
            <div>
              <h3 class="teacher-name">${t.name}</h3>
              <p class="teacher-city">📍 ${t.city || ''}</p>
            </div>
            <div class="teacher-rating">
              <span class="t-stars">★★★★★</span>
              <span class="t-rating">5.0</span>
            </div>
          </div>
          <p class="teacher-specialty">${t.bio || ''}</p>
          <button class="btn-book-teacher" onclick="showTab('book')">Book with ${firstName} →</button>
        </div>
      </article>
    `;
  }).join('');
}

async function loadTestimonials() {
  const container = document.querySelector('.testimonials-grid');
  if (!container) return;
  const { data, error } = await supabaseClient.from('testimonials').select('*').order('display_order');
  if (error || !data || !data.length) return; // Respaldo visual si no hay datos

  const avatarColors = ['#2A9D8F', '#F2B705', '#0E5A60', '#FC2C54'];

  container.innerHTML = data.map((t, idx) => {
    const initial = t.name ? t.name.charAt(0).toUpperCase() : 'S';
    const color = avatarColors[idx % avatarColors.length];
    const rating = Math.max(1, Math.min(5, t.rating || 5));
    const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);

    return `
      <article class="testimonial-card">
        <div class="testimonial-header">
          <div class="testimonial-avatar" style="background:${color};">${initial}</div>
          <div class="testimonial-meta">
            <strong class="testimonial-name">${t.name}</strong>
            <span class="testimonial-location">⭐ Verified Student</span>
          </div>
          <div class="testimonial-stars">${stars}</div>
        </div>
        <p class="testimonial-text">"${t.text}"</p>
        <div class="testimonial-badge">📅 Student Review</div>
      </article>
    `;
  }).join('');
}

async function loadBlogPosts() {
  const container = document.querySelector('.blog-grid');
  if (!container) return;
  const { data, error } = await supabaseClient.from('blog_posts').select('*').order('display_order');
  if (error || !data || !data.length) return; // Respaldo visual si no hay datos

  const tagColors = {
    Travel: '#FC2C54',
    Language: '#2A9D8F',
    Culture: '#0E5A60'
  };

  container.innerHTML = data.map(p => {
    const tag = p.tag || 'Culture';
    const tagBg = tagColors[tag] ? `style="background:${tagColors[tag]};"` : '';
    const img = p.image_url || 'images/blog_coffee_culture.jpg';

    return `
      <article class="blog-card">
        <div class="blog-card-img-wrapper">
          <img src="${img}" alt="${p.title}" class="blog-card-img" loading="lazy" />
          <span class="blog-card-tag" ${tagBg}>${tag}</span>
        </div>
        <div class="blog-card-body">
          <div class="blog-card-meta">
            <span class="blog-author">☕ Español con Sabor</span>
            <span class="blog-date">Latest Post</span>
          </div>
          <h2 class="blog-card-title">${p.title}</h2>
          <p class="blog-card-excerpt">${p.excerpt || ''}</p>
          <a href="#" class="blog-read-more" onclick="return false;">Read Article →</a>
        </div>
      </article>
    `;
  }).join('');
}

async function loadSiteContent() {
  const { data, error } = await supabaseClient.from('site_content').select('*');
  if (error || !data) return;
  const v = {};
  data.forEach(row => v[row.key] = row.value);
  const set = (selector, value, attr = 'text') => {
    const el = document.querySelector(selector);
    if (!el || !value) return;
    if (attr === 'text') el.textContent = value;
    else if (attr === 'html') el.innerHTML = value;
    else el.setAttribute(attr, value);
  };

  // Hero
  const heroTitle = document.querySelector('.hero-title');
  if (heroTitle && v.hero_title_line1 && v.hero_title_line2) {
    heroTitle.innerHTML = `${v.hero_title_line1}<br /><em>${v.hero_title_line2}</em>`;
  }
  set('.hero-subtitle', v.hero_subtitle);

  // Stats (los 3 hero-stat en orden)
  const statEls = document.querySelectorAll('.hero-stat');
  if (statEls[0] && v.stat_1_number) { statEls[0].querySelector('.stat-number').textContent = v.stat_1_number; statEls[0].querySelector('.stat-label').textContent = v.stat_1_label; }
  if (statEls[1] && v.stat_2_number) { statEls[1].querySelector('.stat-number').textContent = v.stat_2_number; statEls[1].querySelector('.stat-label').textContent = v.stat_2_label; }
  if (statEls[2] && v.stat_3_number) { statEls[2].querySelector('.stat-number').textContent = v.stat_3_number; statEls[2].querySelector('.stat-label').textContent = v.stat_3_label; }

  // Section titles
  set('.philosophy-section .section-title', v.section_title_pillars);
  set('#founder-card', null); // no-op, placeholder to keep structure
  document.querySelectorAll('.section-title').forEach(el => {
    if (el.textContent.trim() === 'Start speaking in 3 easy steps' && v.section_title_steps) el.textContent = v.section_title_steps;
    if (el.textContent.trim() === 'What our students say' && v.section_title_testimonials) el.textContent = v.section_title_testimonials;
    if (el.textContent.trim() === 'Your Colombian teachers' && v.section_title_teachers) el.textContent = v.section_title_teachers;
    if (el.textContent.trim() === 'Ready in 3 quick steps' && v.section_title_book_steps) el.textContent = v.section_title_book_steps;
    if (el.textContent.trim() === 'Frequently Asked Questions' && v.section_title_faq) el.textContent = v.section_title_faq;
  });

  // Founder
  set('.founder-name', v.founder_name);
  set('.founder-title', v.founder_title);
  const founderQuote = document.querySelector('.founder-quote');
  if (founderQuote && v.founder_quote) founderQuote.textContent = `"${v.founder_quote}"`;
  const founderTexts = document.querySelectorAll('.founder-text');
  if (founderTexts[0] && v.founder_bio) founderTexts[0].textContent = v.founder_bio;
  if (v.founder_photo_url) set('.founder-img', v.founder_photo_url, 'src');

  // Planes: precio, nota, features (por id del contenedor)
  const plans = [
    { id: 'plan-andina', price: v.plan_andina_price, note: v.plan_andina_note, features: v.plan_andina_features },
    { id: 'plan-cafetera', price: v.plan_cafetera_price, note: v.plan_cafetera_note, features: v.plan_cafetera_features },
    { id: 'plan-caribena', price: v.plan_caribena_price, note: v.plan_caribena_note, features: v.plan_caribena_features },
  ];
  plans.forEach(p => {
    const card = document.getElementById(p.id);
    if (!card) return;
    if (p.price) card.querySelector('.price-amount').textContent = p.price;
    if (p.note) card.querySelector('.price-note').textContent = p.note;
    if (p.features) {
      const ul = card.querySelector('.plan-features');
      if (ul) {
        ul.innerHTML = p.features.split('\n').filter(f => f.trim()).map(f => `<li class="feature-item">✅ ${f.trim()}</li>`).join('');
      }
    }
  });

  // Footer
  set('.footer-tagline', v.footer_tagline);
  const contactPs = document.querySelectorAll('.footer-contact');
  if (contactPs[0] && v.footer_email) contactPs[0].textContent = `📧 ${v.footer_email}`;
  if (contactPs[1] && v.footer_whatsapp) contactPs[1].textContent = `💬 WhatsApp: ${v.footer_whatsapp}`;
  if (contactPs[2] && v.footer_hours) contactPs[2].textContent = `🕐 ${v.footer_hours}`;

  const socialLinks = document.querySelectorAll('.footer-socials .social-link');
  if (socialLinks[0] && v.social_instagram_url) { socialLinks[0].href = v.social_instagram_url; socialLinks[0].removeAttribute('onclick'); socialLinks[0].target = '_blank'; }
  if (socialLinks[1] && v.social_tiktok_url) { socialLinks[1].href = v.social_tiktok_url; socialLinks[1].removeAttribute('onclick'); socialLinks[1].target = '_blank'; }
  if (socialLinks[2] && v.social_youtube_url) { socialLinks[2].href = v.social_youtube_url; socialLinks[2].removeAttribute('onclick'); socialLinks[2].target = '_blank'; }
}

async function loadFaqs() {
  const container = document.getElementById('faq-list');
  if (!container) return;
  const { data, error } = await supabaseClient.from('faqs').select('*').order('display_order');
  if (error || !data || !data.length) return;
  container.innerHTML = data.map(f => `
    <div class="faq-item">
      <button class="faq-question" aria-expanded="false" onclick="toggleFaq(this)">
        <span>${f.question}</span>
        <span class="faq-chevron">▾</span>
      </button>
      <div class="faq-answer">
        <p>${f.answer}</p>
      </div>
    </div>
  `).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  loadTeachers();
  loadTestimonials();
  loadBlogPosts();
  loadSiteContent();
  loadFaqs();
});
