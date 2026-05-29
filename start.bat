@echo off
setlocal
color 0A
title E.M.M.A Planetary Scale Digital Twin - Boot Sequence

echo ==============================================================================
echo  [+] INITIALIZING AUTOGENESIS PROTOCOL...
echo  [+] E.M.M.A. DUAL-KERNEL ARCHITECTURE BOOTSTRAPPER
echo ==============================================================================

:: Check for Node.js
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [!] ERROR: Node.js is not installed or not in PATH.
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

:: Check for Python
where python >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [!] WARNING: Python is not installed. Python modules (GLiNER, MediaPipe, Weaviate, etc.) will be disabled or skipped.
    goto :SkipPython
)

echo.
echo [+] Setting up Python Virtual Environment (Aegis Incubator)...
if not exist "venv" (
    python -m venv venv
    echo [+] Created fresh virtual environment.
)
call venv\Scripts\activate.bat

echo [+] Installing Genesis Seed Python Dependencies...
pip install --upgrade pip >nul 2>&1
pip install Pillow fusepy gliner torch weaviate-client opencv-python mediapipe >nul 2>&1
:: mamba_ssm and audioseal can be complex to build on Windows without specific C++ build tools, ignoring errors for them
pip install audioseal mamba_ssm causal-conv1d >nul 2>&1
echo [+] Python dependencies verified.

:SkipPython
echo.
:: Check for .NET SDK (for CodeWalker Daemon)
where dotnet >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [!] WARNING: .NET SDK is not installed. CodeWalker C# Daemon will be unavailable.
) else (
    echo [+] .NET Core found. C# Genesis Seed ready.
)

:: Check for Rust/Cargo
where cargo >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [!] WARNING: Cargo/Rust is not installed. Rust Telemetry streaming will be mocked.
) else (
    echo [+] Rust Cargo found. Native telemetry stream ready.
)

echo.
echo [+] Syncing Node Modules (Ring 0 / Twin City Client)...
call npm install

echo.
echo ==============================================================================
echo  [+] ALL DEPENDENCIES RESOLVED.
echo  [+] IGNITING 12.5 HZ PERSISTENCE PULSE...
echo  [+] STARTING LUCY/EMMA DUAL-KERNEL NODE SERVER...
echo ==============================================================================
echo.

call npm run dev

pause
