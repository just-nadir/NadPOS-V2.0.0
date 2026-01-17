#!/bin/bash

echo "🚀 NadPOS Server Setup boshlandi..."

# 1. Tizimni yangilash
apt-get update && apt-get upgrade -y

# 2. Curl o'rnatish
apt-get install -y curl

# 3. Dockerni o'rnatish (agar yo'q bo'lsa)
if ! command -v docker &> /dev/null
then
    echo "🐳 Docker o'rnatilmoqda..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
else
    echo "✅ Docker allaqachon o'rnatilgan"
fi

# 3.5. Tizim xizmatlarini tekshirish va to'xtatish (AGRESSIV)
echo "🛑 Port 80 va Firewall tozalanmoqda..."
# Firewallni o'chirish (Docker bilan konflikt bo'lmasligi uchun)
ufw disable || true
iptables -F || true

# Tizim xizmatlarini to'xtatish
systemctl stop nginx 2>/dev/null || true
systemctl disable nginx 2>/dev/null || true
systemctl stop apache2 2>/dev/null || true
systemctl disable apache2 2>/dev/null || true

# Majburan o'ldirish (Process 80)
echo "💀 Port 80 ni majburan bo'shatish..."
fuser -k 80/tcp || true

# 4. Eski konteynerlarni tozalash ("Butunlay tozala" talabi)
echo "🧹 Eski tizim tozalanmoqda..."
docker stop $(docker ps -aq) 2>/dev/null
docker rm $(docker ps -aq) 2>/dev/null
# Ehtiyotkorlik: Image va Volumelarni o'chirish
# docker rmi $(docker images -q) 2>/dev/null
# docker volume prune -f

# 5. Loyihani ishga tushirish
echo "🔍 Nginx Config Tekshiruvi:"
ls -la nginx/
cat nginx/default.conf || echo "❌ Config fayli topilmadi!"

echo "🔥 Ilova ishga tushirilmoqda..."

# Try docker compose first, then docker-compose
if docker compose version &> /dev/null; then
    docker compose up -d --build
elif command -v docker-compose &> /dev/null; then
    docker-compose up -d --build
else
    echo "❌ Docker Compose topilmadi. O'rnatilmoqda..."
    apt-get install -y docker-compose-plugin
    docker compose up -d --build
fi

# 6. Statusni tekshirish
echo "📊 Natija:"
docker ps
