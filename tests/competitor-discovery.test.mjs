import test from "node:test";
import assert from "node:assert/strict";
import { candidatesFromHits, parseBingRSS, searchQuery } from "../lib/competitor-discovery.ts";

test("RSS results are decoded and filtered without inventing competitors", () => {
  const rss = "<rss><channel><item><title>Alpha &amp; Co</title><link>https://alpha.io/</link><description>Messaging &amp; email</description></item><item><title>Article</title><link>https://reddit.com/r/test</link><description>skip</description></item></channel></rss>";
  const results = candidatesFromHits(parseBingRSS(rss),"mywebsite.com");
  assert.equal(results.length,1);
  assert.equal(results[0].domain,"alpha.io");
  assert.equal(results[0].description,"Messaging & email");
});
test("filter repeated, self and search-directory domains", () => {
  const hits = ["https://mywebsite.com/","https://g2.com/test","https://alpha.io/","https://alpha.io/hello"].map(url=>({title:"Tool",url,description:""}));
  assert.deepEqual(candidatesFromHits(hits,"mywebsite.com").map(item=>item.domain),["alpha.io"]);
});
test("search context uses real page metadata and short query", () => {
  const q = searchQuery("Title: Fable — Smart writing tool\n# Write clearly, together", "fable.com");
  assert.match(q.query,/Fable/);
  assert.ok(q.query.length <= 160);
});

test("suggestions require category relevance and ignore unrelated providers", () => {
  const context = searchQuery("Title: MailLaunch — Email Marketing Software\n# Send email campaigns to your customers", "maillaunch.com");
  assert.equal(context.category,"email marketing");
  const hits = [
    {title:"Irrelevant CRM",url:"https://pipeline.app",description:"Sales dashboard for businesses"},
    {title:"SendBird - Email Marketing",url:"https://sendbird.app",description:"Email campaigns and newsletter marketing made easy"},
    {title:"Top 10 Email Apps",url:"https://listblog.com/articles/email",description:"Email marketing newsletter"},
  ];
  assert.deepEqual(candidatesFromHits(hits,"maillaunch.com",context).map(c=>c.domain),["sendbird.app"]);
});
test("unidentified homepage category does not create a misleading query", () => {
  const context = searchQuery("Title: Hello World\n# Welcome to our homepage", "hello-world.com");
  assert.equal(context.category,"");
  assert.equal(context.query,"");
});
