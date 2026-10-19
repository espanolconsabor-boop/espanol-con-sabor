-- ====================================================================
-- ESPAÑOL CON SABOR — Script de Inicialización de Base de Datos Supabase
-- Proyecto: xpmyayjtowdhrjdbezas
-- ====================================================================

-- 1. TABLA: Profesores
CREATE TABLE IF NOT EXISTS public.teachers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT,
  bio TEXT,
  photo_url TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABLA: Reseñas / Testimonios
CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  text TEXT NOT NULL,
  rating INT DEFAULT 5,
  photo_url TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLA: Artículos del Blog
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT,
  tag TEXT DEFAULT 'Culture',
  image_url TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLA: Textos Generales del Sitio
CREATE TABLE IF NOT EXISTS public.site_content (
  key TEXT PRIMARY KEY,
  value TEXT
);

-- 5. TABLA: Preguntas Frecuentes (FAQ)
CREATE TABLE IF NOT EXISTS public.faqs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABLA: Suscriptores al Boletín (Newsletter)
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  source TEXT DEFAULT 'blog',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- HABILITAR SEGURIDAD (Row Level Security - RLS)
-- ====================================================================
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- ====================================================================
-- POLÍTICAS: Lectura pública (para visitantes de la web)
-- ====================================================================
DROP POLICY IF EXISTS "Permitir lectura publica teachers" ON public.teachers;
CREATE POLICY "Permitir lectura publica teachers" ON public.teachers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir lectura publica testimonials" ON public.testimonials;
CREATE POLICY "Permitir lectura publica testimonials" ON public.testimonials FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir lectura publica blog_posts" ON public.blog_posts;
CREATE POLICY "Permitir lectura publica blog_posts" ON public.blog_posts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir lectura publica site_content" ON public.site_content;
CREATE POLICY "Permitir lectura publica site_content" ON public.site_content FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir lectura publica faqs" ON public.faqs;
CREATE POLICY "Permitir lectura publica faqs" ON public.faqs FOR SELECT USING (true);

-- Permitir a cualquier visitante suscribirse al newsletter
DROP POLICY IF EXISTS "Permitir suscripciones newsletter" ON public.newsletter_subscribers;
CREATE POLICY "Permitir suscripciones newsletter" ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);

-- ====================================================================
-- POLÍTICAS: Panel de Administración (Usuarios Autenticados con login)
-- ====================================================================
DROP POLICY IF EXISTS "Admin full teachers" ON public.teachers;
CREATE POLICY "Admin full teachers" ON public.teachers FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin full testimonials" ON public.testimonials;
CREATE POLICY "Admin full testimonials" ON public.testimonials FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin full blog_posts" ON public.blog_posts;
CREATE POLICY "Admin full blog_posts" ON public.blog_posts FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin full site_content" ON public.site_content;
CREATE POLICY "Admin full site_content" ON public.site_content FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin full faqs" ON public.faqs;
CREATE POLICY "Admin full faqs" ON public.faqs FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin full newsletter" ON public.newsletter_subscribers;
CREATE POLICY "Admin full newsletter" ON public.newsletter_subscribers FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ====================================================================
-- STORAGE: Bucket de fotos para subir imágenes desde el admin
-- ====================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Fotos publicas" ON storage.objects;
CREATE POLICY "Fotos publicas" ON storage.objects FOR SELECT USING (bucket_id = 'photos');

DROP POLICY IF EXISTS "Admin subir fotos" ON storage.objects;
CREATE POLICY "Admin subir fotos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'photos');

DROP POLICY IF EXISTS "Admin actualizar fotos" ON storage.objects;
CREATE POLICY "Admin actualizar fotos" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'photos');

DROP POLICY IF EXISTS "Admin borrar fotos" ON storage.objects;
CREATE POLICY "Admin borrar fotos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'photos');

-- ====================================================================
-- DATOS INICIALES (SEED DATA): Profesores, Reseñas, Blog y FAQs
-- ====================================================================

-- Profesores iniciales
INSERT INTO public.teachers (name, city, bio, photo_url, display_order)
VALUES
  ('Camila Acosta', 'Medellín, Antioquia', 'Specialty: Conversational Spanish & Business Spanish. Passionate about Colombian history and literature.', 'images/teacher_camila.jpg', 0),
  ('Valentina Restrepo', 'Bogotá, D.C.', 'Specialty: Pronunciation & Cultural Immersion. Native Paisa with an ear for dialect nuances.', 'images/teacher_valentina.jpg', 1),
  ('Santiago Moreno', 'Cali, Valle del Cauca', 'Specialty: DELE Exam Preparation & Grammar. Certified teacher with dynamic immersion exercises.', 'images/teacher_santiago.jpg', 2)
ON CONFLICT DO NOTHING;

-- Reseñas iniciales
INSERT INTO public.testimonials (name, text, rating, display_order)
VALUES
  ('Sarah M. (New York, USA)', 'After just 2 months with Camila, I was able to have full conversations in Spanish. The Colombian approach is so warm and encouraging — I never felt embarrassed making mistakes!', 5, 0),
  ('James T. (London, UK)', 'I tried Duolingo for years with no real progress. One month with Santiago and I was ordering coffee in Medellín with zero issues. Worth every cent.', 5, 1),
  ('Ana K. (Berlin, Germany)', 'The cultural component is what sets this school apart. I don''t just speak Spanish — I understand Colombian humor, music, and history. My colleagues are amazed.', 5, 2)
ON CONFLICT DO NOTHING;

-- Artículos de blog iniciales
INSERT INTO public.blog_posts (title, excerpt, content, tag, image_url, display_order)
VALUES
  (
    'The Art of Colombian Coffee Culture: More Than Just a Drink',
    'Colombia is the world''s third-largest coffee producer, but for Colombians, coffee is so much more than a morning ritual. Learn the vocabulary, etiquette, and deep cultural significance of el tinto.',
    'Colombia is world-renowned for its high-altitude Arabica coffee beans. From the coffee axis (Eje Cafetero) to bustling cafés in Bogotá and Medellín, coffee connects friends, families, and learners of the language. In this article we explore traditional terms like tinto, perico, and chaqueta, and how ordering a coffee teaches you authentic Colombian manners.',
    'Culture',
    'images/blog_coffee_culture.jpg',
    0
  ),
  (
    'Cartagena de Indias: A City That Speaks History',
    'The walled city of Cartagena is Colombia''s crown jewel — a UNESCO World Heritage Site where every cobblestone street tells a story. Discover the Spanish vocabulary of the Caribbean coast.',
    'Stepping inside the historic walls of Cartagena feels like entering another century. Founded in 1533, its colonial balconies, vibrant bougainvillea flowers, and Afro-Caribbean rhythms create a unique linguistic landscape. Learn key Costeño expressions and understand the rich blend of cultures that shaped Colombia.',
    'Travel',
    'images/blog_cartagena.jpg',
    1
  ),
  (
    '10 Colombian Slang Words That''ll Make You Sound Like a Local',
    'Parcero, chévere, bacano, quiubo — if you don''t know these words yet, you''re missing out on the soul of Colombian Spanish.',
    'Colombian Spanish is celebrated worldwide for its clarity and melodic cadence, but its everyday slang gives it real character. Here are the top 10 expressions used across the country with real conversational examples: 1. Parcero (friend), 2. Chévere (cool), 3. Bacano (great), 4. Quiubo (what''s up), 5. Tinto (black coffee), 6. Dar papaya (put yourself at risk), 7. Rumbear (to party), 8. Berraquera (courage/determination), 9. Guayabo (hangover), 10. Desparchado (bored/no plans).',
    'Language',
    'images/blog_slang.jpg',
    2
  )
ON CONFLICT DO NOTHING;

-- FAQs iniciales
INSERT INTO public.faqs (question, answer, display_order)
VALUES
  ('What makes Colombian Spanish the best for learners?', 'Colombian Spanish — especially from Bogotá and the Andean region — is globally considered the clearest, most neutral, and most melodic Spanish in the world. It has clear vowel articulation, minimal consonant drops, and a natural rhythm that makes it ideal for beginners and advanced learners alike.', 0),
  ('How does the $15 trial class work?', 'Your trial class is a full 30-minute private 1-on-1 session with a certified native teacher. You will discuss your goals, assess your current level, and experience our cultural methodology firsthand. No subscription or long-term commitment required.', 1),
  ('Can I choose or change my teacher?', 'Yes! You can choose your teacher when booking and change at any time. All our teachers follow the same unified curriculum and keep detailed notes on your progress, so you will never lose continuity.', 2),
  ('What levels do you teach?', 'We teach all levels: Complete Beginner (A1), Elementary (A2), Intermediate (B1/B2), and Advanced/Fluent (C1/C2). We also offer specialized tracks for Medical Spanish, Business Spanish, and DELE exam preparation.', 3),
  ('What platform are classes held on?', 'All classes take place over Zoom or Google Meet. You will receive a calendar invite and direct link immediately upon booking.', 4),
  ('What is your cancellation and refund policy?', 'You can reschedule or cancel any class with up to 12 hours notice for free. If you are not satisfied with your trial class, we offer a 100% money-back guarantee.', 5)
ON CONFLICT DO NOTHING;
