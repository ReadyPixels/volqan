FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-workspace.yaml .npmrc tsconfig.json ./
COPY packages ./packages
RUN pnpm install --no-frozen-lockfile

FROM deps AS build
RUN pnpm build

FROM node:22-alpine AS runner
RUN corepack enable
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app .
EXPOSE 3000
CMD ["pnpm", "dev"]
