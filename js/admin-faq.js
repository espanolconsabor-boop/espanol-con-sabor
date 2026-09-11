async function renderFaqs(content) {
  content.innerHTML = `
    <div class="admin-section">
      <button id="new-faq-btn" class="admin-btn-primary">+ Agregar pregunta frecuente</button>
      <div id="faq-form-wrapper"></div>
      <div id="faq-list" class="admin-grid">Cargando...</div>
    </div>
  `;

  document.getElementById('new-faq-btn').addEventListener('click', () => showFaqForm());

  await refreshFaqList();
}

async function refreshFaqList() {
  const { data, error } = await supabaseClient.from('faqs').select('*').order('display_order');
  const list = document.getElementById('faq-list');
  if (error) { list.innerHTML = '<p>Error cargando preguntas frecuentes</p>'; console.error(error); return; }
  if (!data.length) { list.innerHTML = '<p>No hay preguntas frecuentes todavía</p>'; return; }

  list.innerHTML = data.map(f => `
    <div class="admin-card">
      <h3>${f.question}</h3>
      <p class="admin-card-bio">${f.answer}</p>
      <div class="admin-card-actions">
        <button class="admin-btn-edit" data-id="${f.id}">Editar</button>
        <button class="admin-btn-delete" data-id="${f.id}">Borrar</button>
      </div>
    </div>
  `).join('');

  document.querySelectorAll('#faq-list .admin-btn-edit').forEach(btn =>
    btn.addEventListener('click', async () => {
      const { data } = await supabaseClient.from('faqs').select('*').eq('id', btn.dataset.id).single();
      showFaqForm(data);
    })
  );

  document.querySelectorAll('#faq-list .admin-btn-delete').forEach(btn =>
    btn.addEventListener('click', async () => {
      if (!confirm('¿Borrar esta pregunta?')) return;
      await supabaseClient.from('faqs').delete().eq('id', btn.dataset.id);
      await refreshFaqList();
    })
  );
}

function showFaqForm(faq = null) {
  const wrapper = document.getElementById('faq-form-wrapper');
  wrapper.innerHTML = `
    <form id="faq-form" class="admin-form">
      <input type="text" id="f-question" placeholder="Pregunta" value="${faq?.question || ''}" required />
      <textarea id="f-answer" placeholder="Respuesta" required>${faq?.answer || ''}</textarea>
      <label class="admin-form-label">Posición en la página (0 = primero)</label>
      <input type="number" id="f-order" placeholder="Ej: 0, 1, 2..." min="0" value="${faq?.display_order ?? 0}" />
      <div class="admin-form-actions">
        <button type="submit">${faq ? 'Guardar cambios' : 'Crear pregunta'}</button>
        <button type="button" id="cancel-faq-btn">Cancelar</button>
      </div>
    </form>
  `;

  document.getElementById('cancel-faq-btn').addEventListener('click', () => wrapper.innerHTML = '');

  document.getElementById('faq-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const question = document.getElementById('f-question').value;
    const answer = document.getElementById('f-answer').value;
    const order = parseInt(document.getElementById('f-order').value) || 0;

    const payload = { question, answer, display_order: order };

    if (faq) {
      await supabaseClient.from('faqs').update(payload).eq('id', faq.id);
    } else {
      await supabaseClient.from('faqs').insert([payload]);
    }

    wrapper.innerHTML = '';
    await refreshFaqList();
  });
}
