@echo off
setlocal

echo.
echo  Stopping ChoreoLab dev servers (ports 4000 and 5173)...
echo.

powershell -NoProfile -Command "foreach ($port in 4000, 5173) { Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue } }"

echo  Done.
echo.
timeout /t 3 /nobreak >nul
