# Plan de Desarrollo — Español con Sabor 🇨🇴☕

Landing page para escuela de español colombiano en línea.
Stack: HTML + CSS + JS estático · GitHub · Cloudflare Pages · Supabase

---

## Estado actual de la app

La app ya tiene construido:
- ✅ Página de inicio (Hero, Testimonios, CTA, Promo countdown)
- ✅ Blog (3 artículos placeholder)
- ✅ About Us (Fundador + Equipo de teachers)
- ✅ Book a Class (Precios, FAQ, integración Calendly placeholder)
- ✅ Navbar responsive + menú móvil
- ✅ Toast notifications + ticker de actividad
- ✅ CSS premium, dark mode nativo

---

## Requerimientos del proyecto completo

### 🔴 Problemas a corregir primero

> [!WARNING]
> Estos errores deben corregirse antes del deploy:
> - Los links del blog dicen `onclick="return false;"` — no funcionan. Se necesita implementar páginas o modales de artículos reales.
> - El formulario de newsletter simula la suscripción pero no guarda nada — se conectará a Supabase.
> - Los links de Calendly apuntan a `https://calendly.com` genérico — se necesita la URL real del cliente.
> - Las imágenes de teachers, founder y blog son rutas locales — se deben subir con la app.

---

## Módulos a desarrollar

### 📦 Módulo 1 — Correcciones críticas (base)
**Archivos:** `index.html`, `app.js`, `style.css`

- [ ] Agregar imágenes reales (o generadas) a `/images/`
- [ ] Reemplazar URL de Calendly con la URL real del cliente
- [ ] Hacer los artículos del blog expandibles (modal o página propia)
- [ ] Mejorar SEO: añadir Open Graph tags, canonical URL, favicon

---

### 📦 Módulo 2 — Integración Supabase (backend sin servidor)
**Archivos nuevos:** `supabase-client.js`

Supabase se usará como base de datos + backend gratuito. Solo necesitas una cuenta gratuita.

#### Tabla: `newsletter_subscribers`
```sql
CREATE TABLE newsletter_subscribers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  source TEXT DEFAULT 'blog' -- desde qué sección se suscribió
);
```

#### Tabla: `contact_leads`
```sql
CREATE TABLE contact_leads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT,
  plan_interest TEXT, -- 'andina', 'cafetera', 'caribena', 'trial'
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Qué cambia en la app:**
- El formulario de newsletter guarda el email real en Supabase
- Se puede agregar un formulario de contacto/consulta conectado a `contact_leads`
- El admin puede ver los leads desde el dashboard de Supabase (sin código extra)

---

### 📦 Módulo 3 — GitHub (control de versiones)

**Pasos:**
1. Crear repositorio en GitHub (ej: `espanol-con-sabor`)
2. Hacer `git init` en `d:\AppSpanish`
3. Agregar `.gitignore` para excluir `.env` con credenciales de Supabase
4. Push inicial con todo el código
5. Commits cada vez que haya cambios

**Archivo `.gitignore`:**
```
.env
.env.local
*.env
node_modules/
```

**Archivo `.env` (local, NO se sube):**
```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJxxxxx...
```

---

### 📦 Módulo 4 — Deploy con Cloudflare Pages (reemplaza Netlify)

> [!IMPORTANT]
> Cloudflare Pages es **100% gratis** y no tiene la restricción de acceso de Netlify. El sitio queda **público por defecto**.

**Ventajas sobre Netlify:**
- Sin protección de contraseña accidental
- CDN global más rápido
- Dominio gratuito: `espanol-con-sabor.pages.dev`
- SSL automático
- Deploy automático cada vez que haces push a GitHub

**Pasos de configuración:**
1. Ir a [dash.cloudflare.com](https://dash.cloudflare.com) → Workers & Pages
2. Crear proyecto → Conectar con GitHub → Seleccionar repo
3. Build settings:
   - Framework preset: **None**
   - Build command: *(vacío — es HTML estático)*
   - Output directory: `/` (raíz del proyecto)
4. Dar click en **Save and Deploy** ✅

---

### 📦 Módulo 5 — Dominio personalizado (opcional pero recomendado)

Si el cliente tiene o quiere comprar un dominio (ej: `espanolconsabor.com`):
- Se puede agregar gratis en Cloudflare Pages → Custom Domains
- Cloudflare también vende dominios a precio de costo

---

### 📦 Módulo 6 — Mejoras de contenido (opcionales)

| Feature | Prioridad | Descripción |
|---------|-----------|-------------|
| Artículos de blog completos | Alta | Expandir los 3 artículos existentes con contenido real |
| Formulario de contacto | Alta | Conectado a Supabase `contact_leads` |
| WhatsApp button flotante | Media | Botón flotante directo a WhatsApp del cliente |
| Google Analytics | Media | Para ver cuántas visitas recibe el sitio |
| Testimonios dinámicos | Baja | Cargar testimonios desde Supabase |
| Página de política de privacidad | Media | Requerida para GDPR si hay usuarios europeos |

---

## Orden de ejecución recomendado

```
1. Corregir errores críticos (imágenes, Calendly URL, SEO)
   ↓
2. Crear repo en GitHub + push inicial
   ↓
3. Conectar Cloudflare Pages → sitio público en minutos
   ↓
4. Crear proyecto en Supabase + tablas
   ↓
5. Conectar newsletter a Supabase
   ↓
6. Mejoras opcionales de contenido
```

---

## Verificación final

### ✅ Checklist de deploy
- [ ] Sitio abre sin contraseña en Cloudflare Pages URL
- [ ] Todas las imágenes cargan
- [ ] El formulario de newsletter guarda en Supabase
- [ ] Los botones de Calendly llevan a la URL correcta
- [ ] El sitio se ve bien en móvil
- [ ] Los artículos del blog se pueden leer completos
- [ ] SSL activo (https://)

---

## Preguntas abiertas para el cliente

> [!IMPORTANT]
> Antes de ejecutar necesito saber:

1. **¿Cuál es la URL de Calendly del cliente?** (reemplazará `https://calendly.com` en todos los botones)
2. **¿Tienen dominio propio?** (ej: `espanolconsabor.com`) o usamos el de Cloudflare Pages
3. **¿Los artículos del blog son reales o son placeholder?** ¿Quieren que los redacte?
4. **¿Ya tienen cuenta en GitHub, Cloudflare y Supabase?** o ¿las creamos desde cero?
5. **¿Tienen fotos reales** de los teachers y el fundador, o uso imágenes generadas con IA?

