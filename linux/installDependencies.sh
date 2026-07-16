#!/bin/bash

set -e

echo "=== Instalando dependencias do projeto watchLOG ==="
echo ""

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

cd "$ROOT_DIR/backend"

echo "[1/4] Criando ambiente virtual (Python)..."
VENV_OK=false
if python3 -m venv venv 2>/dev/null && [ -f venv/bin/activate ]; then
    source venv/bin/activate
    VENV_OK=true
    echo "Virtualenv criado: backend/venv"
else
    echo "Falha ao criar virtualenv. Instalando globalmente (--break-system-packages)..."
    rm -rf venv
fi
echo ""

echo "[2/4] Instalando dependencias do backend..."
if [ "$VENV_OK" = true ]; then
    pip install -r requirements.txt
else
    pip install --break-system-packages -r requirements.txt
fi
echo "Backend: OK"
echo ""

echo "[3/4] Instalando navegadores do Playwright..."
if [ "$VENV_OK" = false ]; then
    python3 -m playwright install
else
    python -m playwright install
fi
echo "Playwright: OK"
echo ""

echo "[4/4] Instalando dependencias do frontend (Node.js)..."
cd "$ROOT_DIR/frontend"
npm install
echo "Frontend: OK"
echo ""

echo "Migracoes do banco de dados..."
cd "$ROOT_DIR/backend"
if [ "$VENV_OK" = false ]; then
    python3 manage.py migrate
else
    python manage.py migrate
fi
echo "Migracoes: OK"
echo ""

echo "=== Todas as dependencias instaladas com sucesso! ==="
echo "Execute ./watchLOG.sh para iniciar o projeto."
