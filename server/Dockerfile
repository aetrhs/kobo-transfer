FROM node:20-alpine AS kepubify_source
COPY --from=kobo-library-kepubify /usr/local/bin/kepubify /usr/local/bin/kepubify

FROM node:20-alpine
WORKDIR /app

COPY --from=kepubify_source /usr/local/bin/kepubify /usr/local/bin/kepubify
RUN chmod +x /usr/local/bin/kepubify

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5000
CMD ["npm", "run", "dev"]