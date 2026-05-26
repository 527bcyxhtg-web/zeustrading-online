$ErrorActionPreference = "Stop"

Set-Location (Split-Path -Parent $PSScriptRoot)

$env:MT5_ENABLE_LIVE = "true"
$env:MT5_REQUIRE_TERMINAL = "true"
$env:MT5_BRIDGE_HOST = "127.0.0.1"
$env:MT5_BRIDGE_PORT = "8789"

python -m pip install -r requirements.txt
python -m pip install -r mt5_bridge/requirements.txt

Write-Host "Starting Zeus MT5 bridge in LIVE mode on http://127.0.0.1:8789"
Write-Host "MetaTrader 5 must be open and logged in before submitting orders."
python -m uvicorn mt5_bridge.server:app --host 127.0.0.1 --port 8789

