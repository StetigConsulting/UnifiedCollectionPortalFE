# Use the official Node.js image from Docker Hub
FROM node:18

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Install the app dependencies
RUN npm install --unsafe-perm=true --force

# Set the correct permissions for the app directory
RUN chmod -R 777 /usr/src/app

# Switch to a non-root user for security reasons
USER node

# Copy the rest of your application files into the container
COPY . .

# Expose the port the app will run on (e.g., 3000)
EXPOSE 3000

# Command to run the app
CMD ["npm", "start"]
