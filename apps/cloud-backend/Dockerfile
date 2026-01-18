FROM node:18-slim

RUN apt-get update -y && apt-get install -y openssl ca-certificates procps

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Data papkasi uchun ruxsat
RUN mkdir -p data && chmod 777 data

EXPOSE 4000

CMD ["node", "src/server.js"]
