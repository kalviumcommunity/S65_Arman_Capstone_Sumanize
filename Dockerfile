# Stage 1: Builder
# We're using Node.js 20 (Alpine Linux version)
FROM node:20-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package files first - this is smart because these files don't change often
# Docker will reuse this step if only your code changes, saving time
COPY package.json package-lock.json* ./

# Install all dependencies - like gathering all ingredients before cooking
# We need both production and development tools to build the Next.js application
RUN npm ci

# Copy the rest of your application code
COPY . .

# Build the application
# This creates an optimized version ready for production
RUN npm run build

# Stage 2: Runner
# Now we create a clean, optimized container for production
# Same base as builder for consistency
FROM node:20-alpine AS runner

# Set the working directory
WORKDIR /app

# Create a non-root user for security
# This prevents security risks if someone hacks the container
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy only what we need from the builder
# This makes our final container much smaller and more secure
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy public assets
COPY --from=builder /app/public ./public

# Give ownership to our non-root user
RUN chown -R nextjs:nodejs /app

# Switch to the non-root user
USER nextjs

# Open port 3000
EXPOSE 3000

# Set environment variables
ENV PORT=3000
ENV NODE_ENV=production
# Important: Allow connections from anywhere
ENV HOSTNAME="0.0.0.0"

# Start the server
CMD ["node", "server.js"]