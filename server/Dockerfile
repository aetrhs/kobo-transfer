FROM node:20-slim
WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

RUN chmod +x bin/kepubify && cp bin/kepubify /usr/local/bin/kepubify

RUN mkdir -p uploads

EXPOSE 5000
CMD ["node", "server.js"]