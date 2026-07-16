#!/bin/bash

set -e

echo "=== Instalando dependencias do projeto watchLOG ==="
echo ""

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

echo "[1/4] Criando ambiente virtual (Python)..."
cd "$ROOT_DIR/backend"
python3 -m venv venv
source venv/bin/activate
echo "Virtualenv criado: backend/venv"
echo ""

echo "[2/4] Instalando dependencias do backend..."
pip install -r requirements.txt
echo "Backend: OK"
echo ""

echo "[3/4] Instalando navegadores do Playwright..."
python -m playwright install
echo "Playwright: OK"
echo ""

echo "[4/4] Instalando dependencias do frontend (Node.js)..."
cd "$ROOT_DIR/frontend"
npm install
echo "Frontend: OK"
echo ""

echo "Migracoes do banco de dados..."
cd "$ROOT_DIR/backend"
python manage.py migrate
echo "Migracoes: OK"
echo ""

echo "=== Todas as dependencias instaladas com sucesso! ==="
echo "Execute ./watchLOG.sh para iniciar o projeto."
