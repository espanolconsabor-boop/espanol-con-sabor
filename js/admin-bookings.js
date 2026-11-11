/**
 * Español con Sabor - Módulo de Clases, Agendamiento y Pagos
 * Archivo: js/admin-bookings.js
 */

async function renderBookingsManager(container) {
  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
      <div>
        <h2 style="color: #0E5A60; margin: 0 0 4px 0; font-size: 22px;">📅 Gestión de Clases & Agendamiento</h2>
        <p style="color: #666; margin: 0; font-size: 13px;">Monitoreo en tiempo real de reservas, pagos PayPal y tutoras oficiales.</p>
      </div>
      <div style="background: #e6f4ea; color: #137333; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; border: 1px solid #ceead6;">
        ● Supabase & PayPal En Vivo
      </div>
    </div>

    <!-- Sub-tabs -->
    <div style="display: flex; gap: 8px; margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
      <button onclick="switchBookingSubtab('calendar')" id="btn-subtab-calendar" class="admin-tab active" style="font-size: 13px;">🗓️ Reservas y Calendario</button>
      <button onclick="switchBookingSubtab('tutors')" id="btn-subtab-tutors" class="admin-tab" style="font-size: 13px;">👩‍🏫 Tutoras Oficiales</button>
      <button onclick="switchBookingSubtab('links')" id="btn-subtab-links" class="admin-tab" style="font-size: 13px;">🔗 Enlace de Reserva</button>
    </div>

    <div id="booking-subtab-content">
      <p style="color: #888; text-align: center; padding: 30px;">Cargando datos desde Supabase...</p>
    </div>
  `;

  // Cargar vista inicial
  await loadBookingsCalendarView();
}

async function switchBookingSubtab(subtab) {
  const calBtn = document.getElementById('btn-subtab-calendar');
  const tutBtn = document.getElementById('btn-subtab-tutors');
  const lnkBtn = document.getElementById('btn-subtab-links');

  if (calBtn) calBtn.classList.toggle('active', subtab === 'calendar');
  if (tutBtn) tutBtn.classList.toggle('active', subtab === 'tutors');
  if (lnkBtn) lnkBtn.classList.toggle('active', subtab === 'links');

  if (subtab === 'calendar') await loadBookingsCalendarView();
  if (subtab === 'tutors') await loadBookingsTutorsView();
  if (subtab === 'links') await loadBookingsLinksView();
}

async function loadBookingsCalendarView() {
  const container = document.getElementById('booking-subtab-content');
  if (!container) return;

  try {
    // 1. Obtener reservas desde Supabase
    const { data: bookings, error: bErr } = await supabaseClient
      .from('bookings')
      .select('*, tutors(name, email, color_tag)')
      .order('start_time', { ascending: false });

    // 2. Obtener tutoras para métricas
    const { data: tutors } = await supabaseClient.from('tutors').select('*');

    const totalClases = bookings ? bookings.length : 0;
    const totalIngresos = bookings
      ? bookings.reduce((acc, curr) => acc + (Number(curr.total_amount) || 0), 0)
      : 0;

    container.innerHTML = `
      <!-- Métricas Superiores -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px;">
        <div style="background: white; padding: 18px; border-radius: 12px; border: 1px solid #eaeaea; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
          <span style="font-size: 11px; text-transform: uppercase; color: #888; font-weight: 700; letter-spacing: 0.5px;">Total Reservas</span>
          <h3 style="margin: 6px 0 0 0; color: #0E5A60; font-size: 26px;">${totalClases}</h3>
        </div>
        <div style="background: white; padding: 18px; border-radius: 12px; border: 1px solid #eaeaea; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
          <span style="font-size: 11px; text-transform: uppercase; color: #888; font-weight: 700; letter-spacing: 0.5px;">Ingresos Recaudados (USD)</span>
          <h3 style="margin: 6px 0 0 0; color: #0E5A60; font-size: 26px;">$${totalIngresos.toFixed(2)}</h3>
        </div>
        <div style="background: white; padding: 18px; border-radius: 12px; border: 1px solid #eaeaea; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
          <span style="font-size: 11px; text-transform: uppercase; color: #888; font-weight: 700; letter-spacing: 0.5px;">Tutoras Activas</span>
          <h3 style="margin: 6px 0 0 0; color: #0E5A60; font-size: 26px;">${tutors ? tutors.length : 3}</h3>
        </div>
      </div>

      <!-- Tabla de Reservas -->
      <div style="background: white; border-radius: 12px; border: 1px solid #eaeaea; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.04);">
        <div style="padding: 16px; border-bottom: 1px solid #eee; background: #fafafa; font-weight: 600; font-size: 14px; color: #333;">
          Historial de Clases Agendadas
        </div>

        ${
          !bookings || bookings.length === 0
            ? `<div style="text-align: center; padding: 40px; color: #888;">
                <span style="font-size: 32px; display: block; margin-bottom: 8px;">🗓️</span>
                Aún no hay reservas registradas en la base de datos.<br>
                <small style="color: #aaa;">Las nuevas reservas de los alumnos aparecerán aquí automáticamente.</small>
              </div>`
            : `<table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 13px;">
                <thead>
                  <tr style="background: #fdfdfd; border-bottom: 1px solid #eee; color: #777;">
                    <th style="padding: 12px 16px;">Estudiante</th>
                    <th style="padding: 12px 16px;">Tutora</th>
                    <th style="padding: 12px 16px;">Fecha y Hora</th>
                    <th style="padding: 12px 16px;">Modalidad</th>
                    <th style="padding: 12px 16px;">Google Meet</th>
                    <th style="padding: 12px 16px;">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  ${bookings
                    .map(
                      (b) => `
                    <tr style="border-bottom: 1px solid #f3f3f3;">
                      <td style="padding: 12px 16px;">
                        <strong>${b.student_name}</strong><br>
                        <span style="font-size: 11px; color: #777;">${b.student_email}</span>
                      </td>
                      <td style="padding: 12px 16px;">
                        <span style="background: ${b.tutors?.color_tag || '#0E5A60'}; color: white; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 600;">
                          ${b.tutors?.name || 'Tutora'}
                        </span>
                      </td>
                      <td style="padding: 12px 16px;">
                        ${new Date(b.start_time).toLocaleDateString('es-ES', { weekday: 'short', month: 'short', day: 'numeric' })}<br>
                        <span style="font-size: 11px; color: #777;">${new Date(b.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </td>
                      <td style="padding: 12px 16px;">
                        ${b.payment_type === 'subscription_credit' ? '<span style="color: #137333; font-weight: 600;">Crédito Membresía</span>' : `<span style="color: #1a73e8; font-weight: 600;">$${b.total_amount} USD (PayPal)</span>`}
                      </td>
                      <td style="padding: 12px 16px;">
                        ${b.meet_link ? `<a href="${b.meet_link}" target="_blank" style="color: #0E5A60; font-weight: 600; text-decoration: underline;">Abrir Meet ↗</a>` : '<span style="color: #aaa;">Pendiente</span>'}
                      </td>
                      <td style="padding: 12px 16px;">
                        <span style="background: ${b.status === 'confirmed' ? '#e6f4ea' : '#fce8e6'}; color: ${b.status === 'confirmed' ? '#137333' : '#c5221f'}; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 600;">
                          ${b.status}
                        </span>
                      </td>
                    </tr>
                  `
                    )
                    .join('')}
                </tbody>
              </table>`
        }
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<p style="color: red; padding: 20px;">Error al cargar reservas: ${err.message}</p>`;
  }
}

async function loadBookingsTutorsView() {
  const container = document.getElementById('booking-subtab-content');
  if (!container) return;

  const { data: tutors } = await supabaseClient.from('tutors').select('*');

  container.innerHTML = `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px;">
      ${(tutors || [])
        .map(
          (t) => `
        <div style="background: white; border: 1px solid #eaeaea; border-radius: 14px; padding: 20px; box-shadow: 0 1px 4px rgba(0,0,0,0.04);">
          <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 14px;">
            <img src="${t.avatar_url || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2'}" style="width: 56px; height: 56px; border-radius: 50%; object-cover: cover; border: 2px solid ${t.color_tag};" />
            <div>
              <h4 style="margin: 0; color: #111; font-size: 16px;">${t.name}</h4>
              <p style="margin: 2px 0 0 0; color: #666; font-size: 12px;">${t.email}</p>
            </div>
          </div>
          <p style="font-size: 12px; color: #2A9D8F; font-weight: 600; margin: 0 0 8px 0;">${t.headline || 'Tutora Oficial'}</p>
          <p style="font-size: 12px; color: #555; line-height: 1.5; margin: 0 0 16px 0;">${t.bio || ''}</p>
          <div style="padding-top: 12px; border-top: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; font-size: 12px;">
            <span>Tarifa: <strong style="color: #0E5A60;">$${t.hourly_rate} USD</strong> / clase</span>
            <span style="background: #e6f4ea; color: #137333; padding: 2px 8px; border-radius: 4px; font-weight: 600;">Activa</span>
          </div>
        </div>
      `
        )
        .join('')}
    </div>
  `;
}

async function loadBookingsLinksView() {
  const container = document.getElementById('booking-subtab-content');
  if (!container) return;

  const embedCode = `<script src="https://espanolconsabor.pages.dev/embed.js" defer></script>\\n<sabor-booking-widget slug="clase-individual-60min"></sabor-booking-widget>`;

  container.innerHTML = `
    <div style="background: white; border: 1px solid #eaeaea; border-radius: 14px; padding: 24px; max-width: 800px;">
      <h3 style="margin: 0 0 8px 0; color: #0E5A60;">Código de Incrustación (Embed)</h3>
      <p style="color: #666; font-size: 13px; margin: 0 0 16px 0;">
        Copia este código para mostrar el agendador interactivo en cualquier página de tu sitio web:
      </p>

      <pre style="background: #1e293b; color: #f8fafc; padding: 16px; border-radius: 8px; font-size: 12px; overflow-x: auto; font-family: monospace;">${embedCode}</pre>

      <button onclick="navigator.clipboard.writeText('${embedCode.replace(/\\n/g, '\n')}'); alert('¡Código copiado al portapapeles!');" style="background: #0E5A60; color: white; border: none; padding: 10px 18px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; margin-top: 12px;">
        Copiar Código 📋
      </button>
    </div>
  `;
}
