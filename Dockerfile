# syntax=docker/dockerfile:1
# Build context must be the repo root (pnpm workspace), e.g.:
#   docker build --target runtime-api -t honnobu-api .
#   docker build --target runtime-web -t honnobu-web .

FROM node:22-alpine AS base
RUN npm install -g pnpm@11.8.0 && pnpm config set store-dir /pnpm/store
WORKDIR /app
COPY . .

FROM base AS prod-deps-api
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --filter=api... --prod --frozen-lockfile

FROM base AS prod-deps-web
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --filter=web... --prod --frozen-lockfile

FROM base AS build-api
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --filter=api... --frozen-lockfile
RUN pnpm --filter api build

FROM base AS build-web
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --filter=web... --frozen-lockfile
RUN pnpm --filter web build

FROM node:22-alpine AS runtime-api
ENV NODE_ENV=production
WORKDIR /app/apps/api
COPY --from=prod-deps-api /app/node_modules /app/node_modules
COPY --from=prod-deps-api /app/apps/api/node_modules ./node_modules
COPY --from=prod-deps-api /app/packages /app/packages
COPY --from=build-api /app/apps/api/dist ./dist
COPY apps/api/package.json ./package.json
USER node
EXPOSE 3000
CMD ["node", "dist/main.js"]

FROM node:22-alpine AS runtime-web
ENV NODE_ENV=production
WORKDIR /app/apps/web
COPY --from=prod-deps-web /app/node_modules /app/node_modules
COPY --from=prod-deps-web /app/apps/web/node_modules ./node_modules
COPY --from=prod-deps-web /app/packages /app/packages
COPY --from=build-web /app/apps/web/dist ./dist
COPY apps/web/package.json ./package.json
USER node
EXPOSE 4000
CMD ["node", "dist/web/server/server.mjs"]