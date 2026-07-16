@echo off
echo === Instalando dependencias do projeto watchLOG ===
echo.

set SCRIPT_DIR=%~dp0
set ROOT_DIR=%SCRIPT_DIR%..

echo [1/4] Criando ambiente virtual (Python)...
cd /d "%ROOT_DIR%backend"
python -m venv venv
call venv\Scripts\activate.bat
echo Virtualenv criado: backend\venv
echo.

echo [2/4] Instalando dependencias do backend...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ERRO ao instalar dependencias do backend.
    pause
    exit /b 1
)
echo Backend: OK
echo.

echo [3/4] Instalando navegadores do Playwright...
python -m playwright install
if %errorlevel% neq 0 (
    echo ERRO ao instalar Playwright.
    pause
    exit /b 1
)
echo Playwright: OK
echo.

echo [4/4] Instalando dependencias do frontend (Node.js)...
cd /d "%ROOT_DIR%frontend"
call npm install
if %errorlevel% neq 0 (
    echo ERRO ao instalar dependencias do frontend.
    pause
    exit /b 1
)
echo Frontend: OK
echo.

echo Migracoes do banco de dados...
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

echo === Todas as dependencias instaladas com sucesso! ===
echo Execute watchLOG.bat para iniciar o projeto.
pause
