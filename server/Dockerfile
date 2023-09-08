# Use an official Node runtime as the base image
FROM node:14

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json into the container
COPY package*.json ./

# Install dependencies inside the container
RUN npm install

# Copy the current directory contents into the container
COPY . .

# Make port 3000 available outside the container
EXPOSE 3001

# Run the application when the container launches
CMD ["node", "server.js"]
