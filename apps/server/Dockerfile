# Build from the repository root:  docker build -f apps/server/Dockerfile .
FROM node:22-slim

WORKDIR /app
ENV NODE_ENV=production

# Install only what the server workspace needs (cached until manifests change).
COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/server/package.json apps/server/
RUN npm ci --workspace @yk/server --include-workspace-root=false --omit=dev

COPY packages/shared packages/shared
COPY apps/server apps/server

# Embedding model cache. Mount a volume here to skip the one-time download on redeploys.
ENV HF_HOME=/data/hf
EXPOSE 8787
CMD ["npm", "run", "start", "--workspace", "@yk/server"]
