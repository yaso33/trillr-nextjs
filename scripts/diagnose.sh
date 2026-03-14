#!/bin/bash
# Diagnostic script to check if Community tables exist in Supabase

echo "================================================"
echo "Community Feature Diagnostic"
echo "================================================"
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  DATABASE_URL is not set"
    echo ""
    echo "Set it with:"
    echo "  export DATABASE_URL='postgres://user:password@host:5432/dbname'"
    echo ""
    exit 1
fi

echo "✅ DATABASE_URL is set"
echo ""

# Check tables existence
echo "Checking if Community tables exist..."
echo ""

psql "$DATABASE_URL" -c "
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('communities', 'channels', 'channel_messages', 'community_members', 'channel_members', 'message_reactions', 'live_sessions')
ORDER BY table_name;
" 2>/dev/null

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Connection failed or tables not found"
    echo ""
    echo "Next steps:"
    echo "1. Verify DATABASE_URL is correct"
    echo "2. Run the SQL script to create tables:"
    echo "   bash scripts/apply_sql.sh scripts/communities_simplified.sql"
    exit 1
fi

echo ""
echo "✅ All tables found!"
echo ""

# Check table row counts
echo "Checking data in tables..."
echo ""

psql "$DATABASE_URL" -c "
SELECT 
  'communities' as table_name, COUNT(*) as row_count FROM public.communities
UNION ALL
SELECT 'channels', COUNT(*) FROM public.channels
UNION ALL
SELECT 'channel_messages', COUNT(*) FROM public.channel_messages
UNION ALL
SELECT 'community_members', COUNT(*) FROM public.community_members
UNION ALL
SELECT 'channel_members', COUNT(*) FROM public.channel_members
UNION ALL
SELECT 'message_reactions', COUNT(*) FROM public.message_reactions
UNION ALL
SELECT 'live_sessions', COUNT(*) FROM public.live_sessions
ORDER BY table_name;
" 2>/dev/null

echo ""
echo "✅ Diagnostic complete!"
