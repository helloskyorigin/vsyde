import test from "node:test";
import assert from "node:assert/strict";
import { buildReportModel } from "../lib/report-model.ts";
import { parseHomepage } from "../lib/page-signal-parser.ts";

function site(domain, signals, status="inspected") {
  return { url: "https://" + domain + "/", domain, title: domain, status,
    signals: signals.map(key => ({ key, observed:true, label:key, excerpt:"Verified " + key + " from " + domain })) };
}
test("parse extracted public homepage evidence, not generic opinion scores", () => {
  const markdown = [
    "Title: Example Business",
    "URL Source: https://example.org/",
    "Markdown Content:",
    "# Website help for growing teams",
    "We provide straightforward tools that organize your operations.",
    "[Get started](https://example.org/signup)",
    "Plans from $19 per month",
    "[Privacy Policy](https://example.org/privacy)",
  ].join("\n");
  const result = parseHomepage(markdown);
  assert.equal(result.usable, true);
  assert.equal(result.title, "Example Business");
  assert.equal(result.signals.length, 4);
  assert.deepEqual(result.signals.map(s=>s.observed),[true,true,true,true]);
  assert.ok(result.signals.every(s=>s.excerpt && !s.excerpt.includes("](")));
});
test("empty page does not create invented facts", () => {
  const parsed = parseHomepage("Markdown Content:\nUnavailable");
  assert.equal(parsed.usable, false);
  assert.equal(parsed.signals.filter(s=>s.observed).length,0);
});
test("V1 report has five factors but never numeric scores or fabricated findings", () => {
  const report = {
    status:"complete", createdAt:"2026-11-10T10:00:00.000Z",
    own:site("yourwebsite.com",["headline","action","pricing","trust"]),
    competitor:site("competitor.com",["headline"]),
    leader:"own", summary:"", methodology:"Public text checks",
  };
  const model=buildReportModel(report);
  assert.equal(model.factors.length,5);
  assert.equal(model.factors[4].own,"not-checked");
  assert.ok(model.verdict.includes("more visible signals"));
  assert.equal(model.findings.length,3);
  assert.equal(model.fixes.length,3);
  assert.ok(model.findings.every(f=>f.body.includes("Verified")));
  assert.ok(!JSON.stringify(model).includes("/10"));
});
test("partial coverage returns inconclusive and no unsupported site fixes", () => {
  const report = {
    status:"partial",createdAt:"2026-11-10T10:00:00.000Z",
    own:site("yourwebsite.com",[],"unavailable"),
    competitor:site("competitor.com",["headline"]),
    leader:null,summary:"",methodology:"Public text checks",
  };
  const model=buildReportModel(report);
  assert.equal(model.verdict,"Limited comparison");
  assert.equal(model.fixes.length,0);
  assert.equal(model.factors[0].own,"unavailable");
  assert.equal(model.factors[0].competitor,"found");
});
