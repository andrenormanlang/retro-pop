# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first for better layer caching
COPY package.json ./

# Install dependencies with --legacy-peer-deps to resolve React 19 compatibility issues
RUN npm install --legacy-peer-deps

# Copy application code - node_modules should be excluded by .dockerignore
COPY . .


# Set all required environment variables for build
ENV COMIC_VINE_API_KEY=c263f0b6fb04aaeaa789c6b3d155ee46b61ee5d5
ENV METRON_API_AUTH_HEADER=YW5kcmVub3JtYW5sYW5nOlBpeGllRWx2aW5DYXQ3NyM=
ENV SUPERHERO_ACCESS_TOKEN=10159033377696156
ENV MARVEL_PUBLIC_KEY=4cc0a3d6045e6c6d9ad0f39f2815eee7
ENV MARVEL_PRIVATE_KEY=1a61bba0d1afce62de3bde9ce1d412531a0a2865
ENV CHARACTERS_API_URL=https://superhero-api-characters-list.onrender.com/characters
ENV NEXT_PUBLIC_SUPABASE_URL=https://okepievzdelqzjwhsueu.supabase.co
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rZXBpZXZ6ZGVscXpqd2hzdWV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTc5MzEzNjksImV4cCI6MjAzMzUwNzM2OX0.m5mp1q1d45O-GIJf1FwE5lMh0T0Xnfqr61AE2rLm-ls
ENV NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rZXBpZXZ6ZGVscXpqd2hzdWV1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxNzkzMTM2OSwiZXhwIjoyMDMzNTA3MzY5fQ.6BrQUJg41sOIp_6cZEjqnC-F4MrZf8XfZe_A2mOfyl8
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51PVr5pRvTu40YyhMzfTbCaAqOgLqZjSO25atuBedUTZw4ZwmuU1NPBXWmZ4XVc0UBEpNMWiAjfWZfjdp9brmxWWc00zTZ2r0db
ENV STRIPE_SECRET_KEY=sk_test_51PVr5pRvTu40YyhMBBFarVcGPhkiyrA0XPOs5ecFUWwBxWlgoVCFlce0qrsMTZA6KM8D8kYbnkXGZ8UJB9LTz97M006addIIjL
ENV SUPABASE_ACCESS_TOKEN=sbp_4f3d25579aa903f148e2f9fcf1018b6f5ce88060
ENV GEMINI_API_KEY=AIzaSyA8AxZcIVemXpydDVS7WA5Fr6ldf9w0oe4

# Important: Add these variables to fix the specific error
ENV supabaseUrl=https://okepievzdelqzjwhsueu.supabase.co
ENV supabaseKey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rZXBpZXZ6ZGVscXpqd2hzdWV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTc5MzEzNjksImV4cCI6MjAzMzUwNzM2OX0.m5mp1q1d45O-GIJf1FwE5lMh0T0Xnfqr61AE2rLm-ls


# Build with more memory available
RUN NODE_OPTIONS="--max_old_space_size=4096" npm run build -- --no-lint

# Production Stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copy only necessary files
COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Install curl for healthcheck
RUN apk --no-cache add curl

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    chown -R nextjs:nodejs /app

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

CMD ["npm", "start"]
