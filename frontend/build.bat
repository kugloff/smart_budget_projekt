@echo off
setlocal
set ERRHANDLER=0

call npm install
call npm run build

if errorlevel 1 (
    echo.
    echo *** HIBA TORTENT! ***
    echo.
) else (
    echo Success building!
)

pause
