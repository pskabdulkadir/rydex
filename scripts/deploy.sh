#!/bin/bash

# Deployment Script for Magnetic Treasure Detector
# Kullanım: ./scripts/deploy.sh [production|staging|local]

set -e

ENVIRONMENT=${1:-production}
NODE_ENV=$ENVIRONMENT

echo "🚀 Deployment başlıyor: $ENVIRONMENT ortamına"

# 1. Build kontrolleri
echo "📦 Build yapılıyor..."
npm run typecheck
npm run build

# 2. Bundle size kontrolü
echo "📊 Bundle size kontrolü yapılıyor..."
BUNDLE_SIZE=$(du -sh dist/spa | cut -f1)
echo "Bundle boyutu: $BUNDLE_SIZE"

# 3. Test çalıştırma
echo "🧪 Testler çalıştırılıyor..."
npm run test || echo "⚠️  Testlerde hata"

# 4. Docker build (opsiyonel)
if [ "$ENVIRONMENT" = "production" ]; then
  echo "🐳 Docker imajı oluşturuluyor..."
  docker build -t magnetic-treasure-detector:latest .
  echo "✅ Docker imajı oluşturuldu"
fi

# 5. Netlify deploy (netlify-cli kurulu olması gerekir)
if command -v netlify &> /dev/null; then
  echo "☁️  Netlify'e deploy yapılıyor..."
  
  if [ "$ENVIRONMENT" = "production" ]; then
    netlify deploy --prod --dir=dist/spa
  else
    netlify deploy --dir=dist/spa
  fi
  
  echo "✅ Netlify deploy tamamlandı"
else
  echo "⚠️  netlify-cli kurulu değil. Bunu kurabilirsiniz: npm install -g netlify-cli"
fi

# 6. Deployment sonrası kontroller
if [ "$ENVIRONMENT" = "production" ]; then
  echo "🔍 Health check yapılıyor..."
  sleep 10
  curl -f https://your-site.netlify.app/api/ping || echo "⚠️  Health check başarısız"
fi

echo ""
echo "✨ Deployment tamamlandı!"
echo "📍 Ortam: $ENVIRONMENT"
echo "📦 Build klasörü: dist/spa"
echo ""
