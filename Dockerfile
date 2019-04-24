FROM node:11 as backend

WORKDIR /usr/src/app

# Install any needed packages specified in package.json
COPY package.json yarn.lock ./
RUN yarn install

# Copy the current directory contents into the container at WORKDIR
COPY . .

# Define environment variable
ENV NODE_ENV=production

RUN yarn build

EXPOSE 3000:3000
ENTRYPOINT node ./app/build/index.js
