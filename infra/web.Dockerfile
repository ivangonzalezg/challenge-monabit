# TODO: Finalize deployment approach before completing this Dockerfile.
# Options: static hosting (Cloud Storage + CDN), Cloud Run serving the built assets via nginx,
# or a Node server rendering the Vite preview build.
#
# Placeholder multi-stage build — adjust the final stage once the deployment target is decided.

# Stage 1: build
FROM node:22-alpine AS builder
WORKDIR /app

# Copy workspace root manifests
COPY package.json yarn.lock ./
COPY packages/shared/package.json ./packages/shared/

# Copy web app manifest
COPY apps/web/package.json ./apps/web/

RUN yarn install --frozen-lockfile

COPY tsconfig.base.json ./
COPY packages/shared ./packages/shared
COPY apps/web ./apps/web

RUN yarn workspace @monabit/web build

# Stage 2: serve (nginx placeholder)
FROM nginx:stable-alpine AS runner
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
