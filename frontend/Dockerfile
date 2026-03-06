FROM node:18-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the frontend code
COPY . .

# Expose Vite's default port
EXPOSE 5173

# Start Vite server, binding to all network interfaces so it's accessible outside the container
CMD ["npm", "run", "dev", "--", "--host"]
