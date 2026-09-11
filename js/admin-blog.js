async function renderBlogPosts(content) {
  content.innerHTML = `
    <div class="admin-section">
      <button id="new-post-btn" class="admin-btn-primary">+ Agregar artículo</button>
      <div id="post-form-wrapper"></div>
      <div id="post-list" class="admin-grid">Cargando...</div>
    </div>
  `;

  document.getElementById('new-post-btn').addEventListener('click', () => showPostForm());

  await refreshPostList();
}

async function refreshPostList() {
  const { data, error } = await supabaseClient.from('blog_posts').select('*').order('display_order');
  const list = document.getElementById('post-list');
  if (error) { list.innerHTML = '<p>Error cargando artículos</p>'; console.error(error); return; }
  if (!data.length) { list.innerHTML = '<p>No hay artículos todavía</p>'; return; }

  list.innerHTML = data.map(p => `
    <div class="admin-card">
      <img src="${p.image_url || 'https://placehold.co/200x200?text=Sin+foto'}" class="admin-card-img" />
      <span class="admin-tag">${p.tag}</span>
      <h3>${p.title}</h3>
      <p class="admin-card-bio">${p.excerpt || ''}</p>
      <div class="admin-card-actions">
        <button class="admin-btn-edit" data-id="${p.id}">Editar</button>
        <button class="admin-btn-delete" data-id="${p.id}">Borrar</button>
      </div>
    </div>
  `).join('');

  document.querySelectorAll('#post-list .admin-btn-edit').forEach(btn =>
    btn.addEventListener('click', async () => {
      const { data } = await supabaseClient.from('blog_posts').select('*').eq('id', btn.dataset.id).single();
      showPostForm(data);
    })
  );

  document.querySelectorAll('#post-list .admin-btn-delete').forEach(btn =>
    btn.addEventListener('click', async () => {
      if (!confirm('¿Borrar este artículo?')) return;
      await supabaseClient.from('blog_posts').delete().eq('id', btn.dataset.id);
      await refreshPostList();
    })
  );
}

function showPostForm(post = null) {
  const wrapper = document.getElementById('post-form-wrapper');
  wrapper.innerHTML = `
    <form id="post-form" class="admin-form">
      <input type="text" id="p-title" placeholder="Título del artículo" value="${post?.title || ''}" required />
      <input type="text" id="p-excerpt" placeholder="Resumen corto (aparece en la tarjeta)" value="${post?.excerpt || ''}" />
      <textarea id="p-content" placeholder="Contenido completo del artículo">${post?.content || ''}</textarea>
      <label class="admin-form-label">Categoría</label>
      <select id="p-tag">
        <option value="Culture" ${post?.tag === 'Culture' ? 'selected' : ''}>Culture</option>
        <option value="Travel" ${post?.tag === 'Travel' ? 'selected' : ''}>Travel</option>
        <option value="Language" ${post?.tag === 'Language' ? 'selected' : ''}>Language</option>
      </select>
      <input type="file" id="p-image" accept="image/*" />
      <label class="admin-form-label">Posición en la página (0 = primero)</label>
      <input type="number" id="p-order" placeholder="Ej: 0, 1, 2..." min="0" value="${post?.display_order ?? 0}" />
      <div class="admin-form-actions">
        <button type="submit">${post ? 'Guardar cambios' : 'Crear artículo'}</button>
        <button type="button" id="cancel-post-btn">Cancelar</button>
      </div>
    </form>
  `;

  document.getElementById('cancel-post-btn').addEventListener('click', () => wrapper.innerHTML = '');

  document.getElementById('post-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('p-title').value;
    const excerpt = document.getElementById('p-excerpt').value;
    const contentText = document.getElementById('p-content').value;
    const tag = document.getElementById('p-tag').value;
    const order = parseInt(document.getElementById('p-order').value) || 0;
    const fileInput = document.getElementById('p-image');
    let image_url = post?.image_url || null;

    if (fileInput.files[0]) {
      const file = fileInput.files[0];
      const fileName = `blog/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabaseClient.storage.from('photos').upload(fileName, file);
      if (uploadError) { alert('Error subiendo imagen: ' + uploadError.message); return; }
      const { data: urlData } = supabaseClient.storage.from('photos').getPublicUrl(fileName);
      image_url = urlData.publicUrl;
    }

    const payload = { title, excerpt, content: contentText, tag, image_url, display_order: order };

    if (post) {
      await supabaseClient.from('blog_posts').update(payload).eq('id', post.id);
    } else {
      await supabaseClient.from('blog_posts').insert([payload]);
    }

    wrapper.innerHTML = '';
    await refreshPostList();
  });
}
