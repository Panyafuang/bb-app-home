# backend/Dockerfile (วางทับไฟล์เดิมได้เลย)
# Multi-stage build: stage "builder" สร้าง dist แล้ว stage "runtime" เอาเฉพาะสิ่งที่ต้องใช้ไปรันจริง
# ข้อสำคัญ: ไม่ copy ไฟล์ .env เข้าไปใน image (อ่านจาก docker-compose env_file แทน)

# --- Stage: builder ---
FROM node:18-alpine AS builder
WORKDIR /usr/src/app

# ถ้าต้อง build native deps ให้ติดตั้ง build tools (ตามที่ project ของคุณต้องการ)
RUN apk add --no-cache python3 make g++ bash

# copy เฉพาะ package files ก่อนเพื่อลดการ re-run npm ci เวลา source code เปลี่ยนบ่อย
COPY package*.json ./

# ติดตั้ง dependencies สำหรับการ build
RUN npm ci

# copy source ทั้งโปรเจค
COPY . .

# สั่ง build (tsc => dist)
RUN npm run build

# --- Stage: runtime (lightweight) ---
FROM node:18-alpine AS runtime

# สร้าง user ที่ไม่ใช่ root เพื่อความปลอดภัย
RUN addgroup -S app && adduser -S -G app app
WORKDIR /usr/src/app

# ติดตั้งเฉพาะ production dependencies
COPY package*.json ./
RUN npm ci --production

# copy ผลลัพธ์ build และ node_modules จาก builder
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules

# NOTE: ไม่ควรคัดไฟล์ .env เข้า image ถ้าคุณใช้ docker-compose env_file (ปลอดภัยกว่า)
# ถ้าต้องการ default env ใน image ให้ใช้ .env.example และ copy เฉพาะไฟล์ตัวอย่างเท่านั้น

# ตั้งเจ้าของและรันเป็น user "app"
RUN chown -R app:app /usr/src/app
USER app

ENV NODE_ENV=production
EXPOSE 4000

# ใช้ dotenv ผ่าน -r dotenv/config เพื่อโหลด env vars ก่อนรัน
CMD ["node", "-r", "dotenv/config", "./dist/server.js"]
