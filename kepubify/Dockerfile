FROM node:20-alpine
WORKDIR /app

COPY kepubify /usr/local/bin/kepubify
RUN chmod +x /usr/local/bin/kepubify

CMD ["tail", "-f", "/dev/null"]