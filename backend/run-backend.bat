@echo off
echo ===================================================
echo Starting CropCare AI Backend (FastAPI + PyTorch ML)
echo ===================================================

cd /d "%~dp0"
"..\CropCareAI\.venv\Scripts\python.exe" -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
pause
