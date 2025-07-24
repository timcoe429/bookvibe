# Multi-stage build for BookVibe application

# Stage 1: Build the React client
FROM node:18-alpine AS client-build

# Set environment variables for better build performance
ENV NODE_ENV=production
ENV CI=true

# Set working directory for client build
WORKDIR /app/client

# Copy client package files
COPY client/package*.json ./

# Install client dependencies with retry logic
RUN npm config set registry https://registry.npmjs.org/ && \
    npm ci --no-audit --no-fund --prefer-offline

# Copy client source code
COPY client/ ./

# Build the React application
RUN npm run build

# Stage 2: Set up the Node.js server
FROM node:18-alpine AS server

# Set environment variables
ENV NODE_ENV=production

# Set working directory
WORKDIR /app

# Copy server package files
COPY server/package*.json ./

# Install server dependencies with retry logic
RUN npm config set registry https://registry.npmjs.org/ && \
    npm install --no-audit --no-fund --prefer-offline

# Copy server source code
COPY server/ ./

# Copy built client from previous stage
COPY --from=client-build /app/client/build ./public

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Start the simple server
CMD ["npm", "start"] 