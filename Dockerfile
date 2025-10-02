# Stage 1: Builder
# Use Node.js 20-alpine as it's required by @google/genai and is a good modern version.
FROM node:20-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to leverage Docker layer caching
# This means if only your code changes, but dependencies don't, npm ci won't rerun.
COPY package.json package-lock.json* ./

# Install ALL dependencies (production and development) for the build stage.
# This is crucial for Next.js to find 'typescript' and other build-time tools.
RUN npm ci

# Copy the rest of your application code
COPY . .

# Run the Next.js build command
RUN npm run build

# Stage 2: Runner
# Use the same Node.js 20-alpine for consistency and to match the builder's environment.
FROM node:20-alpine AS runner

# Set the working directory inside the container
WORKDIR /app

# Create a non-root user and group for security best practices.
# Using system users/groups and specific IDs (1001 is common for node/next).
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy only the necessary build artifacts from the builder stage.
# This keeps the final image small and secure.
# standalone: the optimized Next.js server and dependencies
# static: static assets like images, fonts
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy public assets
COPY --from=builder /app/public ./public

# Ensure the non-root user 'nextjs' owns the application files for proper permissions
RUN chown -R nextjs:nodejs /app

# Switch to the non-root user 'nextjs'
USER nextjs

# Expose the port your Next.js application runs on
EXPOSE 3000

# Set environment variables for the application
ENV PORT=3000
ENV NODE_ENV=production
# Crucial: Tell Next.js to bind to all network interfaces so it's accessible from outside the container
ENV HOSTNAME="0.0.0.0"

# Command to run the Next.js production server
CMD ["node", "server.js"]
