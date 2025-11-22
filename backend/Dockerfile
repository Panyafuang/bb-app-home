# --- Stage 1: Base (เหมือนเดิม) ---
FROM node:20-alpine AS base
RUN npm install -g pnpm

# --- Stage 2: Builder ---
FROM base AS builder
WORKDIR /app

# (Copy พิมพ์เขียว Monorepo - เหมือนเดิม)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/


#    (pnpm install ที่ Root จะติดตั้ง devDependencies ของทุก workspace 
#     เพราะมี --prod=false)
RUN pnpm install --frozen-lockfile --prod=false

# (Copy โค้ดทั้งหมด - เหมือนเดิม)
COPY . .

# (Build และ Deploy - เหมือนเดิม)
RUN pnpm --filter backend build
RUN pnpm --filter backend deploy /app/prod/backend --legacy


# --- Stage 3: Production Image (Final) ---
FROM base AS production
WORKDIR /app
COPY --from=builder /app/prod/backend .
EXPOSE 4000
CMD [ "node", "dist/server.js" ]