-- ============================================
-- فحص هيكل الجداول والأعمدة الفعلية
-- ============================================

-- شاهد جميع الجداول
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- ============================================

-- شاهد أعمدة جدول posts
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'posts'
ORDER BY ordinal_position;

-- ============================================

-- شاهد أعمدة جدول messages
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'messages'
ORDER BY ordinal_position;

-- ============================================

-- شاهد أعمدة جدول conversations
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'conversations'
ORDER BY ordinal_position;

-- ============================================

-- شاهد أعمدة جدول profiles
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- ============================================

-- شاهد أعمدة جدول communities
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'communities'
ORDER BY ordinal_position;

-- ============================================

-- شاهد جميع الجداول والأعمدة
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;
