@echo off
setlocal
cd /d "%~dp0\.."

echo.
echo  Starting ChoreoLab dev servers...
echo.

start "ChoreoLab Server" cmd /k "cd /d "%CD%\server" && npm run dev"
timeout /t 2 /nobreak >nul
start "ChoreoLab Client" cmd /k "cd /d "%CD%\client" && npm run dev"

echo  Server window: http://localhost:4000/graphql
echo  Client window: http://localhost:5173
echo  LAN client:    check the Vite window for Network URL
echo.
echo  To stop: double-click scripts\stop-dev.cmd
echo.
timeout /t 4 /nobreak >nul
