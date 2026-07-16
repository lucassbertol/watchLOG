@echo off
set SCRIPT_DIR=%~dp0
set ROOT_DIR=%SCRIPT_DIR%..

echo === Iniciando o projeto watchLOG ===
echo.

echo [0/2] Rodando migracoes do banco de dados...
cd /d "%ROOT_DIR%backend"
call venv\Scripts\activate.bat
python manage.py migrate
if %errorlevel% neq 0 (
    echo ERRO ao rodar migracoes.
    pause
    exit /b 1
)
echo Migracoes: OK
echo.

echo [1/2] Abrindo Backend (Django) em http://localhost:8000
start "watchLOG Backend" cmd /k "cd /d %ROOT_DIR%backend && call venv\Scripts\activate.bat && python manage.py runserver"

echo [2/2] Abrindo Frontend (Vite) em http://localhost:5173
start "watchLOG Frontend" cmd /k "cd /d %ROOT_DIR%frontend && npm run dev"

echo.
echo Backend  -> http://localhost:8000
echo Frontend -> http://localhost:5173
echo.
echo Dois terminais foram abertos. Feche-os para parar os servidores.
timeout /t 3 >nul
