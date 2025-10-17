@echo off
chcp 65001
cd backend

set /p "bemenet=Szeretnéd Buildenli a fontendet? Ha igen 1: "

if "%bemenet%"=="1" (
	cd ../frontend
	call build.bat
	cd ../backend
)

call venv\Scripts\activate.bat
if errorlevel 1 (
    echo ERROR: Failed to activate virtual environment!
    pause
    exit /b 1
)
echo Virtual environment activated successfully

pip install -r requirements.txt

echo Success install requirements.txt

:start

python main.py

echo Enter to reload.
pause
goto start