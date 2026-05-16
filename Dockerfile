FROM node:20-slim

WORKDIR /app

# Copy all source first (busts cache on any file change)
COPY . .

# Install dependencies
RUN npm ci

# Build frontend
RUN npm run build

# Expose port
EXPOSE 3001

# Start server (serves both API and built frontend)
CMD ["npm", "start"]
