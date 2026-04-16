FROM node:20-alpine

# client
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# server
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install
COPY server/ ./

# kepubify
RUN apk update && apk add --no-cache wget libc6-compat
RUN wget -O /usr/local/bin/kepubify https://github.com/pgaskin/kepubify/releases/latest/download/kepubify-linux-64bit \
    && chmod +x /usr/local/bin/kepubify
# RUN chmod +x bin/kepubify && cp bin/kepubify /usr/local/bin/kepubify

RUN mkdir -p uploads

EXPOSE 5000
CMD ["node", "server.js"]