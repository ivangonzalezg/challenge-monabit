# syntax=docker/dockerfile:1

# Stage 1: build web (Vite SPA)
FROM node:22-alpine AS web-builder
WORKDIR /app

COPY package.json yarn.lock ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/web/package.json ./apps/web/

RUN yarn install --frozen-lockfile

COPY tsconfig.base.json ./
COPY packages/shared ./packages/shared
COPY apps/web ./apps/web

ARG VITE_API_URL=""
ENV VITE_API_URL=${VITE_API_URL}

RUN yarn workspace @monabit/web build

# Stage 2: build API
FROM node:22-alpine AS api-builder
WORKDIR /app

COPY package.json yarn.lock ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/

RUN yarn install --frozen-lockfile

COPY tsconfig.base.json ./
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

RUN yarn workspace @monabit/api build

# Stage 3: production runtime
FROM node:22-alpine AS runner
WORKDIR /app

COPY package.json yarn.lock ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/

RUN yarn install --frozen-lockfile --production

COPY --from=api-builder /app/apps/api/dist ./apps/api/dist
COPY --from=web-builder /app/apps/web/dist ./apps/api/dist/public

EXPOSE 8080

CMD ["node", "apps/api/dist/index.js"]
