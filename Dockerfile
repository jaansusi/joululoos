# Base image
FROM node:18

RUN apt update && apt install default-jdk -y

# Create app directory
WORKDIR /usr/src/app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Install app dependencies
RUN yarn

# Bundle app source
COPY . .

# Creates a "dist" folder with the production build
RUN yarn build

# COPY --from=builder /cdoc/target/cdoc.jar ./infra/cdoc.jar

# Start the server using the production build
CMD [ "node", "dist/main.js" ]