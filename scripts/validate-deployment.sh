#!/bin/bash
# Deployment Validation Script
# فحص سريع قبل الـ deployment

set -e

echo "🔍 فحص الـ Deployment..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counter
PASS=0
FAIL=0

# Function to check
check() {
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} $1"
    ((PASS++))
  else
    echo -e "${RED}✗${NC} $1"
    ((FAIL++))
  fi
}

# 1. Node Version
echo "📦 فحص المتطلبات..."
NODE_VERSION=$(node -v)
echo "   Node.js: $NODE_VERSION"
[[ "$NODE_VERSION" > "v20" ]] && check "Node.js version >= 20" || { echo "   ❌ Node.js must be >= 20"; ((FAIL++)); }

# 2. Dependencies
echo ""
echo "📚 فحص الـ Dependencies..."
npm ls > /dev/null 2>&1
check "Dependencies installed"

# 3. Environment Variables
echo ""
echo "🔐 فحص Environment Variables..."
[ -f ".env" ] && check ".env file exists" || { echo "   ⚠️  .env not found (OK for CI)"; }
[ -f ".env.production" ] && check ".env.production exists" || echo "   ⚠️  .env.production not found"

# 4. Code Quality
echo ""
echo "🧹 فحص جودة الكود..."
npm run check > /dev/null 2>&1
check "Type checking passed"

npm run lint > /dev/null 2>&1
check "Linting passed"

# 5. Tests
echo ""
echo "🧪 تشغيل الـ Tests..."
npm run test > /dev/null 2>&1
check "Unit tests passed"

# Note: Skip E2E Tests in CI for speed
# npm run test:e2e > /dev/null 2>&1
# check "E2E tests passed"

# 6. Build
echo ""
echo "🏗️  بناء المشروع..."
npm run build > /dev/null 2>&1
check "Build successful"

# 7. Build Size
echo ""
echo "📊 حجم الـ Build..."
if [ -d "dist" ]; then
  TOTAL_SIZE=$(du -sh dist | cut -f1)
  echo "   Total: $TOTAL_SIZE"
  
  CLIENT_SIZE=$(du -sh dist/client 2>/dev/null | cut -f1 || echo "N/A")
  echo "   Client: $CLIENT_SIZE"
  
  SERVER_SIZE=$(du -sh dist/server 2>/dev/null | cut -f1 || echo "N/A")
  echo "   Server: $SERVER_SIZE"
fi

# 8. Secrets Check
echo ""
echo "🔒 فحص الـ Secrets..."
if grep -r "SERVICE_KEY\|SESSION_SECRET" dist/ 2>/dev/null | grep -v node_modules > /dev/null; then
  echo -e "${RED}✗${NC} Secrets found in build!"
  ((FAIL++))
else
  check "No secrets exposed in build"
fi

# 9. Required Files
echo ""
echo "📋 فحص الملفات الضرورية..."
[ -f "Dockerfile" ] && check "Dockerfile exists" || { echo -e "${RED}✗${NC} Dockerfile missing"; ((FAIL++)); }
[ -f "docker-compose.yml" ] && check "docker-compose.yml exists" || { echo -e "${RED}✗${NC} docker-compose.yml missing"; ((FAIL++)); }
[ -f ".dockerignore" ] && check ".dockerignore exists" || { echo -e "${RED}✗${NC} .dockerignore missing"; ((FAIL++)); }
[ -f "render.yaml" ] && check "render.yaml exists" || { echo -e "${RED}✗${NC} render.yaml missing"; ((FAIL++)); }
[ -f "railway.json" ] && check "railway.json exists" || { echo -e "${RED}✗${NC} railway.json missing"; ((FAIL++)); }
[ -f "DEPLOYMENT.md" ] && check "DEPLOYMENT.md exists" || { echo -e "${RED}✗${NC} DEPLOYMENT.md missing"; ((FAIL++)); }
[ -f "OPERATIONS.md" ] && check "OPERATIONS.md exists" || { echo -e "${YELLOW}!${NC} OPERATIONS.md missing (recommended)"; }

# 10. Docker Check
echo ""
echo "🐳 فحص Docker..."
if command -v docker &> /dev/null; then
  docker --version | grep -oE '[0-9]+\.[0-9]+' > /dev/null
  check "Docker installed"
else
  echo -e "${YELLOW}!${NC} Docker not found (OK for cloud deployment)"
fi

# Summary
echo ""
echo "================================"
echo "📊 النتيجة النهائية:"
echo -e "  ${GREEN}✓ النجاحات: $PASS${NC}"
echo -e "  ${RED}✗ الأخطاء: $FAIL${NC}"
echo "================================"

# Exit Code
if [ $FAIL -eq 0 ]; then
  echo ""
  echo -e "${GREEN}✅ جاهز للـ Deployment!${NC}"
  exit 0
else
  echo ""
  echo -e "${RED}❌ يجب إصلاح الأخطاء قبل الـ Deployment${NC}"
  exit 1
fi
