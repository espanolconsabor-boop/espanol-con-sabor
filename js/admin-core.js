async function loadAdminTab(tab) {
  const content = document.getElementById('admin-content');
  if (tab === 'teachers') return renderTeachers(content);
  if (tab === 'testimonials') return renderTestimonials(content);
  if (tab === 'blog') return renderBlogPosts(content);
  if (tab === 'content') return renderSiteContent(content);
  if (tab === 'faq') return renderFaqs(content);
  if (tab === 'newsletter') return renderNewsletter(content);
  content.innerHTML = '<p>Sección "' + tab + '" en construcción</p>';
}

document.querySelectorAll('.admin-tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.admin-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    loadAdminTab(btn.dataset.tab);
  });
});
