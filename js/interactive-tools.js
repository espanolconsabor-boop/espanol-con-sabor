/* ===================================================
   ESPAÑOL CON SABOR — Interactive Tools Engine
   1. 2-Minute Colombian Spanish Level Quiz
   2. Interactive Colombian Slang Dictionary & Explorer
   =================================================== */

'use strict';

// ─── 1. INTERACTIVE LEVEL QUIZ ────────────────────────
const QUIZ_QUESTIONS = [
  {
    q: "You arrive in Medellín and your local host smiles and greets you: '¡Hola! ¿Quiubo, cómo vas, bien o qué?'. What is the most natural way to reply?",
    options: [
      { text: "¡Bien o qué! Todo bien, ¿y usted?", points: 1, correct: true },
      { text: "Bien, gracias, ¿y tú cómo estás?", points: 0.5 },
      { text: "No hablo español.", points: 0 },
      { text: "Hasta la vista, baby.", points: 0 }
    ]
  },
  {
    q: "You are at a traditional café in the Coffee Triangle and want a small, hot black coffee. What is the authentic Colombian phrase to ask for it?",
    options: [
      { text: "¿Me regala un tintico, por favor?", points: 1, correct: true },
      { text: "Me da un café negro americano grande.", points: 0.5 },
      { text: "Quiero una taza con agua y café.", points: 0 },
      { text: "Deme café caliente ahora.", points: 0 }
    ]
  },
  {
    q: "Your Colombian coworker says: 'Tengo mucho camello hoy, estoy súper ocupado'. What does 'camello' mean here?",
    options: [
      { text: "Hard work / a lot of tasks to complete", points: 1, correct: true },
      { text: "A desert animal with humps", points: 0 },
      { text: "A massive traffic jam on the highway", points: 0 },
      { text: "A headache from too much sun", points: 0 }
    ]
  },
  {
    q: "In a busy street market in Bogotá, your Colombian friend whispers: '¡Pilas, no des papaya!'. What advice are they giving you?",
    options: [
      { text: "Stay alert and don't make yourself an easy target", points: 1, correct: true },
      { text: "Don't eat raw tropical fruit on the street", points: 0 },
      { text: "Hurry up because the market is closing", points: 0 },
      { text: "Buy some sweet papayas for lunch", points: 0 }
    ]
  },
  {
    q: "Which sentence is grammatically correct and expresses 'I hope you have a great trip through Colombia' using authentic natural Spanish?",
    options: [
      { text: "Ojalá que tengas un viaje muy bacano.", points: 1, correct: true },
      { text: "Ojalá que tienes un gran viaje.", points: 0.5 },
      { text: "Espero que tú tener viaje bueno.", points: 0 },
      { text: "Tener buen viaje hoy tú.", points: 0 }
    ]
  }
];

let currentQuizIndex = 0;
let quizScore = 0;

function renderQuizQuestion() {
  const q = QUIZ_QUESTIONS[currentQuizIndex];
  if (!q) {
    showQuizResult();
    return;
  }

  const counterEl = document.getElementById('quiz-q-counter');
  const textEl = document.getElementById('quiz-question-text');
  const progressFill = document.getElementById('quiz-progress-fill');
  const optionsGrid = document.getElementById('quiz-options-grid');

  if (counterEl) counterEl.textContent = `Question ${currentQuizIndex + 1} of ${QUIZ_QUESTIONS.length}`;
  if (textEl) textEl.textContent = q.q;
  if (progressFill) {
    const pct = ((currentQuizIndex + 1) / QUIZ_QUESTIONS.length) * 100;
    progressFill.style.width = `${pct}%`;
  }

  if (optionsGrid) {
    const letters = ['A', 'B', 'C', 'D'];
    optionsGrid.innerHTML = q.options.map((opt, i) => `
      <button class="quiz-option-btn" onclick="selectQuizOption(${i})">
        <span class="quiz-option-letter">${letters[i]}</span>
        <span>${opt.text}</span>
      </button>
    `).join('');
  }
}

function selectQuizOption(optionIndex) {
  const q = QUIZ_QUESTIONS[currentQuizIndex];
  if (!q) return;

  const chosen = q.options[optionIndex];
  if (chosen) {
    quizScore += (chosen.points || 0);
  }

  currentQuizIndex++;
  if (currentQuizIndex < QUIZ_QUESTIONS.length) {
    renderQuizQuestion();
  } else {
    showQuizResult();
  }
}

function showQuizResult() {
  const qView = document.getElementById('quiz-question-view');
  const rView = document.getElementById('quiz-result-view');
  if (qView) qView.style.display = 'none';
  if (rView) rView.style.display = 'block';

  const badgeEl = document.getElementById('quiz-result-level-badge');
  const titleEl = document.getElementById('quiz-result-title');
  const descEl = document.getElementById('quiz-result-desc');
  const recAvatar = document.getElementById('quiz-rec-avatar');
  const recName = document.getElementById('quiz-rec-name');
  const recBio = document.getElementById('quiz-rec-bio');
  const bookBtn = document.getElementById('quiz-book-btn');

  if (quizScore <= 1.5) {
    // A1 Beginner -> Valentina Gómez
    if (badgeEl) badgeEl.textContent = 'Diagnostic: Level A1 (Beginner)';
    if (titleEl) titleEl.textContent = '🌱 You are Ready to Start Speaking!';
    if (descEl) descEl.textContent = "You're at the very beginning of an exciting journey. Colombian Spanish is the clearest and friendliest dialect in the world to start with. With our 1-on-1 personalized guidance, you'll be speaking your first full sentences from lesson one!";
    if (recAvatar) recAvatar.src = 'https://xpmyayjtowdhrjdbezas.supabase.co/storage/v1/object/public/photos/teachers/1792629035343_PHOTO-2026-09-29-11-24-29%202.jpg';
    if (recName) recName.textContent = 'Valentina Gómez (Bogotá)';
    if (recBio) recBio.textContent = 'Specialist in building zero-stress conversational foundations and pronunciation clarity.';
    if (bookBtn) {
      bookBtn.href = 'reservar.html?tutor=valentina&level=A1';
      bookBtn.textContent = '📅 Book $15 Trial with Valentina →';
    }
  } else if (quizScore <= 3) {
    // A2 Elementary -> Valentina Gómez
    if (badgeEl) badgeEl.textContent = 'Diagnostic: Level A2 (Elementary)';
    if (titleEl) titleEl.textContent = '🚀 Ready for Natural Conversation!';
    if (descEl) descEl.textContent = "You already know essential phrases and have great instincts, but you might hesitate before speaking. Your next breakthrough is building conversational momentum and authentic everyday vocabulary.";
    if (recAvatar) recAvatar.src = 'https://xpmyayjtowdhrjdbezas.supabase.co/storage/v1/object/public/photos/teachers/1792629035343_PHOTO-2026-09-29-11-24-29%202.jpg';
    if (recName) recName.textContent = 'Valentina Gómez (Bogotá)';
    if (recBio) recBio.textContent = 'Expert in breaking speaking plateaus and building rapid everyday vocabulary.';
    if (bookBtn) {
      bookBtn.href = 'reservar.html?tutor=valentina&level=A2';
      bookBtn.textContent = '📅 Book $15 Trial with Valentina →';
    }
  } else if (quizScore <= 4) {
    // B1 Intermediate -> Daniela García
    if (badgeEl) badgeEl.textContent = 'Diagnostic: Level B1 (Intermediate)';
    if (titleEl) titleEl.textContent = '⭐ Solid Fluency & Natural Rhythm!';
    if (descEl) descEl.textContent = "Impressive! You understand real Colombian idioms and subjunctive structures in context. It's time to transition from thinking in English to speaking fluidly and effortlessly like a Colombian local.";
    if (recAvatar) recAvatar.src = 'https://xpmyayjtowdhrjdbezas.supabase.co/storage/v1/object/public/photos/teachers/1792628749919_PHOTO-2026-09-19-18-15-35.jpg';
    if (recName) recName.textContent = 'Daniela García (Cartagena)';
    if (recBio) recBio.textContent = 'Master in advanced idiomatic fluency, cultural nuance, and high-energy conversational sparring.';
    if (bookBtn) {
      bookBtn.href = 'reservar.html?tutor=daniela&level=B1';
      bookBtn.textContent = '📅 Book $15 Trial with Daniela →';
    }
  } else {
    // B2+ Advanced -> María Izquierdo
    if (badgeEl) badgeEl.textContent = 'Diagnostic: Level B2+ (Advanced)';
    if (titleEl) titleEl.textContent = '🔥 ¡Qué Chimba! You Speak Like a Local!';
    if (descEl) descEl.textContent = "Outstanding! You have a deep grasp of Colombian idioms, cultural nuance, and grammar. You're ready for advanced immersion, Colombian literature, rapid-fire debates, and full professional fluency.";
    if (recAvatar) recAvatar.src = 'images/founder_avatar.jpg';
    if (recName) recName.textContent = 'María Izquierdo (Bogotá)';
    if (recBio) recBio.textContent = 'Deep-dive into regional cultural nuances, humor, debate, and nuanced native mastery.';
    if (bookBtn) {
      bookBtn.href = 'reservar.html?tutor=maria&level=B2';
      bookBtn.textContent = '📅 Book $15 Trial with María →';
    }
  }
}

function resetQuiz() {
  currentQuizIndex = 0;
  quizScore = 0;
  const qView = document.getElementById('quiz-question-view');
  const rView = document.getElementById('quiz-result-view');
  if (qView) qView.style.display = 'block';
  if (rView) rView.style.display = 'none';
  renderQuizQuestion();
}


// ─── 2. INTERACTIVE SLANG DICTIONARY ─────────────────
const COLOMBIAN_SLANG = [
  {
    word: "Parce / Parcero",
    region: "paisa",
    regionName: "Medellín (Paisa)",
    meaning: "Bro, mate, close friend, buddy",
    literal: "Short for aparcero (close partner/companion)",
    example: "— ¡Hola parce! ¿Vamos a tomar un café?",
    exampleEn: "— Hey bro! Want to grab a coffee?"
  },
  {
    word: "Una chimba",
    region: "paisa",
    regionName: "Medellín / National",
    meaning: "Awesome, incredible, really cool",
    literal: "Informal street slang originally from Antioquia",
    example: "— ¡Ese concierto de salsa estuvo una chimba!",
    exampleEn: "— That salsa concert was completely awesome!"
  },
  {
    word: "Chévere / Bacano",
    region: "national",
    regionName: "National / Colombia",
    meaning: "Cool, great, lovely, nice",
    literal: "Everyday staple expression of approval",
    example: "— Qué gente tan bacana y amable en este pueblo.",
    exampleEn: "— What wonderful, cool and friendly people in this town."
  },
  {
    word: "Dar papaya",
    region: "national",
    regionName: "National / Colombia",
    meaning: "To let your guard down / expose yourself to risk",
    literal: "To give papaya (to offer an easy fruit)",
    example: "— Guarda el teléfono en el bolsillo, ¡no des papaya!",
    exampleEn: "— Put your phone in your pocket, don't invite trouble!"
  },
  {
    word: "Desparchado / Parche",
    region: "paisa",
    regionName: "Medellín / National",
    meaning: "Parche = Friend group or hangout. Desparchado = Bored, no plans",
    literal: "Without a group / un-patched",
    example: "— Estoy desparchado hoy, ¿qué hacemos el fin de semana?",
    exampleEn: "— I have zero plans today, what are we doing this weekend?"
  },
  {
    word: "Un tintico",
    region: "paisa",
    regionName: "Medellín / Eje Cafetero",
    meaning: "A small, hot Colombian black coffee",
    literal: "Diminutive of tinto (dark/black)",
    example: "— Vecina, ¿me regala un tintico bien caliente?",
    exampleEn: "— Neighbor, could I please have a hot little black coffee?"
  },
  {
    word: "Camellar / Camello",
    region: "rolo",
    regionName: "Bogotá (Rolo) / National",
    meaning: "To work hard / a strenuous job or project",
    literal: "From camel (carrying heavy loads across desert)",
    example: "— Me toca camellar hasta tarde hoy en la oficina.",
    exampleEn: "— I have to work hard late at the office today."
  },
  {
    word: "Chicanear",
    region: "rolo",
    regionName: "Bogotá (Rolo)",
    meaning: "To show off, brag, flaunt something new",
    literal: "To boast or swagger with style",
    example: "— Santiago compró reloj nuevo y salió a chicanear.",
    exampleEn: "— Santiago bought a new watch and went out to show off."
  },
  {
    word: "Tener filo",
    region: "rolo",
    regionName: "Bogotá (Rolo)",
    meaning: "To be starving / extremely hungry",
    literal: "To have a sharp blade/edge",
    example: "— ¡Qué filo tengo! Vamos a almorzar ajiaco ya mismo.",
    exampleEn: "— I'm starving! Let's go have ajiaco for lunch right now."
  },
  {
    word: "Ala / Mi chino",
    region: "rolo",
    regionName: "Bogotá (Rolo)",
    meaning: "Ala = Oh dear / hey (posh Rolo). Mi chino = My kid / buddy",
    literal: "Traditional cachaco expressions of endearment",
    example: "— ¡Ala, qué frío tan tremendo está haciendo en Bogotá!",
    exampleEn: "— Goodness, it's so freezing in Bogotá today!"
  },
  {
    word: "Dar un borondo",
    region: "cali",
    regionName: "Cali (Valluno)",
    meaning: "To go for a leisurely stroll / take a drive around town",
    literal: "To take a spin or tour",
    example: "— Vamos a dar un borondo por San Antonio a comer empanadas.",
    exampleEn: "— Let's go take a stroll through San Antonio to eat empanadas."
  },
  {
    word: "Vaina",
    region: "costeno",
    regionName: "Caribbean (Costeño) / National",
    meaning: "Thing, stuff, situation, nuisance (universal placeholder)",
    literal: "Sheath / pod",
    example: "— ¿Qué es esa vaina que compraste en el mercado?",
    exampleEn: "— What is that thing you bought at the market?"
  },
  {
    word: "Cipote",
    region: "costeno",
    regionName: "Caribbean (Costeño)",
    meaning: "Huge, gigantic, impressive, epic",
    literal: "Costeño amplifier for size or impact",
    example: "— ¡Cipote fiesta la de anoche en Barranquilla!",
    exampleEn: "— What an enormous, epic party last night in Barranquilla!"
  },
  {
    word: "Pilas",
    region: "national",
    regionName: "National / Colombia",
    meaning: "Be sharp, pay attention, watch out!",
    literal: "Batteries (as in get charged up)",
    example: "— ¡Pilas con la maleta en la terminal de transporte!",
    exampleEn: "— Watch your suitcase closely at the bus station!"
  },
  {
    word: "Guaro",
    region: "national",
    regionName: "National / Colombia",
    meaning: "Aguardiente (Colombia's iconic anise-flavored spirit)",
    literal: "Short for aguardiente",
    example: "— ¿Nos tomamos un traguito de guaro con limón?",
    exampleEn: "— Shall we take a shot of aguardiente with lime?"
  },
  {
    word: "Pecueca",
    region: "national",
    regionName: "National (Humorous)",
    meaning: "Smelly feet (or metaphorically: something really lame)",
    literal: "Foot odor",
    example: "— Esa película estuvo muy pecueca, qué aburrición.",
    exampleEn: "— That movie was so lame, what a bore."
  }
];

let currentSlangFilter = 'all';
let currentSlangSearch = '';

function renderSlangDictionary() {
  const container = document.getElementById('slang-cards-grid');
  if (!container) return;

  const filtered = COLOMBIAN_SLANG.filter(item => {
    const matchesFilter = currentSlangFilter === 'all' || item.region === currentSlangFilter;
    const matchesSearch = !currentSlangSearch || 
      item.word.toLowerCase().includes(currentSlangSearch) ||
      item.meaning.toLowerCase().includes(currentSlangSearch) ||
      item.regionName.toLowerCase().includes(currentSlangSearch) ||
      item.example.toLowerCase().includes(currentSlangSearch);
    return matchesFilter && matchesSearch;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">
        <p style="font-size: 2rem; margin-bottom: 8px;">🔍</p>
        <p>No Colombian slang words found matching "<strong>${escapeHtml(currentSlangSearch)}</strong>".</p>
        <button class="btn-plan btn-plan--outline" onclick="resetSlangSearch()" style="margin-top: 12px; cursor: pointer;">
          Clear Search
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(item => `
    <article class="slang-card">
      <div>
        <div class="slang-card-header">
          <h3 class="slang-word">${item.word}</h3>
          <span class="slang-city-badge">${item.regionName}</span>
        </div>
        <p class="slang-meaning">💡 ${item.meaning}</p>
        <p class="slang-literal">Literal: "${item.literal}"</p>
      </div>
      <div class="slang-example">
        <div>${item.example}</div>
        <span class="slang-example-en">${item.exampleEn}</span>
      </div>
    </article>
  `).join('');
}

function filterSlangByRegion(region, btnElement) {
  currentSlangFilter = region;

  // Update active pill button
  document.querySelectorAll('.slang-filter-btn').forEach(b => b.classList.remove('active'));
  if (btnElement) btnElement.classList.add('active');

  renderSlangDictionary();
}

function handleSlangSearch(e) {
  currentSlangSearch = (e.target.value || '').trim().toLowerCase();
  renderSlangDictionary();
}

function resetSlangSearch() {
  currentSlangSearch = '';
  currentSlangFilter = 'all';
  const input = document.getElementById('slang-search-input');
  if (input) input.value = '';

  document.querySelectorAll('.slang-filter-btn').forEach(b => {
    b.classList.toggle('active', b.getAttribute('data-region') === 'all');
  });

  renderSlangDictionary();
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ─── INITIALIZATION ──────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Quiz
  renderQuizQuestion();

  // Initialize Slang Dictionary
  renderSlangDictionary();

  // Slang search input listener
  const searchInput = document.getElementById('slang-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', handleSlangSearch);
  }
});
