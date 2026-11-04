# Đóng gói bộ cài cho nhân viên: tạo ban-phat-hanh\SoatChinhTa-CaiDat.zip
# Chạy: npm run dong-goi  --  (C) August87 - 0982722036
$ErrorActionPreference = 'Stop'
$goc = Split-Path -Parent $PSScriptRoot
$ra = Join-Path $goc 'ban-phat-hanh'
$tam = Join-Path $ra 'SoatChinhTa-CaiDat'
if (Test-Path $ra) { Remove-Item $ra -Recurse -Force }
New-Item -ItemType Directory -Force $tam | Out-Null
Copy-Item (Join-Path $goc 'cai-dat\*') $tam
New-Item -ItemType Directory -Force (Join-Path $tam 'manifest') | Out-Null
Copy-Item (Join-Path $goc 'manifest.xml') (Join-Path $tam 'manifest')
Compress-Archive -Path $tam -DestinationPath (Join-Path $ra 'SoatChinhTa-CaiDat.zip')
Remove-Item $tam -Recurse -Force
Get-Item (Join-Path $ra 'SoatChinhTa-CaiDat.zip') | Select-Object FullName, Length
