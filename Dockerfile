# 1. Aşama: Build aşaması
FROM node:22-alpine AS builder

WORKDIR /app

# Paket yöneticisini yükle
RUN npm install -g pnpm

# Sadece gerekli dosyaları kopyala
COPY package*.json pnpm-lock.yaml* ./

# Hata veren kısmı burada düzelttik: --no-frozen-lockfile ekledik
RUN pnpm install --no-frozen-lockfile

# Tüm kodu kopyala
COPY . .

# 2. Aşama: Çalıştırma aşaması
FROM node:22-alpine

WORKDIR /app

RUN npm install -g pnpm

# Sadece üretim için gerekli paketleri al
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app ./

EXPOSE 3000

# Uygulamayı başlat
CMD ["pnpm", "start"]