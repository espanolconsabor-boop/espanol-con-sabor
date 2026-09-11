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

  list.innerHTML = data.map(t => `
    <div class="admin-card">
      <img src="${t.photo_url || 'https://placehold.co/200x200?text=Sin+foto'}" class="admin-card-img" />
      <h3>${t.name}</h3>
      <p>${t.city || ''}</p>
      <p class="admin-card-bio">${t.bio || ''}</p>
      <div class="admin-card-actions">
        <button class="admin-btn-edit" data-id="${t.id}">Editar</button>
        <button class="admin-btn-delete" data-id="${t.id}">Borrar</button>
      </div>
    </div>
  `).join('');

  document.querySelectorAll('.admin-btn-edit').forEach(btn =>
    btn.addEventListener('click', async () => {
      const { data } = await supabaseClient.from('teachers').select('*').eq('id', btn.dataset.id).single();
      showTeacherForm(data);
    })
  );

  document.querySelectorAll('.admin-btn-delete').forEach(btn =>
    btn.addEventListener('click', async () => {
      if (!confirm('¿Borrar este profesor?')) return;
      await supabaseClient.from('teachers').delete().eq('id', btn.dataset.id);
      await refreshTeacherList();
    })
  );
}

function showTeacherForm(teacher = null) {
  const wrapper = document.getElementById('teacher-form-wrapper');
  wrapper.innerHTML = `
    <form id="teacher-form" class="admin-form">
      <input type="text" id="t-name" placeholder="Nombre" value="${teacher?.name || ''}" required />
      <input type="text" id="t-city" placeholder="Ciudad" value="${teacher?.city || ''}" />
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
      await supabaseClient.from('teachers').update(payload).eq('id', teacher.id);
    } else {
      await supabaseClient.from('teachers').insert([payload]);
    }

    wrapper.innerHTML = '';
    await refreshTeacherList();
  });
}
