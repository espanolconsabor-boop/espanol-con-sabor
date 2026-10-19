# Memoria Técnica: Español con Sabor — Integración Supabase, Panel Admin y SEO

## 1. Contexto y Arquitectura
- **Ubicación del Proyecto:** `D:\AppSpanish`
- **Repositorio GitHub:** `https://github.com/espanolconsabor-boop/espanol-con-sabor.git` (rama `main`)
- **Stack:** HTML5, CSS3 nativo (Design System de variables), JavaScript modular vanilla, Supabase (PostgreSQL, Auth, Storage), Cloudflare Pages.

---

## 2. Configuración del Cliente Supabase
- **Archivo:** `supabase-client.js`
- **URL Base:** `https://xpmyayjtowdhrjdbezas.supabase.co` *(Nota crítica: No incluir `/rest/v1/` al instanciar `createClient`, ya que el SDK lo anexa automáticamente).*
- **Publishable Key:** `sb_publishable_hO03lNUtn1o3Ug-_eF5Oyg_HJDXOEK-` (segura para exposición en frontend).

---

## 3. Frontend Público y Carga Dinámica
- **Archivos Clave:** `index.html`, `app.js`, `js/content-loader.js`
- **Newsletter:** `handleNewsletterSignup(e)` en `app.js` realiza `insert` en `newsletter_subscribers` con control de duplicados (`error.code === '23505'`) y toasts.
- **Calendly:** Enlace unificado a `https://calendly.com/mariajose-izquierdo-j/30min` en las 6 llamadas a la acción.
- **Carga Dinámica con Respaldo Visual (`content-loader.js`):**
  - Si la tabla de Supabase devuelve 0 filas o hay un error de conexión, **se preserva el contenido estático** original sin romper el diseño.
  - Funciones activas en `DOMContentLoaded`:
    - `loadTeachers()`: Consulta `teachers` ordenados por `display_order` y llena `.teachers-grid`.
    - `loadTestimonials()`: Consulta `testimonials` y renderiza `.testimonials-grid`.
    - `loadBlogPosts()`: Consulta `blog_posts` y puebla `.blog-grid`.
    - `loadSiteContent()`: Modifica dinámicamente títulos de sección, héroe, bio del fundador, planes de precios y enlaces de pie de página según clave/valor en `site_content`.
    - `loadFaqs()`: Carga preguntas y respuestas en `#faq-list`.

---

## 4. Panel de Administración Modular
- **Estructura y Estilos:** `admin.html`, `admin.css`
- **Módulos JS (`/js`):**
  - `admin-auth.js`: Maneja sesión persistente (`getSession`), login con email/contraseña y logout. Oculta la app y muestra pantalla de acceso si no hay sesión.
  - `admin-core.js`: Ruteador de pestañas (`loadAdminTab`).
  - `admin-teachers.js`: CRUD de profesores con subida de imágenes a Supabase Storage (bucket `photos`, prefijo `teachers/`).
  - `admin-testimonials.js`: CRUD de reseñas (nombre, texto, rating 1-5, foto opcional).
  - `admin-blog.js`: CRUD de artículos de blog con tags (Culture, Travel, Language).
  - `admin-content.js`: Array extensible `CONTENT_FIELDS` (36 campos configurables) que realiza `upsert` con `onConflict: 'key'` en `site_content`.
  - `admin-faq.js`: CRUD de preguntas frecuentes.
  - `admin-newsletter.js`: Módulo "Correos" de suscriptores al boletín (`newsletter_subscribers`).
    - Consulta y orden descendente por fecha (`created_at`).
    - Contador total en píldora (`#newsletter-counter` -> "Total suscriptores: X").
    - Formateo explícito en zona horaria de Colombia (`America/Bogota` vía `Intl.DateTimeFormat` a `dd/mm/yyyy hh:mm`).
    - Sanitización anti-XSS (`escapeHtml`).
    - Eliminación reactiva de suscriptores con confirmación.

---

## 5. SEO y Open Graph
- **Etiquetas en `<head>`:**
  - `title`: `Español con Sabor | Learn Colombian Spanish Online`
  - `meta description`: 154 caracteres.
  - `og:title` / `twitter:title`: `Español con Sabor | Learn Colombian Spanish Online`
  - `og:description`: 101 caracteres.
  - `og:site_name`: `Español con Sabor`
  - `og:image` / `twitter:image`: `https://espanolconsabor.pages.dev/og-image.jpg` (1200x630 px).
- **Imagen Social (`og-image.jpg`):** Creada en la raíz con branding corporativo (fondo hero, overlay teal `#0E5A60`, borde dorado `#F2B705` y textos promocionales en inglés).
