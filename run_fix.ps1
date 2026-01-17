
$HOST_IP = "213.142.148.35"
$USER = "root"
$REMOTE_DIR = "/root/nadpos-backend"

Write-Host "🔧 Serverni tuzatish boshlandi..." -ForegroundColor Yellow

# 1. Fix skriptini yuklash
Write-Host "📤 Fix skripti yuborilmoqda..."
$dest = "${USER}@${HOST_IP}:${REMOTE_DIR}/"
scp apps/cloud-backend/fix_server.sh "$dest"

# 2. Ishga tushirish
Write-Host "🚀 Skript ishga tushirilmoqda..."
ssh "${USER}@${HOST_IP}" "cd $REMOTE_DIR && chmod +x fix_server.sh && ./fix_server.sh"

Write-Host "✅ Tugadi! Endi saytni tekshirib ko'ring." -ForegroundColor Green
