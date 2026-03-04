FROM node:24-alpine

WORKDIR /app

# Build tools needed for better-sqlite3 native module
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000
ENV NODE_ENV=production

CMD ["sh", "-c", "npm run start:prod"]
