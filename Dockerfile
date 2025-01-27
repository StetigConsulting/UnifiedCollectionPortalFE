# Use the official Node.js image from Docker Hub
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Install the app dependencies
RUN npm install --unsafe-perm=true --force

# Copy the rest of your application files into the container
COPY . .

# Expose the port the app will run on (e.g., 3000)
EXPOSE 3000

# Command to run the app
CMD ["npm", "run" , "dev"]
