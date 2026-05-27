import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const worker = readFileSync("public/_worker.js", "utf8");
const app = readFileSync("public/app.js", "utf8");
const index = readFileSync("public/index.html", "utf8");

for (const source of [worker, app, index]) {
  assert.match(source, /everything-claude-code/);
  assert.match(source, /Everything Claude Code/);
  assert.match(source, /https:\/\/github\.com\/arabicapp\/everything-claude-code/);
}

assert.match(worker, /developer configuration reference only|Reference\/import checklist only/);
assert.match(app, /Reference\/import checklist only/);
assert.match(index, /<option value="everything-claude-code">Everything Claude Code Toolkit<\/option>/);

console.log("connectors_catalog.test.mjs passed");
