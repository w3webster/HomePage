# Base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files for both main app and client
COPY package*.json ./
COPY client/package*.json ./client/

# Install dependencies
RUN npm install && \
    cd client && \
    npm install && \
    cd ..

# Copy source files
COPY . .

# Build the client React app
RUN cd client && \
    npm run build

# Expose port for the application (configurable via environment variable)
EXPOSE 3001

# Volume for persisting bookmarks data
VOLUME ["/app/server/data"]

# Start the application
CMD ["npm", "start"]
