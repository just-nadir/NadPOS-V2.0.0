FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Data papkasi uchun ruxsat
RUN mkdir -p data && chmod 777 data

EXPOSE 4000

CMD ["node", "server.js"]
