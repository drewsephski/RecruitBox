#!/bin/bash

# Production Readiness Test Script
# Run this before deploying to verify everything works

echo "🚀 RecruitBox Production Readiness Check"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file not found${NC}"
    exit 1
fi

echo "✅ .env file found"
echo ""

# Check required environment variables
echo "📋 Checking Environment Variables..."
echo "-----------------------------------"

check_env_var() {
    if grep -q "^$1=" .env; then
        value=$(grep "^$1=" .env | cut -d '=' -f2)
        if [ -n "$value" ]; then
            echo -e "${GREEN}✓${NC} $1"
            return 0
        else
            echo -e "${RED}✗${NC} $1 (empty)"
            return 1
        fi
    else
        echo -e "${RED}✗${NC} $1 (missing)"
        return 1
    fi
}

REQUIRED_VARS=(
    "DATABASE_URL"
    "VITE_CLERK_PUBLISHABLE_KEY"
    "CLERK_SECRET_KEY"
    "POLAR_ACCESS_TOKEN"
    "POLAR_WEBHOOK_SECRET"
    "POLAR_STARTER_PRODUCT_ID"
    "POLAR_AGENCY_PRODUCT_ID"
    "GEMINI_API_KEY"
)

missing_vars=0
for var in "${REQUIRED_VARS[@]}"; do
    if ! check_env_var "$var"; then
        ((missing_vars++))
    fi
done

echo ""

if [ $missing_vars -gt 0 ]; then
    echo -e "${RED}❌ $missing_vars required environment variable(s) missing${NC}"
    echo ""
    echo "Please add missing variables to your .env file"
    exit 1
fi

echo -e "${GREEN}✅ All required environment variables present${NC}"
echo ""

# Check if node_modules exists
echo "📦 Checking Dependencies..."
echo "-----------------------------------"
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  node_modules not found. Installing dependencies...${NC}"
    bun install
else
    echo -e "${GREEN}✓${NC} node_modules exists"
fi
echo ""

# Try to build the project
echo "🔨 Building Project..."
echo "-----------------------------------"
if bun run build; then
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    echo "Fix build errors before deploying"
    exit 1
fi
echo ""

# Check if dist folder was created
if [ -d "dist" ]; then
    echo -e "${GREEN}✓${NC} dist/ folder created"
    echo "  Files: $(find dist -type f | wc -l | tr -d ' ')"
else
    echo -e "${RED}✗${NC} dist/ folder not created"
    exit 1
fi
echo ""

# Check for common issues
echo "🔍 Checking for Common Issues..."
echo "-----------------------------------"

# Check if smooth-scrollbar is in package.json
if grep -q "smooth-scrollbar" package.json; then
    echo -e "${GREEN}✓${NC} smooth-scrollbar dependency present"
else
    echo -e "${YELLOW}⚠️${NC}  smooth-scrollbar not in package.json (will use native scroll)"
fi

# Check if api/server.js exists
if [ -f "api/server.js" ]; then
    echo -e "${GREEN}✓${NC} api/server.js exists (Vercel serverless function)"
else
    echo -e "${RED}✗${NC} api/server.js missing"
    exit 1
fi

# Check if vercel.json exists
if [ -f "vercel.json" ]; then
    echo -e "${GREEN}✓${NC} vercel.json exists"
else
    echo -e "${YELLOW}⚠️${NC}  vercel.json missing (using defaults)"
fi

echo ""

# Summary
echo "📊 Summary"
echo "========================================"
echo -e "${GREEN}✅ All checks passed!${NC}"
echo ""
echo "Next steps:"
echo "1. Commit your changes: git add . && git commit -m 'Fix production issues'"
echo "2. Push to GitHub: git push origin main"
echo "3. Deploy to Vercel: vercel --prod"
echo ""
echo "After deployment:"
echo "- Visit https://your-app.vercel.app/api/health to verify env vars"
echo "- Test scrolling on the homepage"
echo "- Test checkout flow with a pricing plan"
echo ""
echo "📖 See PRODUCTION_FIXES.md for detailed debugging guide"
