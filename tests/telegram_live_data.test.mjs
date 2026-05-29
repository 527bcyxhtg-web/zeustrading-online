import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const worker = readFileSync("public/_worker.js", "utf8");
const app = readFileSync("public/app.js", "utf8");
const index = readFileSync("public/index.html", "utf8");

assert.match(worker, /const TELEGRAM_API_BASE = "https:\/\/api\.telegram\.org"/);
assert.match(worker, /async function telegramAlert/);
assert.match(worker, /TELEGRAM_BOT_TOKEN/);
assert.match(worker, /TELEGRAM_CHAT_ID/);
assert.match(worker, /url\.pathname === "\/api\/telegram\/alert"/);
assert.match(worker, /telegram_alert_sent|telegram_alert_blocked/);

assert.match(app, /function buildLiveVerificationReport/);
assert.match(app, /function renderLiveVerification/);
assert.match(app, /async function refreshLiveVerification/);
assert.match(app, /async function sendTelegramAlert/);
assert.match(app, /fetch\("\/api\/telegram\/alert"/);

assert.match(index, /id="livePriceTable"/);
assert.match(index, /id="liveAnalysisOutput"/);
assert.match(index, /id="sendTelegramAlert"/);
assert.match(index, /Live Price \+ News Verification/);

console.log("telegram_live_data.test.mjs passed");
