# ============================================
# TaskFlow Client Dockerfile
# Next.js 14 App Router với output: 'standalone'
# Standalone giúp Next.js tự đóng gói server + static files
# Không cần Node_modules đầy đủ để chạy, chỉ cần file đã build
# ============================================

# -------- Stage 1: Dependencies --------
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# -------- Stage 2: Builder --------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy node_modules từ stage deps
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# ============================================
# QUAN TRỌNG: NEXT_PUBLIC_ variables phải có sẵn tại build time
# vì chúng được "bake" vào static bundle trong quá trình build
# ============================================
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Build Next.js (standalone output)
# Output: standalone sẽ tạo ra .next/standalone/ chứa server.js
RUN npm run build

# -------- Stage 3: Production Runner --------
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Tạo non-root user để bảo mật
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy public assets (images, favicon...)
COPY --from=builder /app/public ./public

# Copy standalone output (đã bao gồm server.js + static files)
# --chown để đảm bảo quyền sở hữu đúng
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Chuyển sang non-root user
USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Chạy standalone server
CMD ["node", "server.js"]
