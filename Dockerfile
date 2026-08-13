FROM node:22-alpine

WORKDIR /app

RUN corepack enable

COPY backend/package.json backend/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY backend/ ./
RUN pnpm run build && pnpm prune --prod

ENV NODE_ENV=production

EXPOSE 8080

CMD ["node", "dist/main"]
