# 1. Aşama: Build aşaması
FROM node:22-alpine AS builder

WORKDIR /app

# Sadece gerekli dosyaları kopyala
COPY package*.json ./

# npm with legacy peer deps to handle React version conflicts
RUN npm install --legacy-peer-deps

# Tüm kodu kopyala
COPY . .

# 2. Aşama: Çalıştırma aşaması
FROM node:22-alpine

WORKDIR /app

# Sadece üretim için gerekli paketleri al
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app ./

EXPOSE 3000

# Uygulamayı başlat
CMD ["npm", "start"]