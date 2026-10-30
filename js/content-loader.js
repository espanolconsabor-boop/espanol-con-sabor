/* ===================================================
   ESPAÑOL CON SABOR — Dynamic Content Loader (Supabase)
   =================================================== */

// Global cache for blog articles
window._allBlogPosts = [];
window._staticBlogPosts = [
  {
    title: "The Art of Colombian Coffee Culture: More Than Just a Drink",
    tag: "Culture",
    image_url: "images/blog_coffee_culture.jpg",
    content: "Colombia is the world's third-largest coffee producer, but for Colombians, coffee is so much more than a morning ritual. Learn the vocabulary, etiquette, and deep cultural significance of el tinto — and why it matters to your Spanish journey.\n\nEl ritual del tinto\nEn Colombia, un café negro pequeño se llama un tinto — no confundir con el vino tinto. Se escucha por todas partes: \"¿Un tintico?\" es menos una pregunta y más una invitación. Los vendedores ambulantes, llamados tinteros, recorren oficinas y plazas con termos, vendiendo tacitas de café por menos de un dólar. Rechazar una casi se siente descortés — aceptarla es un pequeño gesto de hospitalidad devuelto.\n\nDe la finca a la taza\nLa mayor parte del café colombiano se cultiva en el montañoso Eje Cafetero, donde la altitud, el suelo volcánico y las fincas familiares producen algunos de los granos más apreciados del mundo."
  },
  {
    title: "Cartagena de Indias: A City That Speaks History",
    tag: "Travel",
    image_url: "images/blog_cartagena.jpg",
    content: "The walled city of Cartagena is Colombia's crown jewel — a UNESCO World Heritage Site where every cobblestone street tells a story. Discover the Spanish vocabulary of the Caribbean coast and why Costeño Spanish is the most musical dialect you'll ever hear.\n\nUna fortaleza con historia\nFundada en 1533, Cartagena fue alguna vez el puerto principal del imperio español en las Américas. Sus murallas de piedra coralina, construidas para defenderse de piratas británicos y franceses, todavía abrazan plazas llenas de balcones de madera tallada y buganvilias de colores vivos."
  },
  {
    title: "10 Colombian Slang Words That'll Make You Sound Like a Local",
    tag: "Language",
    image_url: "images/blog_slang.jpg",
    content: "Parcero, chévere, bacano, quiubo — if you don't know these words yet, you're missing out on the soul of Colombian Spanish. Our teacher Camila breaks down the most essential slang expressions with real-life examples you can use today.\n\n1. Parcero / Parce — Amigo, compañero.\n2. Chévere — Genial, bacano, increíble.\n3. Bacano/a — Muy agradable, simpático.\n4. Quiubo — Saludo casual (¿qué hubo?).\n5. Chimba — Increíble o fuera de serie."
  }
];

async function loadTeachers() {
  const container = document.querySelector('.teachers-grid');
  if (!container) return;
  const { data, error } = await supabaseClient.from('teachers').select('*').order('display_order');
  if (error || !data || !data.length) return; // Si falla o no hay datos, deja las cards de respaldo

  // Cargar calificaciones de tutores desde site_content
  const { data: ratingsData } = await supabaseClient.from('site_content').select('*').like('key', 'teacher_rating_%');
  const ratingsMap = {};
  (ratingsData || []).forEach(r => {
    ratingsMap[r.key.replace('teacher_rating_', '')] = r.value;
  });

  container.innerHTML = data.map(t => {
    const firstName = t.name ? t.name.split(' ')[0] : 'Teacher';
    const photo = t.photo_url || 'images/founder_avatar.jpg';
    const numRating = parseFloat(ratingsMap[t.id] ?? t.rating ?? 5.0) || 5.0;
    const formattedRating = numRating.toFixed(1);
    const starCount = Math.round(numRating);
    const stars = '★'.repeat(Math.max(0, Math.min(5, starCount))) + '☆'.repeat(Math.max(0, 5 - starCount));

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
              <span class="t-stars">${stars}</span>
              <span class="t-rating">${formattedRating}</span>
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

  window._allBlogPosts = data;

  const tagColors = {
    Travel: '#FC2C54',
    Language: '#2A9D8F',
    Culture: '#0E5A60'
  };

  container.innerHTML = data.map((p, idx) => {
    const tag = p.tag || 'Culture';
    const tagBg = tagColors[tag] ? `style="background:${tagColors[tag]};"` : '';
    const img = p.image_url || 'images/blog_coffee_culture.jpg';

    return `
      <article class="blog-card" onclick="openBlogArticle(${idx})" style="cursor:pointer;">
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
          <a href="#" class="blog-read-more" onclick="event.preventDefault(); event.stopPropagation(); openBlogArticle(${idx}); return false;">Read Article →</a>
        </div>
      </article>
    `;
  }).join('');
}

// Visualizador de artículos completos (Modal)
function openBlogArticle(idx, isStatic = false) {
  let post = null;
  if (isStatic && window._staticBlogPosts) {
    post = window._staticBlogPosts[idx];
  } else if (window._allBlogPosts && window._allBlogPosts[idx]) {
    post = window._allBlogPosts[idx];
  }
  if (!post) return;

  const modal = document.getElementById('blog-modal');
  if (!modal) return;

  const titleEl = document.getElementById('modal-article-title');
  if (titleEl) titleEl.textContent = post.title || '';

  const tagEl = document.getElementById('modal-article-tag');
  if (tagEl) {
    tagEl.textContent = post.tag || 'Culture';
    const tagColors = { Travel: '#FC2C54', Language: '#2A9D8F', Culture: '#0E5A60' };
    tagEl.style.backgroundColor = tagColors[post.tag] || '#0E5A60';
  }

  const dateEl = document.getElementById('modal-article-date');
  if (dateEl) {
    dateEl.textContent = post.created_at ? new Date(post.created_at).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Lectura de 4 min';
  }

  const imgEl = document.getElementById('modal-article-img');
  const imgWrap = document.getElementById('modal-article-img-wrap');
  if (imgEl && imgWrap) {
    if (post.image_url) {
      imgEl.src = post.image_url;
      imgEl.alt = post.title || '';
      imgWrap.style.display = 'block';
    } else {
      imgWrap.style.display = 'none';
    }
  }

  const contentEl = document.getElementById('modal-article-content');
  if (contentEl) {
    const raw = post.content || post.excerpt || '';
    const paragraphs = raw.split(/\n\n+/).map(block => {
      const trimmed = block.trim();
      if (!trimmed) return '';
      if (trimmed.startsWith('----')) return '<hr class="article-divider" />';
      if (/^[0-9]+\.\s/.test(trimmed)) {
        return `<p class="article-list-item">${trimmed.replace(/\n/g, '<br>')}</p>`;
      }
      return `<p>${trimmed.replace(/\n/g, '<br>')}</p>`;
    }).filter(Boolean).join('');
    contentEl.innerHTML = paragraphs;
  }

  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeBlogArticle() {
  const modal = document.getElementById('blog-modal');
  if (modal) modal.style.display = 'none';
  document.body.style.overflow = '';
}

// Cerrar modal con la tecla Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeBlogArticle();
});

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

  // Planes: precio, periodo, nota, features (por id del contenedor)
  const plans = [
    { id: 'plan-andina', price: v.plan_andina_price, period: v.plan_andina_period, note: v.plan_andina_note, features: v.plan_andina_features },
    { id: 'plan-cafetera', price: v.plan_cafetera_price, period: v.plan_cafetera_period, note: v.plan_cafetera_note, features: v.plan_cafetera_features },
    { id: 'plan-caribena', price: v.plan_caribena_price, period: v.plan_caribena_period, note: v.plan_caribena_note, features: v.plan_caribena_features },
  ];
  plans.forEach(p => {
    const card = document.getElementById(p.id);
    if (!card) return;
    if (p.price) card.querySelector('.price-amount').textContent = p.price;
    if (p.period) {
      const periodEl = card.querySelector('.price-period');
      if (periodEl) periodEl.textContent = p.period.startsWith('/') ? p.period : `/${p.period}`;
    }
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

  // Email
  const emailVal = v.footer_email ? v.footer_email.trim() : '';
  const emailLink = document.getElementById('footer-email-link');
  const emailSpan = document.getElementById('footer-email-val');
  if (emailVal) {
    if (emailLink) emailLink.href = `mailto:${emailVal}`;
    if (emailSpan) emailSpan.textContent = emailVal;
  }

  // WhatsApp con hipervínculo directo
  const whatsappVal = v.footer_whatsapp ? v.footer_whatsapp.trim() : '';
  const whatsappLink = document.getElementById('footer-whatsapp-link');
  const whatsappSpan = document.getElementById('footer-whatsapp-val');
  if (whatsappVal) {
    const cleanNumber = whatsappVal.replace(/[^0-9]/g, '');
    if (whatsappLink) {
      whatsappLink.href = cleanNumber ? `https://wa.me/${cleanNumber}` : '#';
    }
    if (whatsappSpan) {
      whatsappSpan.textContent = whatsappVal;
    }
  }

  // Redes sociales: Instagram
  const instagramLink = document.getElementById('footer-social-instagram') || document.querySelectorAll('.footer-socials .social-link')[0];
  if (instagramLink && v.social_instagram_url && v.social_instagram_url.trim()) {
    instagramLink.href = v.social_instagram_url.trim();
    instagramLink.removeAttribute('onclick');
    instagramLink.target = '_blank';
    instagramLink.rel = 'noopener noreferrer';
  }

  // Redes sociales: TikTok (controlado por toggle social_tiktok_enabled)
  const tiktokLink = document.getElementById('footer-social-tiktok');
  if (tiktokLink) {
    const isTiktokEnabled = v.social_tiktok_enabled === 'true';
    const tiktokUrl = (v.social_tiktok_url || '').trim();
    if (isTiktokEnabled && tiktokUrl) {
      tiktokLink.style.display = 'inline-flex';
      tiktokLink.href = tiktokUrl;
      tiktokLink.removeAttribute('onclick');
      tiktokLink.target = '_blank';
      tiktokLink.rel = 'noopener noreferrer';
    } else {
      tiktokLink.style.display = 'none';
    }
  }
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
