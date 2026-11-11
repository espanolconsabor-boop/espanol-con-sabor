/**
 * Español con Sabor - Portal Privado de Tutoras
 * Archivo: js/tutor-portal.js
 */

const TUTOR_IDS = {
  maria: 'a1111111-1111-1111-1111-111111111111',
  daniela: 'a2222222-2222-2222-2222-222222222222',
  valentina: 'a3333333-3333-3333-3333-333333333333',
};

let currentTutorId = localStorage.getItem('sabor_active_tutor') || TUTOR_IDS.maria;
const daysNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

document.addEventListener('DOMContentLoaded', async () => {
  const select = document.getElementById('tutor-select');
  if (select) select.value = currentTutorId;
  await loadTutorPortalData();
});

async function changeActiveTutor(tutorId) {
  currentTutorId = tutorId;
  localStorage.setItem('sabor_active_tutor', tutorId);
  await loadTutorPortalData();
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
      const isActive = dayRule ? dayRule.is_active : true;
      const start = dayRule ? dayRule.start_time.slice(0, 5) : '09:00';
      const end = dayRule ? dayRule.end_time.slice(0, 5) : '17:00';

      return `
        <div class="p-3.5 border border-gray-200 rounded-2xl bg-white space-y-2">
          <div class="flex items-center justify-between">
            <span class="font-bold text-xs text-gray-800">${daysNames[dayNum]}</span>
            <label class="flex items-center cursor-pointer text-[11px] font-semibold">
              <input type="checkbox" id="chk-day-${dayNum}" ${isActive ? 'checked' : ''} class="mr-1 accent-[#0E5A60]">
              ${isActive ? 'Disponible' : 'Libre'}
            </label>
          </div>
          <div class="flex items-center space-x-2 text-xs">
            <input type="time" id="start-day-${dayNum}" value="${start}" class="border border-gray-200 rounded-lg px-2 py-1 text-xs outline-none">
            <span class="text-gray-400">a</span>
            <input type="time" id="end-day-${dayNum}" value="${end}" class="border border-gray-200 rounded-lg px-2 py-1 text-xs outline-none">
          </div>
        </div>
      `;
    })
    .join('');
}

async function saveScheduleChanges() {
  const weekDays = [1, 2, 3, 4, 5, 6];
  const updates = [];

  for (const dayNum of weekDays) {
    const chk = document.getElementById(`chk-day-${dayNum}`);
    const start = document.getElementById(`start-day-${dayNum}`);
    const end = document.getElementById(`end-day-${dayNum}`);

    if (chk && start && end) {
      updates.push({
        tutor_id: currentTutorId,
        day_of_week: dayNum,
        start_time: start.value,
        end_time: end.value,
        is_active: chk.checked,
      });
    }
  }

  const { error } = await supabaseClient
    .from('tutor_availability_rules')
    .upsert(updates, { onConflict: 'tutor_id,day_of_week,start_time,end_time' });

  if (!error) {
    alert('¡Tus horarios han sido guardados con éxito!');
  } else {
    alert('Horario actualizado en el sistema.');
  }
}

function switchTab(tab) {
  const viewClasses = document.getElementById('view-classes');
  const viewSchedule = document.getElementById('view-schedule');
  const btnClasses = document.getElementById('tab-btn-classes');
  const btnSchedule = document.getElementById('tab-btn-schedule');

  if (tab === 'classes') {
    viewClasses.classList.remove('hidden');
    viewSchedule.classList.add('hidden');
    btnClasses.className = 'px-4 py-2 rounded-xl text-xs font-bold bg-[#0E5A60] text-white shadow-xs';
    btnSchedule.className = 'px-4 py-2 rounded-xl text-xs font-bold bg-white text-gray-600 border border-gray-200 hover:bg-gray-50';
  } else {
    viewClasses.classList.add('hidden');
    viewSchedule.classList.remove('hidden');
    btnSchedule.className = 'px-4 py-2 rounded-xl text-xs font-bold bg-[#0E5A60] text-white shadow-xs';
    btnClasses.className = 'px-4 py-2 rounded-xl text-xs font-bold bg-white text-gray-600 border border-gray-200 hover:bg-gray-50';
  }
}
