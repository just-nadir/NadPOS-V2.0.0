
$HOST_IP = "213.142.148.35"
$USER = "root"
$REMOTE_DIR = "/root/nadpos-backend"

Write-Host "Deploy boshlandi: $HOST_IP ga ulanmoqda..." -ForegroundColor Green

# 0. Admin Panelni Build qilish
Write-Host "Admin Panel build qilinmoqda..."
Set-Location "apps/admin-panel"
cmd /c "npm install"
cmd /c "npm run build"
Set-Location "../.."

# Public papkaga ko'chirish
Write-Host "Build fayllari Backendga ko'chirilmoqda..."
if (Test-Path "apps/cloud-backend/public") { Remove-Item "apps/cloud-backend/public" -Recurse -Force }
New-Item -ItemType Directory -Path "apps/cloud-backend/public" | Out-Null
Copy-Item "apps/admin-panel/dist/*" "apps/cloud-backend/public" -Recurse

# 1. Papka yaratish
Write-Host "Serverda papka yaratilmoqda..."
ssh "$USER@$HOST_IP" "mkdir -p $REMOTE_DIR"

# 2. Fayllarni nusxalash
Write-Host "Fayllar yuborilmoqda..."
$dest = "${USER}@${HOST_IP}:${REMOTE_DIR}/"

# Asosiy fayllar
scp apps/cloud-backend/Dockerfile apps/cloud-backend/docker-compose.yml apps/cloud-backend/package.json apps/cloud-backend/server.js apps/cloud-backend/setup.sh apps/cloud-backend/adminController.js "$dest"

# Nginx papkasi
Write-Host "Nginx config yuborilmoqda..."
scp -r apps/cloud-backend/nginx "$dest"

# Public papkasi (Admin Panel)
Write-Host "Admin Panel fayllari yuborilmoqda..."
scp -r apps/cloud-backend/public "$dest"

# 3. Setup fayliga ruxsat berish va ishga tushirish
Write-Host "Ornatish skripti ishga tushirilmoqda..."
ssh "$USER@$HOST_IP" "cd $REMOTE_DIR && chmod +x setup.sh && ./setup.sh"

Write-Host "Deploy tugadi! Server IP: http://${HOST_IP}:4000" -ForegroundColor Cyan
