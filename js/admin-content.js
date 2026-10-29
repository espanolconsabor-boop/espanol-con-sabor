const CONTENT_FIELDS = [
  { key: 'founder_name', label: 'Nombre del fundador', type: 'text' },
  { key: 'founder_title', label: 'Cargo y ubicación', type: 'text' },
  { key: 'founder_quote', label: 'Cita destacada', type: 'textarea' },
  { key: 'founder_bio', label: 'Biografía completa', type: 'textarea' },
  { key: 'founder_photo_url', label: 'Foto del fundador', type: 'image' },
  { key: 'hero_title_line1', label: 'Hero — Título línea 1', type: 'text' },
  { key: 'hero_title_line2', label: 'Hero — Título línea 2 (en cursiva)', type: 'text' },
  { key: 'hero_subtitle', label: 'Hero — Subtítulo', type: 'textarea' },
  { key: 'stat_1_number', label: 'Estadística 1 — Número (ej: 500+)', type: 'text' },
  { key: 'stat_1_label', label: 'Estadística 1 — Etiqueta (ej: Students)', type: 'text' },
  { key: 'stat_2_number', label: 'Estadística 2 — Número (ej: 4.9★)', type: 'text' },
  { key: 'stat_2_label', label: 'Estadística 2 — Etiqueta (ej: Rating)', type: 'text' },
  { key: 'stat_3_number', label: 'Estadística 3 — Número (ej: 12+)', type: 'text' },
  { key: 'stat_3_label', label: 'Estadística 3 — Etiqueta (ej: Countries)', type: 'text' },
  { key: 'plan_andina_price', label: 'Plan Andina — Precio (ej: $89)', type: 'text' },
  { key: 'plan_andina_period', label: 'Plan Andina — Periodo de cobro (ej: /month o /lesson)', type: 'text' },
  { key: 'plan_andina_note', label: 'Plan Andina — Detalle', type: 'text' },
  { key: 'plan_cafetera_price', label: 'Plan Cafetera — Precio (ej: $159)', type: 'text' },
  { key: 'plan_cafetera_period', label: 'Plan Cafetera — Periodo de cobro (ej: /month o /lesson)', type: 'text' },
  { key: 'plan_cafetera_note', label: 'Plan Cafetera — Detalle', type: 'text' },
  { key: 'plan_caribena_price', label: 'Plan Caribeña — Precio (ej: $249)', type: 'text' },
  { key: 'plan_caribena_period', label: 'Plan Caribeña — Periodo de cobro (ej: /month o /lesson)', type: 'text' },
  { key: 'plan_caribena_note', label: 'Plan Caribeña — Detalle', type: 'text' },
  { key: 'section_title_steps', label: 'Título — Sección "3 pasos"', type: 'text' },
  { key: 'section_title_testimonials', label: 'Título — Sección testimonios', type: 'text' },
  { key: 'section_title_pillars', label: 'Título — Sección pilares', type: 'text' },
  { key: 'section_title_teachers', label: 'Título — Sección profesores', type: 'text' },
  { key: 'section_title_book_steps', label: 'Título — Sección "Ready in 3 steps"', type: 'text' },
  { key: 'section_title_faq', label: 'Título — Sección FAQ', type: 'text' },
  { key: 'footer_tagline', label: 'Footer — Frase debajo del logo', type: 'text' },
  { key: 'footer_email', label: 'Footer — Correo de contacto', type: 'text' },
  { key: 'footer_whatsapp', label: 'Footer — WhatsApp', type: 'text' },
  { key: 'footer_hours', label: 'Footer — Horario de atención', type: 'text' },
  { key: 'social_instagram_url', label: 'Link de Instagram', type: 'text' },
  { key: 'social_tiktok_url', label: 'Link de TikTok', type: 'text' },
  { key: 'social_youtube_url', label: 'Link de YouTube', type: 'text' },
  { key: 'plan_andina_features', label: 'Plan Andina — Beneficios (uno por línea)', type: 'textarea' },
  { key: 'plan_cafetera_features', label: 'Plan Cafetera — Beneficios (uno por línea)', type: 'textarea' },
  { key: 'plan_caribena_features', label: 'Plan Caribeña — Beneficios (uno por línea)', type: 'textarea' },
];

async function renderSiteContent(content) {
  content.innerHTML = `<div class="admin-section"><form id="content-form" class="admin-form"></form></div>`;
  const form = document.getElementById('content-form');

  const { data, error } = await supabaseClient.from('site_content').select('*');
  const values = {};
  (data || []).forEach(row => values[row.key] = row.value);

  form.innerHTML = CONTENT_FIELDS.map(f => {
    if (f.type === 'textarea') {
      return `<label class="admin-form-label">${f.label}</label><textarea data-key="${f.key}">${values[f.key] || ''}</textarea>`;
    }
    if (f.type === 'image') {
      return `<label class="admin-form-label">${f.label}</label>
        ${values[f.key] ? `<img src="${values[f.key]}" class="admin-card-img" style="max-width:150px;" />` : ''}
        <input type="file" accept="image/*" data-key="${f.key}" class="content-image-input" />`;
    }
    return `<label class="admin-form-label">${f.label}</label><input type="text" data-key="${f.key}" value="${values[f.key] || ''}" />`;
  }).join('') + '<div class="admin-form-actions"><button type="submit">Guardar todos los cambios</button></div>';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const updates = [];

    for (const f of CONTENT_FIELDS) {
      if (f.type === 'image') {
        const fileInput = form.querySelector(`.content-image-input[data-key="${f.key}"]`);
        if (fileInput.files[0]) {
          const file = fileInput.files[0];
          const fileName = `site/${Date.now()}_${file.name}`;
          const { error: uploadError } = await supabaseClient.storage.from('photos').upload(fileName, file);
          if (uploadError) { alert('Error subiendo ' + f.label + ': ' + uploadError.message); return; }
          const { data: urlData } = supabaseClient.storage.from('photos').getPublicUrl(fileName);
          updates.push({ key: f.key, value: urlData.publicUrl });
        }
      } else {
        const el = form.querySelector(`[data-key="${f.key}"]`);
        updates.push({ key: f.key, value: el.value });
      }
    }

    const { error: upsertError } = await supabaseClient.from('site_content').upsert(updates, { onConflict: 'key' });
    if (upsertError) { alert('Error guardando: ' + upsertError.message); return; }
    alert('Guardado correctamente');
    renderSiteContent(content);
  });
}
