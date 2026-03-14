-- DEBUGGING SCRIPT FOR COMMUNITIES
-- Run this in Supabase SQL Editor to debug the issue

-- 1. Check if table exists
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'communities'
) AS table_exists;

-- 2. Count communities
SELECT COUNT(*) as total_communities FROM public.communities;

-- 3. List all communities
SELECT id, name, owner_id, visibility, created_at 
FROM public.communities 
ORDER BY created_at DESC LIMIT 10;

-- 4. Check RLS status
SELECT * FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('communities', 'channels', 'channel_messages');

-- 5. Check policies
SELECT * FROM pg_policies 
WHERE tablename = 'communities';

-- 6. Test SELECT policy for authenticated
-- Replace 'auth.uid()' with your actual user ID to test
SELECT * FROM public.communities;

-- 7. Check if user exists in profiles
SELECT id, username FROM public.profiles LIMIT 5;

-- 8. If communities table is empty, insert test data
INSERT INTO public.communities (name, description, visibility, owner_id)
VALUES ('Test Community', 'This is a test', 'public', 'test-owner-id')
ON CONFLICT DO NOTHING;

-- 9. Drop problematic policies (if needed)
-- DROP POLICY IF EXISTS "communities_select_authenticated" ON public.communities;
-- DROP POLICY IF EXISTS "communities_insert_authenticated" ON public.communities;

-- 10. Create simple permissive policy (temporary)
-- DROP POLICY IF EXISTS "all_authenticated" ON public.communities;
-- CREATE POLICY "all_authenticated" ON public.communities 
--   FOR ALL 
--   USING (auth.role() = 'authenticated') 
--   WITH CHECK (auth.role() = 'authenticated');
