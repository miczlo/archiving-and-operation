FROM node:12.18.3-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./

# Copy default configuration
COPY ./config/config-default.json ./config

RUN npm install --production

# Bundle app source
COPY . .

EXPOSE 3000
CMD [ "node", "server.js" ]