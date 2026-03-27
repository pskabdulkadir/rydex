# Deployment Guide

Bu rehber, uygulamayı Netlify'e deployment yapılması için yapılandırılan yönergeleri içerir.

## Netlify Deployment

### 1. Başlangıç

#### Netlify CLI ile local test etme:
```bash
npm install -g netlify-cli
netlify dev
```

#### Git deposu ile otomatik deployment:

1. GitHub / GitLab / Bitbucket deposunda push yapın
2. Netlify'de yeni site oluşturun
3. Git deposunu bağlayın
4. Build ayarlarını doğrulayın:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist/spa`
   - **Functions directory**: `netlify/functions`

### 2. Environment Variables

Netlify Site Settings → Environment → Add variables:

```
NODE_ENV=production
NODE_VERSION=22
PING_MESSAGE=pong
```

### 3. Build Optimizasyonları

- **Code Splitting**: Vite otomatik olarak chunk'lar halinde kodu böler
- **Lazy Loading**: Routes lazy loaded (React.lazy + Suspense)
- **CSS Minification**: TailwindCSS otomatik purge ve minify
- **Bundle Analysis**: `npm run build` sonra `dist/spa` klasörünü kontrol edin

### 4. Performance

#### Cache Strategy:
- **HTML**: 0s (no-cache) - her zaman fresh
- **JS/CSS (hashed)**: 1 yıl - aggressively cached
- **API responses**: QueryClient caching (5min staleTime)

#### Metrics:
- **Bundle Size**: ~200KB gzipped (Leaflet + React + UI components)
- **FCP**: <2s (First Contentful Paint)
- **LCP**: <3s (Largest Contentful Paint)

### 5. API Routes

Tüm API endpoint'leri `/api/*` prefix'i ile erişilebilir:

- `POST /api/measurements/save` - Tek ölçüm kaydet
- `POST /api/measurements/batch` - Toplu ölçüm kaydet
- `GET /api/measurements` - Ölçümleri getir (date range ile filter)
- `GET /api/detections` - Tespit edilen anomalileri getir
- `GET /api/history` - Geçmiş verilerini getir
- `GET /api/ping` - Health check

### 6. Android Client Configuration

Android uygulamasında backend URL'sini ayarlamak için:

`ANDROID_PROJECT/app/src/main/kotlin/com/example/magnetictreasure/data/api/RetrofitClient.kt`:

```kotlin
private const val BASE_URL = "https://your-netlify-site.netlify.app/"
```

### 7. Database Setup (Optional)

Üretim ortamında kalıcı veri depolaması için:

#### PostgreSQL (Recommended):
- Neon.tech (Netlify ile integrate)
- Supabase

#### Konfigürasyon:
```env
DATABASE_URL=postgresql://user:pass@host:5432/dbname
```

#### Migration:
```bash
npm run db:migrate
```

### 8. Monitoring

Errors ve performance tracking:

#### Sentry (Error Tracking):
```env
VITE_SENTRY_DSN=https://key@sentry.io/project-id
```

#### Analytics:
```env
VITE_ANALYTICS_ID=UA-XXXXXXXX-X
```

### 9. Security

- HTTPS otomatik (Netlify)
- CORS yapılandırılı (`server/index.ts`)
- Rate limiting (optional, eklenti gerekli)
- API key validation (backend'de eklenebilir)

### 10. Rollback

Deployment geri almak:

1. Netlify Dashboard → Deploys → Select previous
2. Click "Publish deploy"

## Local Development

```bash
# Development server
npm run dev

# Build for production
npm run build

# Type checking
npm run typecheck

# Testing
npm run test
```

## Troubleshooting

### Build hatası
```bash
npm run build --verbose
```

### API bağlantı hatası
- CORS headers kontrol et (`server/index.ts`)
- Environment variables kontrol et
- Netlify logs: `netlify logs`

### Performance sorunları
- Bundle size analizi: `npm run build --analyze`
- Chrome DevTools → Performance tab
- Lighthouse report

## Next Steps

1. [ ] Netlify deploy et
2. [ ] Android client'ı production URL'e yönlendir
3. [ ] Database setup (opsiyonel)
4. [ ] Error tracking setup (opsiyonel)
5. [ ] DNS konfigürasyonu (custom domain)
