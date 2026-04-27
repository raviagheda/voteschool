FROM node:20-alpine

WORKDIR /app

# Install root dependencies
COPY package*.json ./
RUN npm ci

# Install client dependencies and build
COPY client/package*.json ./client/
RUN cd client && npm ci

# Copy all source files
COPY . .

# Build the Server and React client
RUN npm run build

# Prune devDependencies to reduce image size
RUN npm prune --production

# Expose Cloud Run port
EXPOSE 8080
ENV PORT=8080

# Start the Express server
CMD ["node", "server/dist/index.js"]
