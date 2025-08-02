#!/bin/bash

echo "🎨 Paintbox Direct Render Deployment"
echo "==================================="
echo ""
echo "This script provides manual deployment instructions for Render.com"
echo ""

# Check if build succeeds
echo "📦 Testing build..."
if npm run build > /dev/null 2>&1; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed. Please fix errors first."
    exit 1
fi

echo ""
echo "✅ Application is ready for deployment!"
echo ""
echo "📋 Manual Deployment Steps:"
echo ""
echo "1. Push your code to GitHub:"
echo "   git add ."
echo "   git commit -m 'Deploy Paintbox to Render'"
echo "   git push origin main"
echo ""
echo "2. Go to https://dashboard.render.com"
echo ""
echo "3. Create a new Web Service:"
echo "   - Connect your GitHub repository"
echo "   - Select the branch: main"
echo "   - Root Directory: projects/paintbox"
echo "   - Runtime: Node"
echo "   - Build Command: npm install && npm run build"
echo "   - Start Command: npm start"
echo ""
echo "4. Configure Environment Variables in Render Dashboard:"

# Show the environment variables from .env.render
if [ -f .env.render ]; then
    echo ""
    echo "   Copy these environment variables to Render:"
    echo "   ----------------------------------------"
    grep -v '^#' .env.render | grep -v '^$' | while IFS= read -r line; do
        key=$(echo "$line" | cut -d'=' -f1)
        echo "   - $key"
    done
    echo ""
    echo "   ⚠️  IMPORTANT: Copy the actual values from .env.render"
    echo "   Do not commit .env.render to version control!"
else
    echo "   ❌ .env.render not found. Run: npm run deploy:secrets"
    exit 1
fi

echo ""
echo "5. Advanced Settings:"
echo "   - Auto-Deploy: Yes (optional)"
echo "   - Health Check Path: /api/health"
echo ""
echo "6. Click 'Create Web Service'"
echo ""
echo "📱 Your app will be deployed to:"
echo "   https://paintbox-app.onrender.com"
echo ""
echo "🚀 Features Included:"
echo "   ✅ Side-based measurement system"
echo "   ✅ CompanyCam photo integration"
echo "   ✅ Salesforce CRM sync"
echo "   ✅ Good/Better/Best pricing"
echo "   ✅ Mobile-optimized PWA"
echo "   ✅ Offline-first architecture"
echo ""
echo "Need help? Check the deployment guide in RENDER_DEPLOYMENT_GUIDE.md"
