FROM node:16

WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code files
COPY src src
COPY tsconfig.json .

# Set environment variables
ENV PORT=3000

EXPOSE ${PORT}

# Transpile into JS and run Node
RUN [ "npx", "tsc" ]
CMD [ "node", "dist/index.js"]
