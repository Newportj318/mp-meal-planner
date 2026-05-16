FROM node:20-slim

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Build frontend
RUN npm run build

# Expose port
EXPOSE 3001

# Start server (serves both API and built frontend)
CMD ["npm", "start"]
