document.getElementById('login-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const errorEl = document.getElementById('login-error');

  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });

  if (error) {
    errorEl.textContent = error.message === 'Invalid login credentials'
      ? 'Correo o contraseña incorrectos'
      : (error.message || 'Error al iniciar sesión');
    return;
  }

  showAdminApp();
});

document.getElementById('logout-btn')?.addEventListener('click', async () => {
  await supabaseClient.auth.signOut();
  location.reload();
});

async function checkSession() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (session) {
    showAdminApp();
  }
}

function showAdminApp() {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('admin-app').style.display = 'block';
  if (typeof loadAdminTab === 'function') loadAdminTab('teachers');
}

checkSession();
