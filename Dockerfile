# Base image
FROM oven/bun:1.2.12 AS builder

WORKDIR /app

# Install dependencies (separated for better cache utilization)
COPY package.json bun.lock ./
RUN bun install

# Copy source code and build
COPY . .
# Pass build-time secrets for Next build that validates DB env
ARG DATABASE_URL
ARG DATABASE_RESTRICTED_URL
ENV DATABASE_URL=$DATABASE_URL
ENV DATABASE_RESTRICTED_URL=$DATABASE_RESTRICTED_URL
RUN bun next telemetry disable
RUN bun run build

# Runtime stage
FROM oven/bun:1.2.12 AS runner
WORKDIR /app


ENV DEBUG="next:*"


# Copy only necessary files from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/bun.lock ./bun.lock
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/config ./config

# Start production server
CMD ["bun", "start", "-H", "0.0.0.0"]
