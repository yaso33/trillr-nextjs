-- ============================================
-- Test Query Performance
-- قياس الأداء قبل وبعد التحسين
-- ============================================

-- Test 1: Posts listing (الأكثر استخدام)
EXPLAIN ANALYZE
SELECT id, user_id, content, created_at 
FROM posts 
ORDER BY created_at DESC 
LIMIT 20;

-- ============================================

-- Test 2: User posts
EXPLAIN ANALYZE
SELECT id, content, created_at 
FROM posts 
WHERE user_id = 'some-user-id'
ORDER BY created_at DESC;

-- ============================================

-- Test 3: Recent messages
EXPLAIN ANALYZE
SELECT id, user_id, content, created_at 
FROM messages 
ORDER BY created_at DESC 
LIMIT 50;

-- ============================================

-- Test 4: Count tables
SELECT 
  'posts' as table_name,
  COUNT(*) as row_count
FROM posts
UNION ALL
SELECT 'messages', COUNT(*) FROM messages
UNION ALL
SELECT 'conversations', COUNT(*) FROM conversations
UNION ALL
SELECT 'profiles', COUNT(*) FROM profiles;

-- ============================================

-- ✅ لاحظ في النتائج:
-- - Execution Time: يجب أن تنخفض بعد الـ indexes
-- - Query Plan: استخدام index بدل sequential scan
-- ============================================
