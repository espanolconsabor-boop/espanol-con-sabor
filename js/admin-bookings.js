/**
 * Español con Sabor - Módulo de Clases, Agendamiento y Pagos
 * Archivo: js/admin-bookings.js
 */

async function renderBookingsManager(container) {
  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
      <div>
        <h2 style="color: #0E5A60; margin: 0 0 4px 0; font-size: 22px;">📅 Gestión de Clases & Agendamiento</h2>
        <p style="color: #666; margin: 0; font-size: 13px;">Monitoreo en tiempo real de reservas, pagos Rapyd y tutoras oficiales.</p>
      </div>
      <div style="background: #e6f4ea; color: #137333; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; border: 1px solid #ceead6;">
        ● Supabase & Rapyd En Vivo
      </div>
    </div>

    <!-- Sub-tabs -->
    <div style="display: flex; gap: 8px; margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px; overflow-x: auto;">
      <button onclick="switchBookingSubtab('calendar')" id="btn-subtab-calendar" class="admin-tab active" style="font-size: 13px;">🗓️ Reservas y Calendario</button>
      <button onclick="switchBookingSubtab('subscriptions')" id="btn-subtab-subs" class="admin-tab" style="font-size: 13px;">💳 Suscripciones Mensuales</button>
      <button onclick="switchBookingSubtab('tutors')" id="btn-subtab-tutors" class="admin-tab" style="font-size: 13px;">👩‍🏫 Tutoras Oficiales</button>
      <button onclick="switchBookingSubtab('links')" id="btn-subtab-links" class="admin-tab" style="font-size: 13px;">🔗 Enlaces de Reserva</button>
    </div>

    <div id="booking-subtab-content">
      <p style="color: #888; text-align: center; padding: 30px;">Cargando datos desde Supabase...</p>
    </div>

    <!-- Modal Editar Tutora -->
    <div id="modal-edit-tutor" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 9999; align-items: center; justify-content: center; padding: 16px;">
      <div style="background: white; border-radius: 16px; width: 100%; max-width: 520px; max-height: 90vh; overflow-y: auto; padding: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid #eee; padding-bottom: 12px;">
          <h3 id="modal-tutor-title" style="margin: 0; color: #0E5A60; font-size: 18px;">Editar Perfil de Tutora</h3>
          <button onclick="closeTutorModal()" style="background: none; border: none; font-size: 20px; cursor: pointer; color: #888;">&times;</button>
        </div>
        <form id="form-edit-tutor" onsubmit="saveTutorChanges(event)" style="display: flex; flex-direction: column; gap: 14px;">
          <input type="hidden" id="edit-tutor-id" />
          
          <div>
            <label style="display: block; font-size: 12px; font-weight: 700; color: #333; margin-bottom: 4px;">Nombre Completo</label>
            <input type="text" id="edit-tutor-name" required style="width: 100%; padding: 8px 12px; border: 1px solid #ccc; border-radius: 8px; font-size: 13px; box-sizing: border-box;" />
          </div>

          <div>
            <label style="display: block; font-size: 12px; font-weight: 700; color: #333; margin-bottom: 4px;">Correo Electrónico (Notificaciones & Google Cal)</label>
            <input type="email" id="edit-tutor-email" required style="width: 100%; padding: 8px 12px; border: 1px solid #ccc; border-radius: 8px; font-size: 13px; box-sizing: border-box;" />
          </div>

          <div>
            <label style="display: block; font-size: 12px; font-weight: 700; color: #333; margin-bottom: 4px;">Foto de Perfil (Reservas & Portal)</label>
            <input type="file" id="edit-tutor-file" accept="image/*" style="font-size: 12px; margin-bottom: 6px; width: 100%;" />
            <input type="url" id="edit-tutor-avatar" placeholder="O pega el enlace de la imagen (https://...)" oninput="document.getElementById('edit-tutor-avatar-preview').src = this.value" style="width: 100%; padding: 8px 12px; border: 1px solid #ccc; border-radius: 8px; font-size: 13px; box-sizing: border-box;" />
            <div style="display: flex; align-items: center; gap: 10px; margin-top: 6px;">
              <img id="edit-tutor-avatar-preview" src="" style="width: 48px; height: 48px; border-radius: 50%; object-fit: cover; border: 2px solid #0E5A60;" />
              <span style="font-size: 11px; color: #666;">Vista previa perfil</span>
            </div>
          </div>

          <div>
            <label style="display: block; font-size: 12px; font-weight: 700; color: #0E5A60; margin-bottom: 4px;">🖼️ Foto Especial para Home (Opcional - Imagen distinta para el inicio)</label>
            <input type="file" id="edit-tutor-home-file" accept="image/*" style="font-size: 12px; margin-bottom: 6px; width: 100%;" />
            <input type="url" id="edit-tutor-home-avatar" placeholder="O pega el enlace de la imagen para Home (https://...)" oninput="document.getElementById('edit-tutor-home-preview').src = this.value" style="width: 100%; padding: 8px 12px; border: 1px solid #ccc; border-radius: 8px; font-size: 13px; box-sizing: border-box;" />
            <div style="display: flex; align-items: center; gap: 10px; margin-top: 6px;">
              <img id="edit-tutor-home-preview" src="" style="width: 48px; height: 48px; border-radius: 10px; object-fit: cover; border: 2px solid #2A9D8F;" />
              <span style="font-size: 11px; color: #666;">Vista previa Home (si no subes una, se usará la foto de perfil)</span>
            </div>
          </div>

          <div>
            <label style="display: block; font-size: 12px; font-weight: 700; color: #0E5A60; margin-bottom: 4px;">🎬 Video de YouTube (Presentación en About Us)</label>
            <input type="url" id="edit-tutor-video-url" placeholder="https://www.youtube.com/watch?v=... o https://youtu.be/..." style="width: 100%; padding: 8px 12px; border: 1px solid #ccc; border-radius: 8px; font-size: 13px; box-sizing: border-box;" />
            <small style="display: block; font-size: 11px; color: #666; margin-top: 4px;">Pega el enlace del video de YouTube donde la tutora se presenta para que los alumnos escuchen su voz y acento.</small>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div>
              <label style="display: block; font-size: 12px; font-weight: 700; color: #333; margin-bottom: 4px;">Calificación ⭐ (0.0 a 5.0)</label>
              <input type="number" id="edit-tutor-rating" step="0.1" min="1" max="5" value="5.0" required style="width: 100%; padding: 8px 12px; border: 1px solid #ccc; border-radius: 8px; font-size: 13px; font-weight: 700; color: #0E5A60; box-sizing: border-box;" />
            </div>
            <div>
              <label style="display: block; font-size: 12px; font-weight: 700; color: #333; margin-bottom: 4px;">Código PIN de Acceso</label>
              <input type="text" id="edit-tutor-pin" maxlength="6" required placeholder="Ej: 1024" style="width: 100%; padding: 8px 12px; border: 1px solid #ccc; border-radius: 8px; font-size: 13px; font-weight: 700; letter-spacing: 2px; color: #0E5A60; box-sizing: border-box;" />
            </div>
          </div>

          <div>
            <label style="display: block; font-size: 12px; font-weight: 700; color: #333; margin-bottom: 4px;">Especialidad / Título</label>
            <input type="text" id="edit-tutor-headline" placeholder="Ej: Conversación, Cultura & DELE" style="width: 100%; padding: 8px 12px; border: 1px solid #ccc; border-radius: 8px; font-size: 13px; box-sizing: border-box;" />
          </div>

          <div>
            <label style="display: block; font-size: 12px; font-weight: 700; color: #333; margin-bottom: 4px;">Biografía / Descripción Breve</label>
            <textarea id="edit-tutor-bio" rows="3" style="width: 100%; padding: 8px 12px; border: 1px solid #ccc; border-radius: 8px; font-size: 13px; box-sizing: border-box;"></textarea>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 12px; border-top: 1px solid #eee; padding-top: 14px;">
            <button type="button" onclick="closeTutorModal()" style="padding: 8px 16px; border: 1px solid #ccc; background: white; border-radius: 8px; font-size: 13px; cursor: pointer;">Cancelar</button>
            <button type="submit" id="btn-save-tutor" style="padding: 8px 18px; border: none; background: #0E5A60; color: white; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer;">Guardar Cambios ✓</button>
          </div>
        </form>
      </div>
    </div>
  `;

  // Cargar vista inicial
  await loadBookingsCalendarView();
}

async function switchBookingSubtab(subtab) {
  const calBtn = document.getElementById('btn-subtab-calendar');
  const subsBtn = document.getElementById('btn-subtab-subs');
  const tutBtn = document.getElementById('btn-subtab-tutors');
  const lnkBtn = document.getElementById('btn-subtab-links');

  if (calBtn) calBtn.classList.toggle('active', subtab === 'calendar');
  if (subsBtn) subsBtn.classList.toggle('active', subtab === 'subscriptions');
  if (tutBtn) tutBtn.classList.toggle('active', subtab === 'tutors');
  if (lnkBtn) lnkBtn.classList.toggle('active', subtab === 'links');

  if (subtab === 'calendar') await loadBookingsCalendarView();
  if (subtab === 'subscriptions') await loadBookingsSubscriptionsView();
  if (subtab === 'tutors') await loadBookingsTutorsView();
  if (subtab === 'links') await loadBookingsLinksView();
}

async function loadBookingsSubscriptionsView() {
  const container = document.getElementById('booking-subtab-content');
  if (!container) return;

  container.innerHTML = `<p style="color: #888; text-align: center; padding: 30px;">Cargando suscripciones desde Supabase...</p>`;

  try {
    const { data: subs, error } = await supabaseClient
      .from('subscriptions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (!subs || subs.length === 0) {
      container.innerHTML = `
        <div style="background: white; border: 1px solid #eee; border-radius: 12px; padding: 40px; text-align: center;">
          <div style="font-size: 40px; margin-bottom: 12px;">💳</div>
          <h3 style="color: #0E5A60; margin: 0 0 8px;">Aún no hay suscripciones registradas</h3>
          <p style="color: #666; font-size: 13px; max-width: 520px; margin: 0 auto; line-height: 1.5;">
            Cuando los estudiantes adquieran el Plan Andina ($68), Cafetera ($128) o Caribeña ($180) vía PayPal, aparecerán aquí automáticamente con sus créditos disponibles y fechas de renovación.
          </p>
        </div>
      `;
      return;
    }

    let html = `
      <div style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-weight: 700; color: #0E5A60; font-size: 14px;">Total Suscripciones: ${subs.length}</span>
        <button onclick="loadBookingsSubscriptionsView()" style="background: white; border: 1px solid #ccc; border-radius: 8px; padding: 6px 12px; font-size: 12px; cursor: pointer; font-weight: 600;">🔄 Actualizar</button>
      </div>
      <div style="background: white; border: 1px solid #eee; border-radius: 12px; overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; text-align: left;">
          <thead>
            <tr style="background: #f8fafc; border-bottom: 1px solid #eee; color: #64748b;">
              <th style="padding: 12px 16px;">Estudiante</th>
              <th style="padding: 12px 16px;">Plan</th>
              <th style="padding: 12px 16px;">Créditos Ciclo</th>
              <th style="padding: 12px 16px;">Próxima Renovación</th>
              <th style="padding: 12px 16px;">Estado</th>
              <th style="padding: 12px 16px;">ID PayPal</th>
            </tr>
          </thead>
          <tbody>
    `;

    subs.forEach(s => {
      const isActive = s.status === 'active' && new Date(s.current_period_end) >= new Date();
      const statusBadge = isActive ?
        `<span style="background: #dcfce7; color: #15803d; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 700;">🟢 Activa</span>` :
        `<span style="background: #fee2e2; color: #b91c1c; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 700;">🔴 ${s.status}</span>`;

      const renewDate = s.current_period_end ? new Date(s.current_period_end).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A';

      html += `
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 12px 16px;">
            <strong style="color: #0E5A60;">${s.student_name || 'Estudiante'}</strong><br/>
            <span style="color: #64748b; font-size: 11px;">${s.student_email}</span>
          </td>
          <td style="padding: 12px 16px; font-weight: 600; color: #0E5A60;">${s.plan_name || 'Plan Mensual'}</td>
          <td style="padding: 12px 16px;">
            <span style="font-weight: 800; color: #0E5A60;">${s.credits_remaining}</span> / ${s.credits_per_cycle} disponibles
          </td>
          <td style="padding: 12px 16px; color: #334155;">${renewDate}</td>
          <td style="padding: 12px 16px;">${statusBadge}</td>
          <td style="padding: 12px 16px;">
            <code style="background: #f1f5f9; padding: 3px 6px; border-radius: 4px; font-size: 11px; color: #475569;">${s.paypal_subscription_id}</code>
          </td>
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>
      </div>
    `;

    container.innerHTML = html;
  } catch (err) {
    container.innerHTML = `<p style="color: red; text-align: center; padding: 20px;">Error al cargar suscripciones: ${err.message}</p>`;
  }
}

async function loadBookingsCalendarView() {
  const container = document.getElementById('booking-subtab-content');
  if (!container) return;

  try {
    const { data: bookings } = await supabaseClient
      .from('bookings')
      .select('*, tutors(name, email, color_tag)')
      .order('start_time', { ascending: false });

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
        <div style="padding: 16px; border-bottom: 1px solid #eee; background: #fafafa; font-weight: 600; font-size: 14px; color: #333; display: flex; justify-content: space-between; align-items: center;">
          <span>Historial de Clases Agendadas</span>
          <button onclick="loadBookingsCalendarView()" style="background: none; border: 1px solid #ddd; padding: 4px 10px; border-radius: 6px; font-size: 12px; cursor: pointer; color: #555;">🔄 Actualizar</button>
        </div>

        ${
          !bookings || bookings.length === 0
            ? `<div style="text-align: center; padding: 40px; color: #888;">
                <span style="font-size: 32px; display: block; margin-bottom: 8px;">🗓️</span>
                Aún no hay reservas registradas.<br>
                <small style="color: #aaa;">Las nuevas reservas realizadas a través del módulo en inglés aparecerán aquí automáticamente.</small>
              </div>`
            : `<div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 13px;">
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
                          <strong>${b.student_name || 'Estudiante'}</strong><br>
                          <span style="font-size: 11px; color: #777;">${b.student_email || ''}</span>
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
                          ${b.payment_type === 'subscription_credit' ? '<span style="color: #137333; font-weight: 600;">Membresía (Crédito)</span>' : `<span style="color: #0E5A60; font-weight: 600;">$${b.total_amount || 15} USD (Rapyd)</span>`}
                        </td>
                        <td style="padding: 12px 16px;">
                          ${b.meet_link ? `<a href="${b.meet_link}" target="_blank" style="color: #0E5A60; font-weight: 600; text-decoration: underline;">🎥 Abrir Meet</a>` : '<span style="color: #aaa;">Pendiente</span>'}
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
                </table>
              </div>`
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

  const { data: tutors } = await supabaseClient.from('tutors').select('*').order('name');

  window._saborTutorsCache = tutors || [];

  container.innerHTML = `
    <div style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
      <p style="color: #666; font-size: 13px; margin: 0;">Gestiona la información de las tutoras oficiales, sus fotos, tarifas y códigos de acceso.</p>
    </div>

    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px;">
      ${(tutors || [])
        .map(
          (t) => `
        <div style="background: white; border: 1px solid #eaeaea; border-radius: 16px; padding: 22px; box-shadow: 0 1px 4px rgba(0,0,0,0.04); display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
              <div style="display: flex; align-items: center; gap: 14px;">
                <img src="${t.avatar_url || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2'}" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover; border: 2px solid #0E5A60;" />
                <div>
                  <h4 style="margin: 0; color: #0E5A60; font-size: 17px; font-weight: 800;">${t.name}</h4>
                  <p style="margin: 2px 0 0 0; color: #777; font-size: 12px;">${t.email}</p>
                </div>
              </div>
              <span style="background: #e6f4ea; color: #137333; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 700;">Activa</span>
            </div>

            <p style="font-size: 12px; color: #2A9D8F; font-weight: 700; margin: 0 0 6px 0;">${t.headline || 'Tutora Oficial de Español'}</p>
            <p style="font-size: 12px; color: #555; line-height: 1.5; margin: 0 0 16px 0;">${t.bio || 'Especialista en conversación y cultura colombiana.'}</p>
          </div>

          <div style="padding-top: 14px; border-top: 1px solid #f0f0f0;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; font-size: 12px;">
              <span>⭐ Calificación: <strong style="color: #0E5A60; font-size: 13px;">${parseFloat(t.rating || 5.0).toFixed(1)} / 5.0</strong></span>
              <span style="background: #FFF3D6; color: #0E5A60; padding: 3px 8px; border-radius: 6px; font-weight: 700; font-size: 11px; border: 1px solid #F2B705/30;">PIN Portal: <strong>${t.access_pin || '1234'}</strong></span>
            </div>
            <button onclick="openTutorModal('${t.id}')" style="width: 100%; padding: 8px 14px; background: #0E5A60; color: white; border: none; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer; transition: 0.2s;">
              ✏️ Editar Datos, Calificación & Foto
            </button>
          </div>
        </div>
      `
        )
        .join('')}
    </div>
  `;
}

function openTutorModal(tutorId) {
  const tutor = (window._saborTutorsCache || []).find((t) => t.id === tutorId);
  if (!tutor) return;

  document.getElementById('edit-tutor-id').value = tutor.id;
  document.getElementById('edit-tutor-name').value = tutor.name || '';
  document.getElementById('edit-tutor-email').value = tutor.email || '';
  document.getElementById('edit-tutor-avatar').value = tutor.avatar_url || '';
  document.getElementById('edit-tutor-avatar-preview').src = tutor.avatar_url || '';
  document.getElementById('edit-tutor-home-avatar').value = tutor.home_avatar_url || '';
  document.getElementById('edit-tutor-home-preview').src = tutor.home_avatar_url || tutor.avatar_url || '';
  document.getElementById('edit-tutor-video-url').value = tutor.video_url || '';
  document.getElementById('edit-tutor-rating').value = (parseFloat(tutor.rating) || 5.0).toFixed(1);
  document.getElementById('edit-tutor-pin').value = tutor.access_pin || '1234';
  document.getElementById('edit-tutor-headline').value = tutor.headline || '';
  document.getElementById('edit-tutor-bio').value = tutor.bio || '';
  const fileInput = document.getElementById('edit-tutor-file');
  if (fileInput) fileInput.value = '';
  const homeFileInput = document.getElementById('edit-tutor-home-file');
  if (homeFileInput) homeFileInput.value = '';

  const modal = document.getElementById('modal-edit-tutor');
  modal.style.display = 'flex';
}

function closeTutorModal() {
  const modal = document.getElementById('modal-edit-tutor');
  if (modal) modal.style.display = 'none';
}

async function saveTutorChanges(e) {
  e.preventDefault();
  const btn = document.getElementById('btn-save-tutor');
  btn.disabled = true;
  btn.innerText = 'Guardando en Supabase...';

  const tutorId = document.getElementById('edit-tutor-id').value;
  let avatarUrl = document.getElementById('edit-tutor-avatar').value.trim();
  const fileInput = document.getElementById('edit-tutor-file');
  let homeAvatarUrl = document.getElementById('edit-tutor-home-avatar').value.trim();
  const homeFileInput = document.getElementById('edit-tutor-home-file');
  const videoUrlVal = document.getElementById('edit-tutor-video-url').value.trim();

  try {
    if (fileInput && fileInput.files && fileInput.files[0]) {
      btn.innerText = 'Subiendo foto a Supabase...';
      const file = fileInput.files[0];
      const fileName = `teachers/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabaseClient.storage.from('photos').upload(fileName, file);
      if (uploadError) throw new Error('Error subiendo foto: ' + uploadError.message);
      const { data: urlData } = supabaseClient.storage.from('photos').getPublicUrl(fileName);
      avatarUrl = urlData.publicUrl;
    }

    if (homeFileInput && homeFileInput.files && homeFileInput.files[0]) {
      btn.innerText = 'Subiendo foto de Home a Supabase...';
      const file = homeFileInput.files[0];
      const fileName = `teachers/home_${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabaseClient.storage.from('photos').upload(fileName, file);
      if (uploadError) throw new Error('Error subiendo foto de Home: ' + uploadError.message);
      const { data: urlData } = supabaseClient.storage.from('photos').getPublicUrl(fileName);
      homeAvatarUrl = urlData.publicUrl;
    }

    const ratingNum = parseFloat(document.getElementById('edit-tutor-rating').value) || 5.0;
    const nameVal = document.getElementById('edit-tutor-name').value.trim();
    const emailVal = document.getElementById('edit-tutor-email').value.trim();
    const pinVal = document.getElementById('edit-tutor-pin').value.trim();
    const headlineVal = document.getElementById('edit-tutor-headline').value.trim();
    const bioVal = document.getElementById('edit-tutor-bio').value.trim();

    const updates = {
      name: nameVal,
      email: emailVal,
      avatar_url: avatarUrl,
      home_avatar_url: homeAvatarUrl || null,
      video_url: videoUrlVal || null,
      rating: ratingNum,
      access_pin: pinVal,
      headline: headlineVal,
      bio: bioVal,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabaseClient.from('tutors').update(updates).eq('id', tutorId);
    if (error) throw error;

    // Sync to teachers table if present
    try {
      const firstName = nameVal.split(' ')[0];
      const teacherUpdates = {
        name: nameVal,
        photo_url: avatarUrl,
        home_avatar_url: homeAvatarUrl || null,
        video_url: videoUrlVal || null,
        bio: headlineVal || bioVal,
        rating: ratingNum
      };
      await supabaseClient.from('teachers').update(teacherUpdates).ilike('name', `%${firstName}%`);
    } catch (syncErr) {
      console.warn('Sync to teachers table skipped:', syncErr);
    }

    alert('¡Datos de la tutora actualizados con éxito en Supabase!');
    closeTutorModal();
    await loadBookingsTutorsView();
  } catch (err) {
    alert('Error al guardar: ' + err.message);
  } finally {
    btn.disabled = false;
    btn.innerText = 'Guardar Cambios ✓';
  }
}

async function loadBookingsLinksView() {
  const container = document.getElementById('booking-subtab-content');
  if (!container) return;

  const origin = window.location.origin;

  const links = [
    // CLASES DE PRUEBA
    {
      title: 'Clase de Prueba General (30 Min — $15 USD)',
      desc: 'El estudiante elige libremente entre cualquier tutora o asignación automática.',
      url: `${origin}/reservar.html`,
      badge: 'Prueba $15',
    },
    {
      title: 'Clase de Prueba — María Izquierdo',
      desc: 'Abre el agendador directamente preseleccionando a María para su clase de prueba.',
      url: `${origin}/reservar.html?tutor=maria`,
      badge: 'Prueba María',
    },
    {
      title: 'Clase de Prueba — Daniela García',
      desc: 'Abre el agendador directamente preseleccionando a Daniela para su clase de prueba.',
      url: `${origin}/reservar.html?tutor=daniela`,
      badge: 'Prueba Daniela',
    },
    {
      title: 'Clase de Prueba — Valentina Gómez',
      desc: 'Abre el agendador directamente preseleccionando a Valentina para su clase de prueba.',
      url: `${origin}/reservar.html?tutor=valentina`,
      badge: 'Prueba Valentina',
    },

    // PLANES DE SUSCRIPCIÓN MENSUAL (PAGOS RECURRENTES)
    {
      title: '💳 Suscripción Plan Andina ($68 USD / mes)',
      desc: '4 clases individuales al mes (50 min c/u) con tutora nativa. Permite agendar las 4 clases en una sola sesión.',
      url: `${origin}/reservar.html?plan=andina`,
      badge: 'Plan $68/mes (4 clases)',
    },
    {
      title: '💳 Suscripción Plan Cafetera ($128 USD / mes — Más Popular)',
      desc: '8 clases individuales al mes (50 min c/u) con tutora nativa. Permite agendar las 8 clases en una sola sesión.',
      url: `${origin}/reservar.html?plan=cafetera`,
      badge: 'Plan $128/mes (8 clases)',
    },
    {
      title: '💳 Suscripción Plan Caribeña ($180 USD / mes — Inmersivo)',
      desc: '12 clases individuales al mes (50 min c/u) con tutora nativa dedicada. Permite agendar las 12 clases en una sola sesión.',
      url: `${origin}/reservar.html?plan=caribena`,
      badge: 'Plan $180/mes (12 clases)',
    },

    // PORTAL TUTORAS
    {
      title: 'Portal Privado de Tutoras (Protegido por PIN)',
      desc: 'Espacio donde cada tutora ingresa con su PIN para sincronizar su Google Calendar y ver sus alumnos.',
      url: `${origin}/tutor.html`,
      badge: 'Acceso Privado',
    },
  ];

  container.innerHTML = `
    <div style="max-width: 900px; display: flex; flex-direction: column; gap: 24px;">

      <!-- GENERADOR DE ENLACES CON TARIFA PERSONALIZADA -->
      <div style="background: linear-gradient(135deg, #0E5A60 0%, #164e63 100%); color: white; border-radius: 16px; padding: 24px; box-shadow: 0 4px 14px rgba(14,90,96,0.2);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
          <div>
            <h3 style="margin: 0; color: #F2C94C; font-size: 18px; font-weight: 800;">🪄 Generador de Enlaces con Tarifa Personalizada</h3>
            <p style="color: #e2e8f0; font-size: 13px; margin: 4px 0 0 0;">
              Crea links únicos para alumnos antiguos con su tarifa especial acordada (ej: $68, $120, $180 USD).
            </p>
          </div>
          <span style="background: rgba(242,201,76,0.2); color: #F2C94C; border: 1px solid #F2C94C; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 800;">Alumnos Antiguos</span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-top: 16px;">
          <div>
            <label style="display: block; font-size: 11px; font-weight: 700; color: #cbd5e1; margin-bottom: 4px;">Concepto / Título:</label>
            <input type="text" id="gen-title" value="Tarifa Especial Alumno Antiguo" oninput="updateCustomGeneratedLink()" style="width: 100%; padding: 8px 12px; font-size: 12px; border-radius: 8px; border: 1px solid #475569; background: #0f172a; color: white; box-sizing: border-box;" />
          </div>

          <div>
            <label style="display: block; font-size: 11px; font-weight: 700; color: #cbd5e1; margin-bottom: 4px;">Tarifa en USD ($):</label>
            <input type="number" id="gen-price" value="68" min="1" step="1" oninput="updateCustomGeneratedLink()" style="width: 100%; padding: 8px 12px; font-size: 12px; border-radius: 8px; border: 1px solid #475569; background: #0f172a; color: white; box-sizing: border-box;" />
          </div>

          <div>
            <label style="display: block; font-size: 11px; font-weight: 700; color: #cbd5e1; margin-bottom: 4px;">Tutora Asignada:</label>
            <select id="gen-tutor" onchange="updateCustomGeneratedLink()" style="width: 100%; padding: 8px 12px; font-size: 12px; border-radius: 8px; border: 1px solid #475569; background: #0f172a; color: white; box-sizing: border-box;">
              <option value="">Cualquier Tutora Disponible</option>
              <option value="maria">María Izquierdo</option>
              <option value="daniela">Daniela García</option>
              <option value="valentina">Valentina Gómez</option>
            </select>
          </div>

          <div>
            <label style="display: block; font-size: 11px; font-weight: 700; color: #cbd5e1; margin-bottom: 4px;">Nombre Alumno (opcional):</label>
            <input type="text" id="gen-name" placeholder="Ej: John Doe" oninput="updateCustomGeneratedLink()" style="width: 100%; padding: 8px 12px; font-size: 12px; border-radius: 8px; border: 1px solid #475569; background: #0f172a; color: white; box-sizing: border-box;" />
          </div>

          <div>
            <label style="display: block; font-size: 11px; font-weight: 700; color: #cbd5e1; margin-bottom: 4px;">Número de Clases:</label>
            <select id="gen-classes" onchange="updateCustomGeneratedLink()" style="width: 100%; padding: 8px 12px; font-size: 12px; border-radius: 8px; border: 1px solid #475569; background: #0f172a; color: white; box-sizing: border-box;">
              <option value="1">1 Clase Individual (50 min)</option>
              <option value="4" selected>4 Clases (Suscripción Andina)</option>
              <option value="8">8 Clases (Suscripción Cafetera)</option>
              <option value="12">12 Clases (Suscripción Caribeña)</option>
            </select>
          </div>
        </div>

        <div style="margin-top: 16px; background: rgba(0,0,0,0.25); border-radius: 12px; padding: 12px; border: 1px solid rgba(255,255,255,0.1);">
          <span style="font-size: 11px; color: #F2C94C; font-weight: 700; display: block; margin-bottom: 6px;">Enlace Personalizado Listo:</span>
          <div style="display: flex; gap: 8px;">
            <input type="text" readonly id="gen-output-url" style="flex: 1; padding: 8px 12px; font-size: 12px; background: white; border-radius: 8px; border: none; color: #0E5A60; font-weight: 600;" />
            <button onclick="copyGeneratedCustomLink()" style="background: #F2B705; color: #0E5A60; font-weight: 800; border: none; padding: 8px 16px; border-radius: 8px; font-size: 12px; cursor: pointer; white-space: nowrap;">
              Copiar Enlace 📋
            </button>
            <a id="gen-preview-link" href="#" target="_blank" style="background: white; color: #0E5A60; font-weight: 700; text-decoration: none; padding: 8px 14px; border-radius: 8px; font-size: 12px; display: inline-flex; align-items: center; white-space: nowrap;">
              Probar ↗
            </a>
          </div>
        </div>
      </div>
      
      <!-- Listado de Enlaces Directos -->
      <div style="background: white; border: 1px solid #eaeaea; border-radius: 16px; padding: 24px; box-shadow: 0 1px 4px rgba(0,0,0,0.04);">
        <h3 style="margin: 0 0 6px 0; color: #0E5A60; font-size: 18px;">🔗 Enlaces Directos para Compartir</h3>
        <p style="color: #666; font-size: 13px; margin: 0 0 20px 0;">
          Puedes copiar estos enlaces para enviarlos por WhatsApp, Instagram, correo electrónico o botones en tu web.
        </p>

        <div style="display: flex; flex-direction: column; gap: 14px;">
          ${links
            .map(
              (l, idx) => `
            <div style="padding: 16px; border: 1px solid #eee; border-radius: 12px; background: #fafafa; display: flex; flex-direction: column; gap: 8px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <strong style="color: #0E5A60; font-size: 14px;">${l.title}</strong>
                <span style="font-size: 11px; background: #FFF3D6; color: #0E5A60; font-weight: 700; padding: 2px 8px; border-radius: 4px; border: 1px solid #F2B705/30;">${l.badge}</span>
              </div>
              <p style="margin: 0; font-size: 12px; color: #666;">${l.desc}</p>
              
              <div style="display: flex; gap: 8px; margin-top: 4px;">
                <input type="text" readonly id="link-input-${idx}" value="${l.url}" style="flex: 1; padding: 8px 12px; font-size: 12px; background: white; border: 1px solid #ddd; border-radius: 8px; color: #333;" />
                <button onclick="copyLinkByIndex(${idx})" style="background: #0E5A60; color: white; border: none; padding: 8px 14px; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer; white-space: nowrap;">
                  Copiar 📋
                </button>
                <a href="${l.url}" target="_blank" style="background: white; border: 1px solid #0E5A60; color: #0E5A60; text-decoration: none; padding: 8px 14px; border-radius: 8px; font-size: 12px; font-weight: 700; display: inline-flex; align-items: center; white-space: nowrap;">
                  Abrir ↗
                </a>
              </div>
            </div>
          `
            )
            .join('')}
        </div>
      </div>

      <!-- Widget Embed / iFrame -->
      <div style="background: white; border: 1px solid #eaeaea; border-radius: 16px; padding: 24px; box-shadow: 0 1px 4px rgba(0,0,0,0.04);">
        <h3 style="margin: 0 0 6px 0; color: #0E5A60; font-size: 18px;">💻 Código de Incrustación (iFrame / Embed)</h3>
        <p style="color: #666; font-size: 13px; margin: 0 0 16px 0;">
          Para incrustar el agendador directamente dentro de cualquier blog, página externa o Notion:
        </p>

        <textarea id="embed-iframe-code" readonly rows="3" style="width: 100%; font-family: monospace; font-size: 12px; padding: 12px; background: #1e293b; color: #f8fafc; border-radius: 8px; border: none; box-sizing: border-box;"><iframe src="${origin}/reservar.html" width="100%" height="780" frameborder="0" style="border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);"></iframe></textarea>

        <button onclick="copyEmbedIframe()" style="background: #0E5A60; color: white; border: none; padding: 10px 18px; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; margin-top: 12px;">
          Copiar Código de iFrame 📋
        </button>
      </div>

    </div>
  `;

  setTimeout(updateCustomGeneratedLink, 50);
}

function updateCustomGeneratedLink() {
  const origin = window.location.origin;
  const title = encodeURIComponent(document.getElementById('gen-title')?.value.trim() || 'Tarifa Especial');
  const price = document.getElementById('gen-price')?.value || '68';
  const tutor = document.getElementById('gen-tutor')?.value || '';
  const name = encodeURIComponent(document.getElementById('gen-name')?.value.trim() || '');
  const classes = document.getElementById('gen-classes')?.value || '4';

  let url = `${origin}/reservar.html?price=${price}&title=${title}&classes=${classes}&duration=50`;
  if (tutor) url += `&tutor=${tutor}`;
  if (name) url += `&name=${name}`;

  const inputEl = document.getElementById('gen-output-url');
  const prevEl = document.getElementById('gen-preview-link');
  if (inputEl) inputEl.value = url;
  if (prevEl) prevEl.href = url;
}

function copyGeneratedCustomLink() {
  const inputEl = document.getElementById('gen-output-url');
  if (!inputEl) return;
  inputEl.select();
  navigator.clipboard.writeText(inputEl.value);
  alert('¡Enlace con tarifa personalizada copiado al portapapeles!\n' + inputEl.value);
}

function copyLinkByIndex(idx) {
  const input = document.getElementById(`link-input-${idx}`);
  if (!input) return;
  input.select();
  navigator.clipboard.writeText(input.value);
  alert('¡Enlace copiado al portapapeles!\n' + input.value);
}

function copyEmbedIframe() {
  const area = document.getElementById('embed-iframe-code');
  if (!area) return;
  area.select();
  navigator.clipboard.writeText(area.value);
  alert('¡Código de incrustación copiado al portapapeles!');
}
