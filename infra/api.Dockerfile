# Stage 1: build
FROM node:22-alpine AS builder
WORKDIR /app

# Copy workspace root manifests
COPY package.json yarn.lock ./
COPY packages/shared/package.json ./packages/shared/

# Copy API manifest
COPY apps/api/package.json ./apps/api/

RUN yarn install --frozen-lockfile

COPY tsconfig.base.json ./
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

RUN yarn workspace @monabit/api build

# Stage 2: production image
FROM node:22-alpine AS runner
WORKDIR /app

# Copy only what is needed to run
COPY package.json yarn.lock ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/

RUN yarn install --frozen-lockfile --production

COPY --from=builder /app/apps/api/dist ./apps/api/dist

EXPOSE 8080

CMD ["node", "apps/api/dist/index.js"]
