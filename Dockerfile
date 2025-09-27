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

# Ensure Supabase client config is available at build time for the browser bundle
# These are safe to expose in the client bundle (anon key + project URL)
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

# Optional: also expose server-side names so server code can read either form
# (server code in this repo falls back from SUPABASE_* to NEXT_PUBLIC_* if needed)
ARG SUPABASE_URL
ARG SUPABASE_ANON_KEY
ENV SUPABASE_URL=$SUPABASE_URL
ENV SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
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

# Provide runtime envs for server-side Supabase and browser hydration safety.
# You can also pass these via `docker run -e` instead of baking them in.
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG SUPABASE_URL
ARG SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV SUPABASE_URL=$SUPABASE_URL
ENV SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY

# Start production server
CMD ["bun", "start", "-H", "0.0.0.0"]
