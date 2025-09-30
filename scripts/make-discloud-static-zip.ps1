$ErrorActionPreference = 'Stop'

$ProjectRoot = Split-Path -Parent $PSScriptRoot
$StaticZip = Join-Path $ProjectRoot 'sistema-objetivo-static.zip'
$Work = Join-Path $ProjectRoot '.tmp-discloud-static'

if (Test-Path $Work) { Remove-Item -Recurse -Force $Work }
New-Item -ItemType Directory -Force -Path $Work | Out-Null

# Copy dist/* to work root (so files are at ZIP root)
Copy-Item (Join-Path $ProjectRoot 'dist\*') -Destination $Work -Recurse -Force

# Write minimal site config at root
# Write minimal site config at root with proper encoding (avoid UTF-16 default)
$configContent = @(
	'ID=sistema-objetivo-site'
	'NAME=sistema-objetivo'
	'SUBDOMAIN=objsp'
	'TYPE=site'
	'MAIN=index.html'
	'RAM=128'
	'VERSION=latest'
)

# Prefer ASCII to avoid BOM issues on some parsers
$configPath = Join-Path $Work 'discloud.config'
$configContent | Set-Content -Path $configPath -Encoding ASCII

# Build ZIP
if (Test-Path $StaticZip) { Remove-Item -Force $StaticZip }
Compress-Archive -Path (Join-Path $Work '*') -DestinationPath $StaticZip -Force

Write-Host "Created static ZIP: $StaticZip"