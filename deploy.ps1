
$HOST_IP = "213.142.148.35"
$USER = "root"
$REMOTE_DIR = "/root/nadpos-backend"

Write-Host "Deploy boshlandi: $HOST_IP ga ulanmoqda..." -ForegroundColor Green

# 1. Papka yaratish
Write-Host "Serverda papka yaratilmoqda..."
ssh "$USER@$HOST_IP" "mkdir -p $REMOTE_DIR"

# 2. Fayllarni nusxalash
Write-Host "Fayllar yuborilmoqda..."
$dest = "${USER}@${HOST_IP}:${REMOTE_DIR}/"
scp -r apps/cloud-backend/* "$dest"

# 3. Setup fayliga ruxsat berish va ishga tushirish
Write-Host "O'rnatish skripti ishga tushirilmoqda..."
ssh "$USER@$HOST_IP" "cd $REMOTE_DIR && chmod +x setup.sh && ./setup.sh"

Write-Host "Deploy tugadi! Server IP: http://${HOST_IP}:4000" -ForegroundColor Cyan
