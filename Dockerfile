# ─────────────────────────────────────────────────────────────────────────────
#  Dankrupt — multi-stage Docker build
#
#  Stage 1 (deps)    install npm deps cleanly, no source code
#  Stage 2 (builder) build Next.js; produces .next/standalone
#  Stage 3 (runner)  minimal Alpine image, non-root, ~200 MB
# ─────────────────────────────────────────────────────────────────────────────

# ── Stage 1: install dependencies ────────────────────────────────────────────
FROM node:22-alpine AS deps

# Prisma's query engine is a native binary that needs OpenSSL.
# libc6-compat provides glibc shims needed by some Node native modules.
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Copy manifests and prisma schema before anything else so this layer is
# cached until package.json or schema.prisma changes.
COPY package*.json ./
COPY prisma/schema.prisma ./prisma/schema.prisma

# --ignore-scripts skips the postinstall that tries to write gif.worker.js into
# public/ — public/ doesn't exist yet in this stage. We handle it explicitly
# in the builder stage once the full source tree is present.
RUN npm ci --ignore-scripts


# ── Stage 2: build ────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Carry deps across from stage 1
COPY --from=deps /app/node_modules ./node_modules

# Copy full source (respects .dockerignore — node_modules, .next, .env* excluded)
COPY . .

# ── Explicit postinstall tasks (skipped by --ignore-scripts above) ────────────
# 1. Copy gif.js web worker into public/ so it's served as a static asset
RUN node -e "require('fs').copyFileSync( \
      'node_modules/gif.js/dist/gif.worker.js', \
      'public/gif.worker.js')"

# 2. Generate Prisma client.
#    schema.prisma sets binaryTargets = ["native", "linux-musl-openssl-3.0.x"]
#    so the right .node binary for this Alpine container is produced here.
RUN npx prisma generate

# 3. Build Next.js (produces .next/standalone via output: "standalone")
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build


# ── Stage 3: production runner ────────────────────────────────────────────────
FROM node:22-alpine AS runner

RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    # Railway injects PORT at runtime; Next.js standalone server.js reads it.
    PORT=3000 \
    # Bind to all interfaces so traffic reaches the container.
    HOSTNAME=0.0.0.0

# Run as a non-root user (security best practice)
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# ── Next.js standalone bundle ─────────────────────────────────────────────────
# .next/standalone contains server.js + minimal node_modules (including
# @prisma/client with its .node binary, thanks to outputFileTracingIncludes).
# public/ and .next/static are not included in standalone — copy them manually.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static     ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public           ./public

# ── Prisma CLI + migrations ───────────────────────────────────────────────────
# The runtime client (@prisma/client) is already in the standalone bundle.
# We only need the prisma CLI package so that the Railway release command
# (`node node_modules/prisma/build/index.js migrate deploy`) can run.
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma/migrations   ./prisma/migrations
COPY --from=builder --chown=nextjs:nodejs /app/prisma/schema.prisma ./prisma/schema.prisma

USER nextjs

EXPOSE 3000

# Railway's release command (see railway.toml) runs `prisma migrate deploy`
# before this CMD is executed, so the DB is always up-to-date on startup.
CMD ["node", "server.js"]
