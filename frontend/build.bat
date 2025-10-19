@echo off
chcp 65001
setlocal
set ERRHANDLER=0
:start
cls
call npm install
call npm run build

if errorlevel 1 (
    echo.
    echo *** HIBA TORTENT! ***
    echo.
) else (
    echo Success building!
)

echo Enter az újraépítéshez...
pause
goto start