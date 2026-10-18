Write-Host "===================================================" -ForegroundColor Green
Write-Host "Starting CropCare AI Backend (FastAPI + PyTorch ML)" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -Path "$scriptDir\backend"
& "$scriptDir\CropCareAI\.venv\Scripts\python.exe" -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
