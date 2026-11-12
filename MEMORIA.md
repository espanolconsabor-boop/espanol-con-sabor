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

## 5. SEO, Google Ranking y Optimización Web
- **Dominio Canónico Oficial:** `https://espanolconsaboracademy.com`
- **Etiquetas en `<head>`:**
  - `title`: `Español con Sabor | Learn Colombian Spanish Online 1-on-1`
  - `meta description`: 154 caracteres orientados a alta tasa de clics (CTR).
  - `meta keywords`: Expresiones transaccionales y de búsqueda orgánica en inglés y español.
  - `canonical`: `https://espanolconsaboracademy.com/` (index) y `https://espanolconsaboracademy.com/reservar` (reservar).
  - `robots`: `index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1`.
  - `admin.html` y `tutor.html`: Protegidos con `noindex, nofollow, noarchive`.
- **Suite de Favicons y PWA:**
  - `favicon.svg` (vectorial moderno).
  - `favicon-32x32.png`, `favicon-16x16.png`.
  - `apple-touch-icon.png` (180x180 px para iOS).
  - `favicon.ico` (raíz para navegadores legacy).
- **Robots y Sitemap:**
  - `robots.txt`: Reglas de rastreo optimizadas, bloqueo de endpoints administrativos y directiva hacia el sitemap.
  - `sitemap.xml`: Protocolo Sitemaps 0.9 con extensiones de imágenes (`image:image`) y lenguaje alternativo (`xhtml:link hreflang`).
- **Datos Estructurados Schema.org (JSON-LD):**
  - `@graph` con `LanguageSchool`, `WebSite`, `Course`, `FAQPage`, `AggregateRating`, `Review` y catálogo de ofertas.
- **Rendimiento y Core Web Vitals:**
  - Compresión de imágenes de 5.2 MB a 1.7 MB (ahorro del 66%).
  - Atributo `fetchpriority="high"` y `decoding="async"` en imagen LCP del hero.
  - Atributos `loading="lazy"` y dimensiones explícitas en el resto de imágenes.
- **Enrutamiento por Hash en `app.js`:**
  - Soporte para enlaces directos `#blog`, `#about`, `#book`, `#pricing`, `#faq` sincronizados con `history.replaceState`.

---

## 6. Motor de Reservas y Suscripciones (`reservar.html`)
- **Planes de Suscripción Multiclase (50 min por clase en una sola sesión):**
  - **Plan Andina:** 4 clases ($68 USD).
  - **Plan Cafetera:** 8 clases ($128 USD).
  - **Plan Caribeña:** 12 clases ($180 USD).
  - Flujo: Selección de Tutora ➔ Datos y Metas ➔ Pago completo PayPal ➔ Selección simultánea de las 4, 8 o 12 clases ➔ Confirmación.
- **Clase de Prueba:** 1 clase de 30 minutos ($15 USD) con validación de una prueba por estudiante.
- **Integración Google Meet Oficial:**
  - Fallback OAuth con Google Calendar API que genera enlaces de sala reales y activos (`meet.google.com/xxx-yyyy-zzz`).
  - Envío automático de invitaciones de calendario (.ics) y correos de confirmación.

