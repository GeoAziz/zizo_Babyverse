# clean-reinstall.ps1
# Stop on error
$ErrorActionPreference = "Stop"

Write-Host "Cleaning up node_modules, .next, and package-lock.json..."
Remove-Item -Recurse -Force .\node_modules
Remove-Item -Recurse -Force .\.next
Remove-Item -Force .\package-lock.json

# Optional: Remove the duplicate folder (uncomment if you are sure)
# Write-Host "Removing duplicate folder (if exists)..."
# Remove-Item -Recurse -Force ..\Zizo_Babyverse

Write-Host "Reinstalling dependencies..."
npm install

Write-Host "Regenerating Prisma client..."
npx prisma generate

Write-Host "Done! You can now try building your project again."