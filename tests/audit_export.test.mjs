import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const worker = readFileSync("public/_worker.js", "utf8");
const app = readFileSync("public/app.js", "utf8");
const index = readFileSync("public/index.html", "utf8");

assert.match(worker, /async function auditSummaryApi/);
assert.match(worker, /async function auditExportApi/);
assert.match(worker, /url\.pathname === "\/api\/audit-summary"/);
assert.match(worker, /url\.pathname === "\/api\/audit-export"/);
assert.match(worker, /journal_entries/);
assert.match(worker, /agent_run_logs/);
assert.match(worker, /trade_previews/);
assert.match(worker, /approved_trades/);
assert.match(worker, /rejected_trades/);
assert.match(worker, /rule_violations/);

assert.match(app, /fetch\("\/api\/audit-summary"/);
assert.match(app, /fetch\("\/api\/audit-export"/);
assert.match(app, /function renderAuditSummary/);
assert.match(app, /function exportAuditBundle/);
assert.match(app, /exportAuditBundle"\)\?\.addEventListener\("click", exportAuditBundle\)/);

assert.match(index, /id="auditSummaryGrid"/);
assert.match(index, /id="exportAuditBundle"/);
assert.match(index, /Export Audit JSON/);

console.log("audit_export.test.mjs passed");
