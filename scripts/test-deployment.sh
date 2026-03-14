#!/bin/bash
# Quick deployment test script
# اختبر التطبيق بسرعة

if [ -z "$1" ]; then
  echo "Usage: npm run test:deploy -- <url>"
  echo "Example: npm run test:deploy -- https://app.onrender.com"
  exit 1
fi

URL=$1
echo "🧪 Testing: $URL"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Counter
PASS=0
FAIL=0

test_endpoint() {
  local endpoint=$1
  local expected=$2
  local desc=$3
  
  echo -n "Testing $desc... "
  
  response=$(curl -s "$URL$endpoint")
  
  if echo "$response" | grep -q "$expected"; then
    echo -e "${GREEN}✓${NC}"
    ((PASS++))
  else
    echo -e "${RED}✗${NC}"
    echo "  Response: $response"
    ((FAIL++))
  fi
}

# Run tests
test_endpoint "/api/health" "ok" "Health check"
test_endpoint "/api/health" "timestamp" "Health timestamp"
test_endpoint "/api/health/detailed" "memory" "Detailed health"
test_endpoint "/api/health/detailed" "services" "Services status"

echo ""
echo "================================"
echo -e "${GREEN}✓ Passed: $PASS${NC}"
echo -e "${RED}✗ Failed: $FAIL${NC}"
echo "================================"

if [ $FAIL -eq 0 ]; then
  echo -e "${GREEN}✅ All tests passed!${NC}"
  exit 0
else
  echo -e "${RED}❌ Some tests failed${NC}"
  exit 1
fi
