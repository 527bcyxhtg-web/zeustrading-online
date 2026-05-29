import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const worker = readFileSync("public/_worker.js", "utf8");
const app = readFileSync("public/app.js", "utf8");
const index = readFileSync("public/index.html", "utf8");
const styles = readFileSync("public/styles.css", "utf8");

assert.match(worker, /AGENTSCOPE_RUNTIME_TOOLS/);
assert.match(worker, /api\/agentscope\/orchestrate/);
assert.match(worker, /N8N_AGENT_WEBHOOK_URL/);
assert.match(worker, /Manual approval is mandatory for Protected Live/);

assert.match(app, /runAgentScopeCycle/);
assert.match(app, /renderAgentScopePanel/);
assert.match(app, /copyN8nPayload/);

assert.match(index, /AgentScope-inspired live orchestration/);
assert.match(index, /Run AgentScope Chain/);
assert.match(index, /n8n webhook URL/);

assert.match(styles, /agentscope-runtime-panel/);
assert.match(styles, /beginner-command-deck/);

console.log("agentscope_runtime.test.mjs passed");
