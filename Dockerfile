# 1. Aşama: Build aşaması
FROM node:22-alpine AS builder

WORKDIR /app

# Firebase config'leri ARG olarak al (Render environment variables'dan gelir)
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_FIREBASE_STORAGE_BUCKET
ARG VITE_FIREBASE_MESSAGING_SENDER_ID
ARG VITE_FIREBASE_APP_ID

# ENV olarak set et (Vite build sırasında kullanılsın)
ENV VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY
ENV VITE_FIREBASE_AUTH_DOMAIN=$VITE_FIREBASE_AUTH_DOMAIN
ENV VITE_FIREBASE_PROJECT_ID=$VITE_FIREBASE_PROJECT_ID
ENV VITE_FIREBASE_STORAGE_BUCKET=$VITE_FIREBASE_STORAGE_BUCKET
ENV VITE_FIREBASE_MESSAGING_SENDER_ID=$VITE_FIREBASE_MESSAGING_SENDER_ID
ENV VITE_FIREBASE_APP_ID=$VITE_FIREBASE_APP_ID

# Sadece gerekli dosyaları kopyala
COPY package*.json ./

# npm with legacy peer deps to handle React version conflicts
RUN npm install --legacy-peer-deps

# Tüm kodu kopyala
COPY . .

# Client ve server'ı build et
RUN npm run build

# 2. Aşama: Çalıştırma aşaması
FROM node:22-alpine

WORKDIR /app

# Sadece üretim için gerekli paketleri al
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/dist-server ./dist-server
COPY --from=builder /app/server ./server
COPY --from=builder /app/shared ./shared

EXPOSE 3000

# Uygulamayı başlat
CMD ["npm", "start"]