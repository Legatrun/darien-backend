FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY . .
RUN chmod +x wait-for-it.sh

EXPOSE 3000

CMD ["./wait-for-it.sh", "db:3306", "--", "nodemon", "--legacy-watch", "app.js"]