FROM node:20-alpine

WORKDIR /app

# Copy package files first to leverage Docker layer caching
COPY package.json package-lock.json ./

# Install dependencies using clean install
RUN npm ci

# Copy the rest of the application code
COPY . .

# Expose the port defined in backend package/env
EXPOSE 5000

# Run the production start command
CMD ["npm", "start"]
