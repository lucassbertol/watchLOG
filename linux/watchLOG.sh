#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
NVM_DIR="$HOME/.nvm"
NVM_INIT="[ -s '$NVM_DIR/nvm.sh' ] && \. '$NVM_DIR/nvm.sh'"
VENV_ACTIVATE="source '$ROOT_DIR/backend/venv/bin/activate'"

echo "=== Iniciando o projeto watchLOG ==="
echo ""

echo "[0/2] Rodando migracoes do banco de dados..."
cd "$ROOT_DIR/backend"
source venv/bin/activate
python manage.py migrate
echo "Migracoes: OK"
echo ""

echo "[1/2] Abrindo Backend (Django) em http://localhost:8000..."
if command -v gnome-terminal &>/dev/null; then
    gnome-terminal -- bash -c "$NVM_INIT && $VENV_ACTIVATE && cd '$ROOT_DIR/backend' && python manage.py runserver; exec bash"
elif command -v konsole &>/dev/null; then
    konsole -e bash -c "$NVM_INIT && $VENV_ACTIVATE && cd '$ROOT_DIR/backend' && python manage.py runserver; exec bash"
elif command -v xterm &>/dev/null; then
    xterm -e bash -c "$NVM_INIT && $VENV_ACTIVATE && cd '$ROOT_DIR/backend' && python manage.py runserver; exec bash" &
else
    echo "Nenhum terminal grafico encontrado (gnome-terminal, konsole, xterm)."
    echo "Iniciando no terminal atual..."
    cd "$ROOT_DIR/backend" && python manage.py runserver &
    BACKEND_PID=$!
fi

echo "[2/2] Abrindo Frontend (Vite) em http://localhost:5173..."
if command -v gnome-terminal &>/dev/null; then
    gnome-terminal -- bash -c "$NVM_INIT && cd '$ROOT_DIR/frontend' && npm run dev; exec bash"
elif command -v konsole &>/dev/null; then
    konsole -e bash -c "$NVM_INIT && cd '$ROOT_DIR/frontend' && npm run dev; exec bash"
elif command -v xterm &>/dev/null; then
    xterm -e bash -c "$NVM_INIT && cd '$ROOT_DIR/frontend' && npm run dev; exec bash" &
else
    cd "$ROOT_DIR/frontend" && npm run dev &
    FRONTEND_PID=$!
fi

echo ""
echo "Backend  -> http://localhost:8000"
echo "Frontend -> http://localhost:5173"
echo ""
echo "Feche os terminais abertos para parar os servidores."

if [ -n "$BACKEND_PID" ] || [ -n "$FRONTEND_PID" ]; then
    trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
    wait
fi
