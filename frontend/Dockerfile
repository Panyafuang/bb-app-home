# --- Stage 1: Build the React app ---
FROM node:20-alpine AS builder
RUN npm install -g pnpm
WORKDIR /app

# (Copy พิมพ์เขียว Monorepo - เหมือนเดิม)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/


RUN pnpm install --frozen-lockfile --prod=false

# (Copy โค้ดทั้งหมด - เหมือนเดิม)
COPY . .

# (Build - เหมือนเดิม)
RUN pnpm --filter frontend build


# --- Stage 2: Serve with Nginx (Production) ---
FROM nginx:alpine
COPY --from=builder /app/frontend/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]