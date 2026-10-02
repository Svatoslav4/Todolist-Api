FROM node:22-slim AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
# openssl is required by the Prisma engines
RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/* \
  && npm install -g pnpm@12.6.0
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM deps AS build
COPY prisma ./prisma
COPY nest-cli.json tsconfig.json tsconfig.build.json ./
COPY src ./src
RUN pnpm exec prisma generate && pnpm build

FROM deps AS dev
COPY prisma ./prisma
RUN pnpm exec prisma generate
COPY . .
EXPOSE 3000
CMD ["pnpm", "start:dev"]

FROM base AS prod
ENV NODE_ENV=production
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# Full node_modules are kept so the prisma CLI is available for `migrate deploy`
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY prisma ./prisma
USER node
EXPOSE 3000
CMD ["sh", "-c", "pnpm exec prisma migrate deploy && node dist/main"]
