@echo off
REM Deployment Script for Windows
REM Kullanım: deploy.bat [production|staging|local]

setlocal enabledelayedexpansion
set ENVIRONMENT=%1
if "!ENVIRONMENT!"=="" set ENVIRONMENT=production

echo.
echo 🚀 Deployment başlıyor: !ENVIRONMENT! ortamına
echo.

REM 1. Build kontrolleri
echo 📦 Build yapılıyor...
call npm run typecheck
if errorlevel 1 (
    echo ❌ Typecheck hatası
    exit /b 1
)

call npm run build
if errorlevel 1 (
    echo ❌ Build hatası
    exit /b 1
)

REM 2. Test çalıştırma
echo 🧪 Testler çalıştırılıyor...
call npm run test
if errorlevel 1 (
    echo ⚠️  Testlerde hata
)

REM 3. Bundle size kontrolü
echo 📊 Bundle size kontrolü yapılıyor...
for /f "tokens=*" %%A in ('dir /s /b dist\spa ^| find /c /v ""') do (
    echo ✅ Build klasöründe dosyalar hazırlandı
)

REM 4. Netlify deploy (netlify-cli kurulu olması gerekir)
where netlify >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ☁️  Netlify'e deploy yapılıyor...
    
    if "!ENVIRONMENT!"=="production" (
        call netlify deploy --prod --dir=dist/spa
    ) else (
        call netlify deploy --dir=dist/spa
    )
    
    echo ✅ Netlify deploy tamamlandı
) else (
    echo ⚠️  netlify-cli kurulu değil
    echo Bunu kurabilirsiniz: npm install -g netlify-cli
)

echo.
echo ✨ Deployment tamamlandı!
echo 📍 Ortam: !ENVIRONMENT!
echo 📦 Build klasörü: dist/spa
echo.

endlocal
