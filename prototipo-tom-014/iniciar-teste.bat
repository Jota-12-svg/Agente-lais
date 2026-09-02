@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo   Ambiente de teste da Manu  -  Lais Aliski Casa (ticket 014)
echo   ----------------------------------------------------------
echo   Abra no navegador:  http://localhost:4014
echo   Para parar: feche esta janela ou aperte Ctrl+C
echo.
if exist "C:\Agente Lais\.env" (
  node --env-file="C:\Agente Lais\.env" run.mjs
) else (
  node run.mjs
)
echo.
echo   [servidor encerrado]
pause
