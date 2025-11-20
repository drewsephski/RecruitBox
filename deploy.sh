#!/bin/bash

# RecruitBox Vercel Deployment Script
# This script automates the deployment process to Vercel

set -e  # Exit on error

echo "🚀 RecruitBox Vercel Deployment Script"
echo "======================================="
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
    echo "✅ Vercel CLI installed"
else
    echo "✅ Vercel CLI found"
fi

# Check if logged in to Vercel
echo ""
echo "Checking Vercel authentication..."
if ! vercel whoami &> /dev/null; then
    echo "❌ Not logged in to Vercel. Please login:"
    vercel login
else
    echo "✅ Logged in to Vercel as: $(vercel whoami)"
fi

# Verify we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Are you in the project root?"
    exit 1
fi

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🔨 Testing build locally..."
npm run vercel-build

echo ""
echo "✅ Build successful!"
echo ""
echo "Choose deployment type:"
echo "1) Preview deployment (test before production)"
echo "2) Production deployment"
echo ""
read -p "Enter choice (1 or 2): " choice

case $choice in
    1)
        echo ""
        echo "🚀 Deploying to preview..."
        vercel
        ;;
    2)
        echo ""
        echo "🚀 Deploying to production..."
        vercel --prod
        ;;
    *)
        echo "❌ Invalid choice. Exiting."
        exit 1
        ;;
esac

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Check deployment logs in Vercel Dashboard"
echo "2. Update Polar webhook URL to your Vercel domain"
echo "3. Add Vercel domain to Clerk allowed origins"
echo "4. Test the checkout flow end-to-end"
echo ""
echo "📚 See DEPLOYMENT_CHECKLIST.md for detailed testing steps"
