Write-Host "===================================================" -ForegroundColor Green
Write-Host "Starting CropCare AI Backend (FastAPI + PyTorch ML)" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -Path $scriptDir

$venvPython = "$scriptDir\..\CropCareAI\.venv\Scripts\python.exe"
if (Test-Path $venvPython) {
    & $venvPython -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
} else {
    python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
}
