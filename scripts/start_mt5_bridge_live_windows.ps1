$ErrorActionPreference = "Stop"

Set-Location (Split-Path -Parent $PSScriptRoot)

$env:MT5_ENABLE_LIVE = "true"
$env:MT5_REQUIRE_TERMINAL = "true"
$env:MT5_REQUIRE_DEMO_ACCOUNT = if ($env:MT5_REQUIRE_DEMO_ACCOUNT) { $env:MT5_REQUIRE_DEMO_ACCOUNT } else { "true" }
$env:MT5_ALLOW_REAL_ACCOUNT = if ($env:MT5_ALLOW_REAL_ACCOUNT) { $env:MT5_ALLOW_REAL_ACCOUNT } else { "false" }
$env:MT5_BRIDGE_HOST = "127.0.0.1"
$env:MT5_BRIDGE_PORT = "8789"

python -m pip install -r requirements.txt
python -m pip install -r mt5_bridge/requirements.txt

Write-Host "Starting Zeus MT5 bridge in LIVE mode on http://127.0.0.1:8789"
Write-Host "MetaTrader 5 must be open and logged in to a DEMO account before submitting orders."
Write-Host "Optional explicit credentials: MT5_LOGIN, MT5_PASSWORD, MT5_SERVER, MT5_PATH."
Write-Host "Real MT5 accounts are blocked unless MT5_ALLOW_REAL_ACCOUNT=true."
python -m uvicorn mt5_bridge.server:app --host 127.0.0.1 --port 8789
