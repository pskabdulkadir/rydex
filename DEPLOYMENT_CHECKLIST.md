# Deployment Checklist

Üretim ortamına deployment yapmadan önce bu kontrol listesini tamamlayın.

## 1. Kod Hazırlığı

- [ ] Tüm değişiklikler commit edildi
- [ ] Branş main/master'a merge edildi
- [ ] .env.production dosyası yapılandırılı
- [ ] Tüm secrets Netlify'e yüklendi
- [ ] Code review tamamlandı

## 2. Lokal Testing

```bash
# Type checking
npm run typecheck

# Build test
npm run build

# Local dev server
npm run dev
```

- [ ] npm run typecheck hatasız çalışıyor
- [ ] npm run build başarılı
- [ ] npm run dev hatasız başlatılıyor
- [ ] Test sayfaları çalışıyor

## 3. Build & Performance

```bash
npm run build
```

- [ ] Build boyutu makul (<500KB gzipped)
- [ ] Source maps kapalı (production)
- [ ] CSS minified
- [ ] JS minified
- [ ] Chunking yapılı

**Bundle analizi için:**
```bash
npm run build
# dist/spa klasörünü inceleyebilirsiniz
```

## 4. API Testing

- [ ] All API endpoints respond correctly
- [ ] CORS headers configured
- [ ] Error handling works

Test et:
```bash
curl http://localhost:8080/api/ping
```

Beklenen çıktı:
```json
{"message":"pong"}
```

## 5. Android Client

- [ ] Base URL Netlify sitesine ayarlandı
  - `RetrofitClient.kt` dosyasında kontrol edin
- [ ] Google Play Services'ler güncellenmiş
- [ ] Permissions doğru yapılandırılmış

## 6. Database (Opsiyonel)

Eğer PostgreSQL kullanıyorsanız:

- [ ] Database oluşturuldu
- [ ] Migrations çalıştırıldı
- [ ] Connection string setup edildi
- [ ] Backups yapılandırıldı

## 7. Netlify Setup

### Site Creation

- [ ] Netlify.com'da hesap oluşturdum
- [ ] Yeni site oluşturdum
- [ ] Git repository bağlandı
- [ ] Build settings doğru:
  - Build command: `npm run build`
  - Publish directory: `dist/spa`
  - Functions directory: `netlify/functions`

### Environment Variables

Netlify Dashboard → Site Settings → Environment variables:

```
NODE_ENV=production
NODE_VERSION=22
PING_MESSAGE=pong
```

Opsiyonel:
```
VITE_API_URL=https://your-site.netlify.app
```

### Domain Configuration

- [ ] Custom domain bağlandı (opsiyonel)
- [ ] SSL/TLS certificate otomatik (Netlify tarafından)
- [ ] DNS records doğru

## 8. CI/CD Pipeline (GitHub Actions)

- [ ] `.github/workflows/deploy.yml` dosyası var
- [ ] Secrets yapılandırıldı:
  - [ ] NETLIFY_AUTH_TOKEN
  - [ ] NETLIFY_SITE_ID
- [ ] Workflow testi başarılı

**Setup:**
```bash
# Netlify CLI ile token al
netlify auth:login

# Token'ı GitHub Secrets'e ekle
# Repository Settings → Secrets → Add secret
NETLIFY_AUTH_TOKEN=your_token_here
NETLIFY_SITE_ID=your_site_id
```

## 9. Security Review

- [ ] API keys GitHub'da exposed değil
- [ ] Sensitive data .env.production'da
- [ ] CORS properly configured
- [ ] Rate limiting planned (opsiyonel)
- [ ] Input validation implemented

## 10. Monitoring & Analytics (Opsiyonel)

- [ ] Error tracking (Sentry) setup
- [ ] Analytics configured (Google Analytics)
- [ ] Health checks configured
- [ ] Alerts setup

## 11. Performance Check

- [ ] Google Lighthouse score > 80
- [ ] First Contentful Paint < 3s
- [ ] Largest Contentful Paint < 4s
- [ ] Cumulative Layout Shift < 0.1

**Lighthouse testi:**
1. Chrome DevTools açın
2. Lighthouse tab'a gidin
3. Generate report tıklayın

## 12. Deployment Day

### Pre-deployment (1 hour before)

- [ ] Final commit ve push
- [ ] GitHub Actions workflow başladı
- [ ] Build başarılı (GitHub Actions logs)
- [ ] No errors in build logs

### Post-deployment (immediately after)

```bash
# Health check
curl https://your-site.netlify.app/api/ping

# Test ana sayfalar
- https://your-site.netlify.app/
- https://your-site.netlify.app/map
- https://your-site.netlify.app/magnetometer
```

- [ ] Site açılıyor
- [ ] API responses doğru
- [ ] No console errors
- [ ] Mobile responsive working

### Monitoring (first 24 hours)

- [ ] Error logs kontrol ettim
- [ ] Performance metrics normal
- [ ] User complaints check ettim
- [ ] Deployment successful notified

## 13. Rollback Plan

Herhangi bir sorun olursa:

```bash
# Option 1: Previous deployment başlatmak
# Netlify Dashboard → Deploys → Select previous → Publish deploy

# Option 2: Manual rollback
git revert <commit-hash>
git push origin main
```

## 14. Documentation

- [ ] DEPLOYMENT.md updated
- [ ] README.md updated
- [ ] Android client docs updated
- [ ] Team notified

## 15. Post-Deployment

- [ ] Monitor production for 48 hours
- [ ] Collect user feedback
- [ ] Plan next release
- [ ] Document lessons learned

---

## Useful Commands

```bash
# Build locally
npm run build

# Serve production build
npm run build && npm start

# Type check
npm run typecheck

# Test
npm run test

# Deploy via CLI
netlify deploy --prod --dir=dist/spa

# View deployment logs
netlify logs
```

## Support & Troubleshooting

- **Netlify Support**: https://app.netlify.com/support
- **Documentation**: https://www.builder.io/c/docs/projects
- **GitHub Issues**: Open an issue in repository

---

**Deployment Date**: _______________
**Deployed By**: _______________
**Approved By**: _______________

✅ Tüm kontrol listesi maddesi tamamlandıktan sonra deployment yapabilirsiniz!
