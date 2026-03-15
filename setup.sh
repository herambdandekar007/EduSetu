#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────────
# setup.sh – One-command setup for Empower Access Hub (Frontend + Backend)
# Usage: bash setup.sh
# ──────────────────────────────────────────────────────────────────────────────
set -e

BOLD="\033[1m"
GREEN="\033[0;32m"
CYAN="\033[0;36m"
YELLOW="\033[0;33m"
RED="\033[0;31m"
RESET="\033[0m"

echo -e "${BOLD}${CYAN}"
echo "  ██████  ███    ███  █████  ██████  ████████     ██████   ██████  ██████  ████████  █████  ██      "
echo "  ██      ████  ████ ██   ██ ██   ██    ██        ██   ██ ██    ██ ██   ██    ██    ██   ██ ██      "
echo "  ███████ ██ ████ ██ ███████ ██████     ██        ██████  ██    ██ ██████     ██    ███████ ██      "
echo "  ██      ██  ██  ██ ██   ██ ██   ██    ██        ██      ██    ██ ██   ██    ██    ██   ██ ██      "
echo "  ███████ ██      ██ ██   ██ ██   ██    ██        ██       ██████  ██   ██    ██    ██   ██ ███████ "
echo -e "${RESET}"
echo -e "${BOLD}  Empower Access Hub – Setup Script${RESET}"
echo ""

# ── 1. Check Node.js ──────────────────────────────────────────────────────────
echo -e "${BOLD}[1/5]${RESET} Checking Node.js..."
if ! command -v node &>/dev/null; then
  echo -e "${RED}✗ Node.js is not installed.${RESET}"
  echo "  Install it from https://nodejs.org (v18 or higher required)"
  echo "  Or via nvm: curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash && nvm install 20"
  exit 1
fi

NODE_VERSION=$(node --version | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo -e "${RED}✗ Node.js v${NODE_VERSION} is too old. Please upgrade to v18 or higher.${RESET}"
  exit 1
fi
echo -e "  ${GREEN}✓ Node.js $(node --version) found${RESET}"

# ── 2. Check npm ──────────────────────────────────────────────────────────────
echo -e "${BOLD}[2/5]${RESET} Checking npm..."
if ! command -v npm &>/dev/null; then
  echo -e "${RED}✗ npm is not installed.${RESET}"
  exit 1
fi
echo -e "  ${GREEN}✓ npm $(npm --version) found${RESET}"

# ── 3. Configure environment variables ───────────────────────────────────────
echo -e "${BOLD}[3/5]${RESET} Checking environment variables..."

# Frontend .env
if [ ! -f "frontend/.env" ]; then
  if [ -f "frontend/.env.example" ]; then
    echo -e "  ${YELLOW}! frontend/.env not found – copying from frontend/.env.example${RESET}"
    cp frontend/.env.example frontend/.env
    echo -e "  ${YELLOW}! Please edit frontend/.env with your Firebase credentials.${RESET}"
  else
    echo -e "  ${RED}✗ frontend/.env.example not found.${RESET}"
    exit 1
  fi
else
  echo -e "  ${GREEN}✓ frontend/.env found${RESET}"
fi

# Backend .env
if [ ! -f "backend/.env" ]; then
  if [ -f "backend/.env.example" ]; then
    echo -e "  ${YELLOW}! backend/.env not found – copying from backend/.env.example${RESET}"
    cp backend/.env.example backend/.env
    echo -e "  ${YELLOW}! Please edit backend/.env with your DivyangAI_API_KEY.${RESET}"
  else
    echo -e "  ${RED}✗ backend/.env.example not found.${RESET}"
    exit 1
  fi
else
  echo -e "  ${GREEN}✓ backend/.env found${RESET}"
fi

# ── 4. Install frontend dependencies ──────────────────────────────────────────
echo -e "${BOLD}[4/5]${RESET} Installing frontend dependencies..."
(cd frontend && npm install --legacy-peer-deps)
echo -e "  ${GREEN}✓ Frontend dependencies installed${RESET}"

# ── 5. Install backend dependencies ───────────────────────────────────────────
echo -e "${BOLD}[5/5]${RESET} Installing backend dependencies..."
(cd backend && npm install)
echo -e "  ${GREEN}✓ Backend dependencies installed${RESET}"

# ── Done! ─────────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}${GREEN}✅ Setup complete!${RESET}"
echo ""
echo -e "  To start the project, open ${BOLD}two terminal windows${RESET}:"
echo ""
echo -e "  ${BOLD}Terminal 1 – Backend (AI API server):${RESET}"
echo -e "    ${CYAN}cd backend && npm run dev${RESET}"
echo -e "    Runs on: ${BOLD}http://localhost:3001${RESET}"
echo ""
echo -e "  ${BOLD}Terminal 2 – Frontend (React app):${RESET}"
echo -e "    ${CYAN}cd frontend && npm run dev${RESET}"
echo -e "    Runs on: ${BOLD}http://localhost:8080${RESET}"
echo ""
echo -e "  Other useful commands (run from ${BOLD}frontend/${RESET} directory):"
echo -e "    ${CYAN}npm run build${RESET}    – Build frontend for production"
echo -e "    ${CYAN}npm run preview${RESET}  – Preview the production build"
echo -e "    ${CYAN}npm run test${RESET}     – Run unit tests"
echo -e "    ${CYAN}npm run lint${RESET}     – Lint all source files"
echo ""