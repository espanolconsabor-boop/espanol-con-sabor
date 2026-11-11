/**
 * Español con Sabor - Portal Privado de Tutoras
 * Archivo: js/tutor-portal.js
 */

const SESSION_KEY = 'sabor_logged_tutor_id';
let currentTutorId = sessionStorage.getItem(SESSION_KEY);
const daysNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

document.addEventListener('DOMContentLoaded', async () => {
  if (currentTutorId) {
    showDashboard();
    await loadTutorPortalData();
  } else {
    showLoginScreen();
  }
});

function showLoginScreen() {
  document.getElementById('login-modal-screen').classList.remove('hidden');
  document.getElementById('tutor-dashboard-screen').classList.add('hidden');
}

function showDashboard() {
  document.getElementById('login-modal-screen').classList.add('hidden');
  document.getElementById('tutor-dashboard-screen').classList.remove('hidden');
}

async function handleTutorLogin(e) {
  e.preventDefault();
  const select = document.getElementById('login-tutor-select');
  const pinInput = document.getElementById('login-pin-input');
  const errorMsg = document.getElementById('login-error-msg');
  const btn = document.getElementById('btn-login-submit');

  const selectedTutorId = select.value;
  const enteredPin = pinInput.value.trim();

  btn.disabled = true;
  btn.innerText = 'Verificando PIN...';
  errorMsg.classList.add('hidden');

  try {
    // Consultar el PIN de la tutora en Supabase
    const { data: tutor, error } = await supabaseClient
      .from('tutors')
      .select('id, name, access_pin')
      .eq('id', selectedTutorId)
      .single();

    if (error || !tutor) {
      throw new Error('No se encontró el registro de la tutora.');
    }

    const expectedPin = tutor.access_pin || '1234';

    if (enteredPin === expectedPin) {
      currentTutorId = tutor.id;
      sessionStorage.setItem(SESSION_KEY, tutor.id);
      showDashboard();
      await loadTutorPortalData();
    } else {
      errorMsg.classList.remove('hidden');
      errorMsg.innerText = 'Código PIN incorrecto. Por favor intenta de nuevo.';
      pinInput.value = '';
      pinInput.focus();
    }
  } catch (err) {
    errorMsg.classList.remove('hidden');
    errorMsg.innerText = err.message || 'Error de conexión. Intenta de nuevo.';
  } finally {
    btn.disabled = false;
    btn.innerText = 'Ingresar a mi Portal →';
  }
}

function handleTutorLogout() {
  sessionStorage.removeItem(SESSION_KEY);
  currentTutorId = null;
  const pinInput = document.getElementById('login-pin-input');
  if (pinInput) pinInput.value = '';
  showLoginScreen();
}

async function loadTutorPortalData() {
  await Promise.all([loadTutorProfile(), loadTutorClasses(), loadTutorSchedule()]);
}

async function loadTutorProfile() {
  const { data: tutor } = await supabaseClient
    .from('tutors')
    .select('*')
    .eq('id', currentTutorId)
    .single();

  if (!tutor) return;

  const headerName = document.getElementById('header-active-name');
  if (headerName) headerName.innerText = tutor.name;

  document.getElementById('tutor-name').innerText = tutor.name;
  document.getElementById('tutor-email').innerText = tutor.email;
  if (tutor.avatar_url) document.getElementById('tutor-avatar').src = tutor.avatar_url;

  // Google OAuth URL button
  const clientId = '986277451892-k13d7la3ftcr0huhg95h3p2bp9g2ii3s.apps.googleusercontent.com';
  const redirectUri = encodeURIComponent('https://xpmyayjtowdhrjdbezas.supabase.co/functions/v1/google-oauth-callback');
  const scope = encodeURIComponent('https://www.googleapis.com/auth/calendar.events');
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent&state=${currentTutorId}`;

  const gcalBtn = document.getElementById('connect-gcal-btn');
  if (gcalBtn) {
    if (tutor.google_refresh_token_vault) {
      gcalBtn.innerHTML = '<span>✓ Google Calendar Sincronizado</span>';
      gcalBtn.className = 'bg-emerald-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl cursor-default flex items-center space-x-1.5 shadow-sm';
      gcalBtn.href = 'javascript:void(0)';
    } else {
      gcalBtn.href = googleAuthUrl;
      gcalBtn.innerHTML = '<span>🗓️ Conectar mi Google Calendar</span>';
    }
  }
}

async function loadTutorClasses() {
  const list = document.getElementById('classes-list');
  const countEl = document.getElementById('classes-count');

  const { data: bookings, error } = await supabaseClient
    .from('bookings')
    .select('*')
    .eq('tutor_id', currentTutorId)
    .neq('status', 'cancelled')
    .order('start_time', { ascending: true });

  if (error || !bookings || bookings.length === 0) {
    if (countEl) countEl.innerText = '0';
    list.innerHTML = `
      <div class="p-12 text-center bg-white rounded-3xl border border-gray-200 text-gray-400 text-sm">
        <span class="text-3xl block mb-2">🎉</span>
        <p class="font-bold text-gray-700">No tienes clases próximas pendientes.</p>
        <p class="text-xs text-gray-400 mt-1">Cuando un alumno reserve una clase de prueba o use su membresía, aparecerá aquí.</p>
      </div>
    `;
    return;
  }

  if (countEl) countEl.innerText = bookings.length.toString();

  list.innerHTML = bookings
    .map((b) => {
      const start = new Date(b.start_time);
      const formattedDate = start.toLocaleDateString('es-ES', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      });
      const formattedTime = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const meet = b.meet_link || 'https://meet.google.com';
      const mcer = b.dynamic_responses?.mcer_level || 'No especificado';
      const goal = b.dynamic_responses?.learning_goal || 'Conversación general';

      return `
        <div class="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs hover:shadow-sm transition space-y-3">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
            <div>
              <span class="text-xs uppercase font-bold tracking-wider text-[#2A9D8F] block">
                ${b.payment_type === 'subscription_credit' ? '💎 Clase de Membresía' : '🚀 Clase de Prueba ($15 USD)'}
              </span>
              <h4 class="text-base font-bold text-gray-900 mt-0.5">${b.student_name}</h4>
              <p class="text-xs text-gray-500">${b.student_email} ${b.student_phone ? '• ' + b.student_phone : ''}</p>
            </div>
            <div class="text-left sm:text-right">
              <span class="font-bold text-gray-900 text-sm capitalize block">${formattedDate}</span>
              <span class="text-xs text-gray-500 font-medium">${formattedTime} (Hora Local)</span>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-gray-50 p-3 rounded-xl text-gray-700">
            <div><strong>Nivel MCER:</strong> ${mcer}</div>
            <div><strong>Objetivo:</strong> ${goal}</div>
          </div>

          <div class="flex items-center justify-between pt-1">
            <span class="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
              Confirmada ✓
            </span>
            <a href="${meet}" target="_blank" class="bg-[#0E5A60] hover:bg-[#093c40] text-white text-xs font-bold py-2 px-4 rounded-xl shadow-xs transition flex items-center space-x-1.5">
              <span>🎥 Entrar a Google Meet</span>
            </a>
          </div>
        </div>
      `;
    })
    .join('');
}

async function loadTutorSchedule() {
  const container = document.getElementById('schedule-rules');
  if (!container) return;

  const { data: rules } = await supabaseClient
    .from('tutor_availability_rules')
    .select('*')
    .eq('tutor_id', currentTutorId)
    .order('day_of_week', { ascending: true });

  const weekDays = [1, 2, 3, 4, 5, 6]; // Lun a Sáb

  container.innerHTML = weekDays
    .map((dayNum) => {
      const dayRule = rules?.find((r) => r.day_of_week === dayNum);
      const isAvailable = dayRule ? dayRule.is_available : dayNum <= 5;
      const start = dayRule ? dayRule.start_time.slice(0, 5) : '09:00';
      const end = dayRule ? dayRule.end_time.slice(0, 5) : '18:00';

      return `
        <div class="p-4 rounded-2xl border border-gray-200 bg-gray-50/50 space-y-2 rule-card" data-day="${dayNum}">
          <div class="flex items-center justify-between">
            <span class="font-bold text-sm text-[#0E5A60]">${daysNames[dayNum]}</span>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" class="sr-only peer day-available-chk" ${isAvailable ? 'checked' : ''} onchange="toggleDayStatus(${dayNum}, this.checked)">
              <div class="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#2A9D8F]"></div>
            </label>
          </div>

          <div class="grid grid-cols-2 gap-2 text-xs pt-1 ${isAvailable ? '' : 'opacity-40 pointer-events-none'}" id="inputs-day-${dayNum}">
            <div>
              <span class="text-gray-400 block text-[10px]">Desde</span>
              <input type="time" class="start-time-input w-full p-1.5 border border-gray-200 rounded-lg bg-white" value="${start}">
            </div>
            <div>
              <span class="text-gray-400 block text-[10px]">Hasta</span>
              <input type="time" class="end-time-input w-full p-1.5 border border-gray-200 rounded-lg bg-white" value="${end}">
            </div>
          </div>
        </div>
      `;
    })
    .join('');
}

function toggleDayStatus(dayNum, isChecked) {
  const inputs = document.getElementById(`inputs-day-${dayNum}`);
  if (inputs) {
    inputs.classList.toggle('opacity-40', !isChecked);
    inputs.classList.toggle('pointer-events-none', !isChecked);
  }
}

async function saveScheduleChanges() {
  const cards = document.querySelectorAll('.rule-card');
  const rulesToSave = [];

  cards.forEach((card) => {
    const day = parseInt(card.getAttribute('data-day'));
    const isAvailable = card.querySelector('.day-available-chk').checked;
    const start = card.querySelector('.start-time-input').value;
    const end = card.querySelector('.end-time-input').value;

    rulesToSave.push({
      tutor_id: currentTutorId,
      day_of_week: day,
      is_available: isAvailable,
      start_time: start + ':00',
      end_time: end + ':00',
    });
  });

  try {
    const { error: delErr } = await supabaseClient
      .from('tutor_availability_rules')
      .delete()
      .eq('tutor_id', currentTutorId);

    if (delErr) throw delErr;

    const { error: insErr } = await supabaseClient
      .from('tutor_availability_rules')
      .insert(rulesToSave);

    if (insErr) throw insErr;

    alert('¡Tus horarios de disponibilidad han sido guardados con éxito!');
  } catch (err) {
    alert('Error al guardar horarios: ' + err.message);
  }
}

function switchTab(tab) {
  const classesView = document.getElementById('view-classes');
  const scheduleView = document.getElementById('view-schedule');
  const tabBtnClasses = document.getElementById('tab-btn-classes');
  const tabBtnSchedule = document.getElementById('tab-btn-schedule');

  const isClasses = tab === 'classes';

  classesView.classList.toggle('hidden', !isClasses);
  scheduleView.classList.toggle('hidden', isClasses);

  if (isClasses) {
    tabBtnClasses.className = 'px-4 py-2 rounded-xl text-xs font-bold bg-[#0E5A60] text-white shadow-xs';
    tabBtnSchedule.className = 'px-4 py-2 rounded-xl text-xs font-bold bg-white text-gray-600 border border-gray-200 hover:bg-gray-50';
  } else {
    tabBtnClasses.className = 'px-4 py-2 rounded-xl text-xs font-bold bg-white text-gray-600 border border-gray-200 hover:bg-gray-50';
    tabBtnSchedule.className = 'px-4 py-2 rounded-xl text-xs font-bold bg-[#0E5A60] text-white shadow-xs';
  }
}
