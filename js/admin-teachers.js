async function renderTeachers(content) {
  content.innerHTML = `
    <div class="admin-section">
      <button id="new-teacher-btn" class="admin-btn-primary">+ Agregar profesor</button>
      <div id="teacher-form-wrapper"></div>
      <div id="teacher-list" class="admin-grid">Cargando...</div>
    </div>
  `;

  document.getElementById('new-teacher-btn').addEventListener('click', () => showTeacherForm());

  await refreshTeacherList();
}

async function refreshTeacherList() {
  const { data, error } = await supabaseClient.from('teachers').select('*').order('display_order');
  const list = document.getElementById('teacher-list');
  if (error) { list.innerHTML = '<p>Error cargando profesores</p>'; console.error(error); return; }
  if (!data.length) { list.innerHTML = '<p>No hay profesores todavía</p>'; return; }

  // Cargar calificaciones desde site_content
  const { data: ratingsData } = await supabaseClient.from('site_content').select('*').like('key', 'teacher_rating_%');
  const ratingsMap = {};
  (ratingsData || []).forEach(r => {
    ratingsMap[r.key.replace('teacher_rating_', '')] = r.value;
  });

  list.innerHTML = data.map(t => {
    const ratingVal = ratingsMap[t.id] || t.rating || '5.0';
    return `
      <div class="admin-card">
        <img src="${t.photo_url || 'https://placehold.co/200x200?text=Sin+foto'}" class="admin-card-img" />
        <h3>${t.name}</h3>
        <p>${t.city || ''}</p>
        <p style="color:#0E5A60; font-weight:600; margin: 4px 0;">⭐ Calificación: ${ratingVal} / 5.0</p>
        <p class="admin-card-bio">${t.bio || ''}</p>
        <div class="admin-card-actions">
          <button class="admin-btn-edit" data-id="${t.id}">Editar</button>
          <button class="admin-btn-delete" data-id="${t.id}">Borrar</button>
        </div>
      </div>
    `;
  }).join('');

  document.querySelectorAll('.admin-btn-edit').forEach(btn =>
    btn.addEventListener('click', async () => {
      const { data } = await supabaseClient.from('teachers').select('*').eq('id', btn.dataset.id).single();
      const { data: ratingRow } = await supabaseClient.from('site_content').select('value').eq('key', `teacher_rating_${btn.dataset.id}`).single();
      if (data) {
        data._rating = ratingRow ? ratingRow.value : (data.rating || '5.0');
      }
      showTeacherForm(data);
    })
  );

  document.querySelectorAll('.admin-btn-delete').forEach(btn =>
    btn.addEventListener('click', async () => {
      if (!confirm('¿Borrar este profesor?')) return;
      await supabaseClient.from('teachers').delete().eq('id', btn.dataset.id);
      await supabaseClient.from('site_content').delete().eq('key', `teacher_rating_${btn.dataset.id}`);
      await refreshTeacherList();
    })
  );
}

function showTeacherForm(teacher = null) {
  const currentRating = teacher ? (teacher._rating ?? teacher.rating ?? '5.0') : '5.0';
  const wrapper = document.getElementById('teacher-form-wrapper');
  wrapper.innerHTML = `
    <form id="teacher-form" class="admin-form">
      <input type="text" id="t-name" placeholder="Nombre" value="${teacher?.name || ''}" required />
      <input type="text" id="t-city" placeholder="Ciudad" value="${teacher?.city || ''}" />
      <label class="admin-form-label">Calificación de tutor (0.0 a 5.0)</label>
      <input type="number" id="t-rating" step="0.1" min="0" max="5" placeholder="5.0" value="${currentRating}" required />
      <textarea id="t-bio" placeholder="Biografía">${teacher?.bio || ''}</textarea>
      <input type="file" id="t-photo" accept="image/*" />
      <label class="admin-form-label">Posición en la página (0 = primero)</label>
      <input type="number" id="t-order" placeholder="Ej: 0, 1, 2..." min="0" value="${teacher?.display_order ?? 0}" />
      <div class="admin-form-actions">
        <button type="submit">${teacher ? 'Guardar cambios' : 'Crear profesor'}</button>
        <button type="button" id="cancel-form-btn">Cancelar</button>
      </div>
    </form>
  `;

  document.getElementById('cancel-form-btn').addEventListener('click', () => wrapper.innerHTML = '');

  document.getElementById('teacher-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('t-name').value;
    const city = document.getElementById('t-city').value;
    const bio = document.getElementById('t-bio').value;
    const order = parseInt(document.getElementById('t-order').value) || 0;
    const ratingVal = parseFloat(document.getElementById('t-rating').value) || 5.0;
    const ratingStr = ratingVal.toFixed(1);
    const fileInput = document.getElementById('t-photo');
    let photo_url = teacher?.photo_url || null;

    if (fileInput.files[0]) {
      const file = fileInput.files[0];
      const fileName = `teachers/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabaseClient.storage.from('photos').upload(fileName, file);
      if (uploadError) { alert('Error subiendo foto: ' + uploadError.message); return; }
      const { data: urlData } = supabaseClient.storage.from('photos').getPublicUrl(fileName);
      photo_url = urlData.publicUrl;
    }

    const payload = { name, city, bio, photo_url, display_order: order };

    if (teacher) {
      // Intentar actualizar con columna rating si existe en Supabase
      const { error: errRating } = await supabaseClient.from('teachers').update({ ...payload, rating: ratingVal }).eq('id', teacher.id);
      if (errRating) {
        await supabaseClient.from('teachers').update(payload).eq('id', teacher.id);
      }
      // Guardar también siempre en site_content para persistencia garantizada
      await supabaseClient.from('site_content').upsert([{ key: `teacher_rating_${teacher.id}`, value: ratingStr }], { onConflict: 'key' });
    } else {
      let createdId = null;
      const { data: inserted, error: errInsert } = await supabaseClient.from('teachers').insert([{ ...payload, rating: ratingVal }]).select();
      if (errInsert) {
        const { data: fallbackInserted } = await supabaseClient.from('teachers').insert([payload]).select();
        if (fallbackInserted && fallbackInserted[0]) createdId = fallbackInserted[0].id;
      } else if (inserted && inserted[0]) {
        createdId = inserted[0].id;
      }
      if (createdId) {
        await supabaseClient.from('site_content').upsert([{ key: `teacher_rating_${createdId}`, value: ratingStr }], { onConflict: 'key' });
      }
    }

    wrapper.innerHTML = '';
    await refreshTeacherList();
  });
}
