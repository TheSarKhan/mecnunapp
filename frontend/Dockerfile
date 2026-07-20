# Build context frontend/ qovluğudur (backend-dən fərqli — backend-ə /ai lazım idi, buna yox).

# ---- deps stage ----
FROM node:22-alpine AS deps
WORKDIR /app

# Yalnız manifestlər: mənbə dəyişəndə bu qat cache-də qalır.
COPY package.json package-lock.json ./
RUN npm ci

# ---- build stage ----
FROM node:22-alpine AS build
WORKDIR /app

COPY --from=deps /app/node_modules node_modules
COPY . .

# DİQQƏT: `NEXT_PUBLIC_*` build zamanı bundle-a HƏKK OLUNUR, işə salındıqda oxunmur.
# Yəni bu image bir mühitə bağlıdır — staging və prod ayrı build tələb edir. Runtime env
# dəyişəni qoymaq işə yaramır; dəyəri dəyişmək üçün image yenidən qurulmalıdır.
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

# ---- runtime stage ----
FROM node:22-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
# 0.0.0.0 şərtdir: default `localhost` konteynerin içini göstərir və port map olunsa da
# kənardan heç nə cavab almır.
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

RUN addgroup -S mecnun && adduser -S mecnun -G mecnun

# standalone `server.js`-i və onun izlədiyi node_modules alt dəstini gətirir.
COPY --from=build --chown=mecnun:mecnun /app/.next/standalone ./
# Bu ikisi standalone-a avtomatik düşmür — `output: "standalone"` sənədində yazılan şərt.
COPY --from=build --chown=mecnun:mecnun /app/.next/static ./.next/static
COPY --from=build --chown=mecnun:mecnun /app/public ./public

USER mecnun
EXPOSE 3000
CMD ["node", "server.js"]
