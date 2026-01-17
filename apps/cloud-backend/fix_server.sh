#!/bin/bash
echo "🛡️ Firewall sozlanmoqda..."

# 1. UFW (Uncomplicated Firewall) ni sozlash
apt-get install -y ufw
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 4000/tcp
ufw --force enable
ufw reload

# 2. Iptables (ba'zi serverlarda kerak)
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -j ACCEPT
iptables -A INPUT -p tcp --dport 4000 -j ACCEPT

# 3. Docker va Nginx ni tekshirish
echo "🔄 Nginx qayta ishga tushirilmoqda..."
docker restart nadpos_nginx
docker restart nadpos_backend

echo "✅ Server sozlandi! Port 80 va 4000 ochiq."
echo "📊 Hozirgi ochiq portlar:"
netstat -tulpn | grep LISTEN
