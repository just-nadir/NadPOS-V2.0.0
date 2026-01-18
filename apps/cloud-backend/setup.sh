#!/bin/bash

# Update and install Docker if not exists
if ! command -v docker &> /dev/null; then
    echo "Docker install qilinmoqda..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
fi

if ! command -v docker-compose &> /dev/null; then
    echo "Docker Compose install qilinmoqda..."
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.5/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Stop existing containers
echo "Eski konteynerlar to'xtatilmoqda..."
docker-compose down

# Start new containers
echo "Yangi versiya ishga tushirilmoqda..."
docker-compose up -d --build

# Run migrations
echo "Migratsiya qilinmoqda..."
docker-compose exec -T app npx prisma migrate deploy

echo "NadPOS Cloud muvaffaqiyatli ishga tushdi!"
