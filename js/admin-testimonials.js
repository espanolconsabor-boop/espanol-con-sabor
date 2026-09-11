async function renderTestimonials(content) {
  content.innerHTML = `
    <div class="admin-section">
      <button id="new-testimonial-btn" class="admin-btn-primary">+ Agregar reseña</button>
      <div id="testimonial-form-wrapper"></div>
      <div id="testimonial-list" class="admin-grid">Cargando...</div>
    </div>
  `;

  document.getElementById('new-testimonial-btn').addEventListener('click', () => showTestimonialForm());

  await refreshTestimonialList();
}

async function refreshTestimonialList() {
  const { data, error } = await supabaseClient.from('testimonials').select('*').order('display_order');
  const list = document.getElementById('testimonial-list');
  if (error) { list.innerHTML = '<p>Error cargando reseñas</p>'; console.error(error); return; }
  if (!data.length) { list.innerHTML = '<p>No hay reseñas todavía</p>'; return; }

  list.innerHTML = data.map(t => `
    <div class="admin-card">
      <img src="${t.photo_url || 'https://placehold.co/200x200?text=Sin+foto'}" class="admin-card-img" />
      <h3>${t.name}</h3>
      <p>${'⭐'.repeat(t.rating || 5)}</p>
      <p class="admin-card-bio">${t.text}</p>
      <div class="admin-card-actions">
        <button class="admin-btn-edit" data-id="${t.id}">Editar</button>
        <button class="admin-btn-delete" data-id="${t.id}">Borrar</button>
      </div>
    </div>
  `).join('');

  document.querySelectorAll('#testimonial-list .admin-btn-edit').forEach(btn =>
    btn.addEventListener('click', async () => {
      const { data } = await supabaseClient.from('testimonials').select('*').eq('id', btn.dataset.id).single();
      showTestimonialForm(data);
    })
  );

  document.querySelectorAll('#testimonial-list .admin-btn-delete').forEach(btn =>
    btn.addEventListener('click', async () => {
      if (!confirm('¿Borrar esta reseña?')) return;
      await supabaseClient.from('testimonials').delete().eq('id', btn.dataset.id);
      await refreshTestimonialList();
    })
  );
}

function showTestimonialForm(testimonial = null) {
  const wrapper = document.getElementById('testimonial-form-wrapper');
  wrapper.innerHTML = `
    <form id="testimonial-form" class="admin-form">
      <input type="text" id="r-name" placeholder="Nombre del estudiante" value="${testimonial?.name || ''}" required />
      <textarea id="r-text" placeholder="Texto de la reseña" required>${testimonial?.text || ''}</textarea>
      <label class="admin-form-label">Calificación (1 a 5 estrellas)</label>
      <input type="number" id="r-rating" min="1" max="5" value="${testimonial?.rating ?? 5}" />
      <input type="file" id="r-photo" accept="image/*" />
      <label class="admin-form-label">Posición en la página (0 = primero)</label>
      <input type="number" id="r-order" placeholder="Ej: 0, 1, 2..." min="0" value="${testimonial?.display_order ?? 0}" />
      <div class="admin-form-actions">
        <button type="submit">${testimonial ? 'Guardar cambios' : 'Crear reseña'}</button>
        <button type="button" id="cancel-testimonial-btn">Cancelar</button>
      </div>
    </form>
  `;

  document.getElementById('cancel-testimonial-btn').addEventListener('click', () => wrapper.innerHTML = '');

  document.getElementById('testimonial-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('r-name').value;
    const text = document.getElementById('r-text').value;
    const rating = parseInt(document.getElementById('r-rating').value) || 5;
    const order = parseInt(document.getElementById('r-order').value) || 0;
    const fileInput = document.getElementById('r-photo');
    let photo_url = testimonial?.photo_url || null;

    if (fileInput.files[0]) {
      const file = fileInput.files[0];
      const fileName = `testimonials/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabaseClient.storage.from('photos').upload(fileName, file);
      if (uploadError) { alert('Error subiendo foto: ' + uploadError.message); return; }
      const { data: urlData } = supabaseClient.storage.from('photos').getPublicUrl(fileName);
      photo_url = urlData.publicUrl;
    }

    const payload = { name, text, rating, photo_url, display_order: order };

    if (testimonial) {
      await supabaseClient.from('testimonials').update(payload).eq('id', testimonial.id);
    } else {
      await supabaseClient.from('testimonials').insert([payload]);
    }

    wrapper.innerHTML = '';
    await refreshTestimonialList();
  });
}
