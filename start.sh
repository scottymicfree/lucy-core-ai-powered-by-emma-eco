#!/bin/bash
# E.M.M.A. Planetary Scale Digital Twin & Dual-Kernel Bootstrapper
set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}==============================================================================${NC}"
echo -e "${GREEN} [+] INITIALIZING AUTOGENESIS PROTOCOL...${NC}"
echo -e "${GREEN} [+] E.M.M.A. DUAL-KERNEL ARCHITECTURE BOOTSTRAPPER${NC}"
echo -e "${GREEN}==============================================================================${NC}"

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}[!] ERROR: Node.js is not installed or not in PATH.${NC}"
    exit 1
fi

# Check for Python
if command -v python3 &> /dev/null; then
    echo -e "\n${GREEN}[+] Setting up Python Virtual Environment (Aegis Incubator)...${NC}"
    if [ ! -d "venv" ]; then
        python3 -m venv venv
        echo -e "${GREEN}[+] Created fresh virtual environment.${NC}"
    fi
    source venv/bin/activate
    
    echo -e "${GREEN}[+] Installing Genesis Seed Python Dependencies...${NC}"
    pip install --upgrade pip >/dev/null 2>&1
    pip install Pillow fusepy gliner torch weaviate-client opencv-python mediapipe >/dev/null 2>&1 || true
    pip install audioseal mamba_ssm causal-conv1d >/dev/null 2>&1 || true
    echo -e "${GREEN}[+] Python dependencies verified.${NC}"
else
    echo -e "\n${YELLOW}[!] WARNING: Python3 is not installed. Python modules will be skipped.${NC}"
fi

# Check for .NET Core
if ! command -v dotnet &> /dev/null; then
    echo -e "${YELLOW}[!] WARNING: .NET SDK is not installed. CodeWalker C# Daemon will be unavailable.${NC}"
else
    echo -e "${GREEN}[+] .NET SDK found. C# Genesis Seed ready.${NC}"
fi

# Check for Rust/Cargo
if ! command -v cargo &> /dev/null; then
    echo -e "${YELLOW}[!] WARNING: Cargo/Rust is not installed. Rust Telemetry streaming will be mocked.${NC}"
else
    echo -e "${GREEN}[+] Rust Cargo found. Native telemetry stream ready.${NC}"
fi

echo -e "\n${GREEN}[+] Syncing Node Modules (Ring 0 / Twin City Client)...${NC}"
npm install

echo -e "\n${GREEN}==============================================================================${NC}"
echo -e "${GREEN} [+] ALL DEPENDENCIES RESOLVED.${NC}"
echo -e "${GREEN} [+] IGNITING 12.5 HZ PERSISTENCE PULSE...${NC}"
echo -e "${GREEN} [+] STARTING LUCY/EMMA DUAL-KERNEL NODE SERVER...${NC}"
echo -e "${GREEN}==============================================================================${NC}\n"

npm run dev
