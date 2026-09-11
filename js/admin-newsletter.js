async function renderNewsletter(content) {
  content.innerHTML = `
    <div class="admin-section">
      <div class="admin-header-row">
        <h2 class="admin-section-title">📬 Suscriptores al Boletín</h2>
        <div class="admin-counter-pill" id="newsletter-counter">Total suscriptores: <strong>...</strong></div>
      </div>
      <div id="newsletter-list-container" class="admin-table-container">Cargando suscriptores...</div>
    </div>
  `;

  await refreshNewsletterList();
}

async function refreshNewsletterList() {
  const container = document.getElementById('newsletter-list-container');
  const counter = document.getElementById('newsletter-counter');

  const { data, error } = await supabaseClient
    .from('newsletter_subscribers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    if (container) container.innerHTML = '<p class="admin-error">Error cargando suscriptores</p>';
    console.error(error);
    return;
  }

  const count = data ? data.length : 0;
  if (counter) {
    counter.innerHTML = `Total suscriptores: <strong>${count}</strong>`;
  }

  if (!data || data.length === 0) {
    if (container) container.innerHTML = '<p>No hay suscriptores registrados todavía.</p>';
    return;
  }

  function formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const formatter = new Intl.DateTimeFormat('es-CO', {
      timeZone: 'America/Bogota',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    const parts = Object.fromEntries(formatter.formatToParts(d).map(p => [p.type, p.value]));
    return `${parts.day}/${parts.month}/${parts.year} ${parts.hour}:${parts.minute}`;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  container.innerHTML = `
    <div class="admin-table-wrapper">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Email</th>
            <th>Origen</th>
            <th>Fecha de suscripción</th>
            <th style="text-align: right;">Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${data.map(sub => `
            <tr>
              <td class="td-email"><strong>${escapeHtml(sub.email)}</strong></td>
              <td><span class="admin-tag">${escapeHtml(sub.source || 'blog')}</span></td>
              <td class="td-date">${formatDate(sub.created_at)}</td>
              <td style="text-align: right;">
                <button class="admin-btn-delete" data-id="${sub.id}" title="Eliminar suscriptor">Borrar</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  container.querySelectorAll('.admin-btn-delete').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('¿Eliminar este suscriptor del boletín?')) return;
      btn.disabled = true;
      const { error: delError } = await supabaseClient
        .from('newsletter_subscribers')
        .delete()
        .eq('id', btn.dataset.id);

      if (delError) {
        alert('Error al borrar: ' + delError.message);
        btn.disabled = false;
        return;
      }
      await refreshNewsletterList();
    });
  });
}
