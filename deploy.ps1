# .env konfiguratsiyani o'qish
if (Test-Path ".env") {
    Get-Content ".env" | Where-Object { $_ -match '=' -and -not ($_ -match '^#') } | ForEach-Object {
        $k, $v = $_.Split('=', 2)
        Set-Variable -Name $k.Trim() -Value $v.Trim()
    }
}
else {
    Write-Error "Xatolik: .env fayl topilmadi. Iltimos, .env fayl yarating."
    exit 1
}

$HOST_IP = $SERVER_IP
$USER = $SERVER_USER
# $REMOTE_DIR .env dan olinadi, agar bo'lmasa default qiymat
if (-not $REMOTE_DIR) { $REMOTE_DIR = "/root/nadpos-backend" }

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
# Asosiy fayllar
scp -r apps/cloud-backend/src apps/cloud-backend/prisma apps/cloud-backend/Dockerfile apps/cloud-backend/docker-compose.yml apps/cloud-backend/package.json apps/cloud-backend/setup.sh "$dest"

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
