import test from "node:test";
import assert from "node:assert/strict";
import { discoverInspectionPages } from "../lib/site-page-discovery.ts";

test("only real linked first-party pricing, product, trust pages are selected", () => {
  const content = [
    "Title: Atlas | Team Work",
    "Markdown Content:",
    "[Pricing](https://atlas.io/pricing)",
    "[Features](https://atlas.io/features)",
    "[About](https://atlas.io/about)",
    "[Blog](https://atlas.io/blog/guide)",
    "[Competitor](https://rival.io/pricing)",
    "[Signup](https://atlas.io/signup)",
    "[Pricing again](https://atlas.io/pricing?ref=home)",
  ].join("\n");
  const pages = discoverInspectionPages(content,new URL("https://atlas.io/"));
  assert.deepEqual(pages.map(p=>[p.role,p.url]),[
    ["pricing","https://atlas.io/pricing"],
    ["product","https://atlas.io/features"],
    ["trust","https://atlas.io/about"],
  ]);
});
test("never guesses pages that are not linked, rejects external and account pages", () => {
  const pages = discoverInspectionPages(
    "[Cost](https://othersite.com/pricing)\n[Signin](https://myapp.io/login)\n[Home](https://myapp.io/)",
    new URL("https://myapp.io/"));
  assert.equal(pages.length,0);
});
