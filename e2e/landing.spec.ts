import { test, expect } from "@playwright/test";

for (const width of [320, 375, 390, 768, 1440]) {
  test(`responsive layout fits ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 830 });
    await page.goto("/");
    await expect(page.locator(".hero h1")).toContainText("Who wins?");
    await expect(page.locator(".comparison-form .form-submit")).toBeVisible();
    const docWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(docWidth).toBeLessThanOrEqual(width + 1);
    await page.screenshot({ path: testInfo.outputPath(`landing-${width}px.png`), fullPage: true });
  });
}

test("independent URL validation, same-domain prevention and honest notice", async ({ page }) => {
  await page.goto("/");
  const own = page.locator("#own-url");
  const other = page.locator("#competitor-url");
  const submit = page.locator(".form-submit");
  await submit.click();
  await expect(own).toHaveAttribute("aria-invalid", "true");
  await expect(other).toHaveAttribute("aria-invalid", "true");
  await own.fill("www.example.com");
  await other.fill("example.com");
  await submit.click();
  await expect(page.getByText("Use a different website from your own.")).toBeVisible();
  await expect(own).toHaveAttribute("aria-invalid", "false");
  await expect(other).toHaveAttribute("aria-invalid", "true");
  await other.fill("competitor.org");
  await submit.click();
  await expect(page).toHaveURL(/\/battle\?own=/);
  await expect(page.locator(".battle-site")).toHaveCount(2);
});

test("sample report tabs and FAQ are keyboard accessible", async ({ page }) => {
  await page.goto("/");
  const tab = page.getByRole("tab", { name: "Overview" });
  await tab.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "Evidence" })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel")).toContainText("See where each observation came from.");
  await page.getByRole("tab", { name: "Fix plan" }).click();
  await expect(page.getByRole("tabpanel")).toContainText("Less guessing. More shipping.");
  const faq = page.getByRole("button", { name: "Is vsyde free to try?" });
  await faq.click();
  await expect(faq).toHaveAttribute("aria-expanded", "true");
  await faq.click();
  await expect(faq).toHaveAttribute("aria-expanded", "false");
});

test("find live competitor suggestions, choose a site and start a battle", async ({ page }) => {
  await page.route("**/api/competitors?**", async route => route.fulfill({
    status:200,contentType:"application/json",body:JSON.stringify({
      title:"Example customer tools",source:"public search",
      note:"Suggestions are not verified business competitors.",
      suggestions:[{name:"Related Tool",domain:"related-tool.io",url:"https://related-tool.io/",description:"An alternative tool from public search"}],
    }),
  }));
  await page.goto("/");
  await page.getByRole("button",{name:/Find competitors for me/}).click();
  await expect(page.locator("#own-url")).toHaveAttribute("aria-invalid","true");
  await page.locator("#own-url").fill("example.com");
  await page.getByRole("button",{name:/Find competitors for me/}).click();
  await expect(page.getByRole("button",{name:/Related Tool/})).toBeVisible();
  await page.getByRole("button",{name:/Related Tool/}).click();
  await expect(page.locator("#competitor-url")).toHaveValue("https://related-tool.io/");
  await page.locator(".form-submit").click();
  await expect(page).toHaveURL(/\/battle\?own=/);
});

test("mobile menu opens and section links navigate", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(page.getByRole("navigation", { name: "Mobile navigation" })).toBeVisible();
  await page.getByRole("navigation", { name: "Mobile navigation" }).getByRole("link", { name: "Pricing" }).click();
  await expect(page).toHaveURL(/#pricing$/);
  await expect(page.getByRole("navigation", { name: "Mobile navigation" })).toHaveCount(0);
});

for (const path of ["privacy", "terms", "refund-policy", "methodology", "contact"]) {
  test(`${path} information route opens`, async ({ page }) => {
    await page.goto(`/${path}`);
    await expect(page.locator(".info-content h1")).toBeVisible();
    await expect(page.locator(".info-nav").getByRole("link", { name: "vsyde home" })).toBeVisible();
  });
}

for (const width of [320, 360, 375, 390, 480, 700, 768, 900, 1024, 1440]) {
  test(`theme switch and important text fit ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/");
    const toggle = width <= 900
      ? page.getByRole("button", { name: "Open navigation" })
      : page.getByRole("button", { name: "Switch to dark mode" });
    if (width <= 900) {
      await toggle.click();
      await page.getByRole("navigation", { name: "Mobile navigation" }).getByRole("button", { name: "Switch to dark mode" }).click();
    } else await toggle.click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width + 1);
    const offscreen = await page.evaluate(() => [...document.querySelectorAll("h1, h2, h3, .comparison-form label, .report-tabs button, .price-name, .price-amount, .faq-item button")].filter(node => {
      const el = node as HTMLElement;
      if (el.closest("[hidden]")) return false;
      const r = el.getBoundingClientRect();
      return r.width > 0 && (r.left < -2 || r.right > innerWidth + 2 || el.scrollWidth > el.clientWidth + 2);
    }).slice(0, 8).map(el => ({ tag: el.tagName, text: el.textContent?.slice(0, 55) })));
    expect(offscreen).toEqual([]);
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  });
}

test("theme persists on legal pages and can be restored", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  await page.goto("/privacy");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByRole("button", { name: "Switch to light mode" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});

test("public pricing and contact details stay consistent", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".price-card--featured .price-amount")).toContainText("$19");
  await expect(page.locator(".site-footer a[href='mailto:hello.skyorigin@gmail.com']")).toBeVisible();
  await expect(page.locator(".sample-chip")).toContainText("Not a live scan");
  await expect(page.locator(".site-footer")).not.toContainText("Frontend preview only");
  for (const path of ["contact", "privacy", "terms", "refund-policy", "methodology"]) {
    await page.goto(`/${path}`);
    await expect(page.locator("main")).not.toContainText("$29");
  }
  await page.goto("/contact");
  await expect(page.getByRole("link", { name: "hello.skyorigin@gmail.com" }).first()).toHaveAttribute("href", /mailto:hello\.skyorigin@gmail\.com/);
});

test("battle room handles captures and shows real domains", async ({ page }) => {
  await page.route("**/api/battle/preview?**", async route => {
    await route.fulfill({ status: 502, contentType: "application/json", body: JSON.stringify({ error: "Website preview temporarily unavailable." }) });
  });
  await page.route("**/api/battle/inspect?**", async route => route.fulfill({
    status: 200, contentType: "application/json",
    body: JSON.stringify({
      status: "unavailable", summary: "Public content could not be inspected.", leader: null,
      methodology: "Observable page-text signals.", createdAt: new Date().toISOString(),
      own: { url: "https://www.example.com/", domain: "www.example.com", title: "Site A", status: "unavailable", signals: [] },
      competitor: { url: "https://example.org/", domain: "example.org", title: "Site B", status: "unavailable", signals: [] },
    }),
  }));
  await page.goto("/");
  await page.locator("#own-url").fill("https://www.example.com");
  await page.locator("#competitor-url").fill("https://example.org");
  await page.locator(".form-submit").click();
  await expect(page).toHaveURL(/\/battle\?own=/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Your battle starts here");
  await expect(page.locator(".battle-site")).toHaveCount(2);
  await expect(page.locator(".battle-site--one")).toContainText("www.example.com");
  await expect(page.locator(".battle-site--two")).toContainText("example.org");
  await expect(page.locator(".battle-viewport-error")).toHaveCount(2);
  await expect(page.locator(".battle-viewport-error").first()).toContainText("Website preview temporarily unavailable.");
  await expect(page.locator(".battle-stage--limited").first()).toContainText("Limited");
  await expect(page.getByRole("link", { name: "Open www.example.com in a new tab" })).toHaveAttribute("href", "https://www.example.com/");
});

for (const width of [320, 375, 390, 768, 1024, 1440]) {
  test(`battle room fits width ${width}px, including saved dark mode`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.route("**/api/battle/preview?**", async route => {
      await route.fulfill({ status: 422, contentType: "application/json", body: JSON.stringify({ error: "Could not capture this page." }) });
    });
    await page.route("**/api/battle/inspect?**", async route => route.fulfill({
      status: 200, contentType: "application/json",
      body: JSON.stringify({
        status:"unavailable",createdAt:new Date().toISOString(),summary:"Inspection unavailable.",leader:null,methodology:"Only observable signals.",
        own:{url:"https://example.com/",domain:"example.com",title:"Site A",status:"unavailable",signals:[]},
        competitor:{url:"https://example.org/",domain:"example.org",title:"Site B",status:"unavailable",signals:[]},
      }),
    }));
    await page.goto("/battle?own=https%3A%2F%2Fexample.com&competitor=https%3A%2F%2Fexample.org");
    await expect(page.locator(".battle-site")).toHaveCount(2);
    await expect(page.locator(".battle-viewport-error")).toHaveCount(2);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
    expect(overflow).toBe(false);
    await page.getByRole("button", { name: "Switch to dark mode" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width + 1);
  });
}
test("battle room rejects invalid or repeated domains", async ({ page }) => {
  await page.goto("/battle?own=https%3A%2F%2Fexample.com&competitor=https%3A%2F%2Fwww.example.com");
  await expect(page.getByRole("heading", { name: "Two websites. One battle." })).toBeVisible();
  await expect(page.getByRole("link", { name: "Choose websites" })).toBeVisible();
});

const signalKeys = ["headline", "action", "pricing", "trust"];
function reportFixture() {
  const signals = (domain: string, count: number) => signalKeys.map((key, index) => ({
    key, label: key, observed: index < count, excerpt: index < count ? domain + " public information" : "",
  }));
  return {
    status:"complete",createdAt:"2026-11-10T10:00:00.000Z",
    summary:"example.com has more detectable on-page signals in this limited check.",
    leader:"own",methodology:"Automated homepage text checks.",
    own:{url:"https://example.com/",domain:"example.com",title:"Example Domain",status:"inspected",signals:signals("example.com",4)},
    competitor:{url:"https://example.org/",domain:"example.org",title:"Example Org",status:"inspected",signals:signals("example.org",1)},
  };
}
test("browser screenshots can zoom, mobile tabs switch, and free results open", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 830 });
  await page.route("**/api/battle/preview?**", async route => route.fulfill({
    status:200,contentType:"image/svg+xml",
    body:'<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1200"><rect width="900" height="1200" fill="#cfe3fe"/></svg>',
  }));
  await page.route("**/api/battle/inspect?**", async route => route.fulfill({
    status:200,contentType:"application/json",body:JSON.stringify(reportFixture()),
  }));
  await page.goto("/battle?own=https%3A%2F%2Fexample.com&competitor=https%3A%2F%2Fexample.org");
  await expect(page.locator(".battle-site--one")).toBeVisible();
  await expect(page.locator(".battle-site--two")).toBeHidden();
  await page.getByRole("button", { name: "Competitor" }).click();
  await expect(page.locator(".battle-site--one")).toBeHidden();
  await expect(page.locator(".battle-site--two")).toBeVisible();
  await page.getByRole("button", { name: "Your website" }).click();
  await page.getByRole("button", { name: "Expand screenshot of example.com" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Zoom in" }).click();
  await expect(page.getByRole("dialog")).toContainText("125%");
  await page.getByRole("button", { name: "Close expanded screenshot" }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.getByRole("link", { name: "View Battle Report" }).click();
  await expect(page).toHaveURL(/\/results\?own=/);
  await expect(page.getByRole("heading", { name: "Battle Report." })).toBeVisible();
  await expect(page.locator(".br-factor")).toHaveCount(5);
  await expect(page.locator(".br-finding")).toHaveCount(3);
  await expect(page.locator(".br-fix")).toHaveCount(3);
  await expect(page.locator(".br-main")).not.toContainText("$19");
  await page.getByRole("link", { name: "Edit websites" }).click();
  await expect(page.locator("#own-url")).toHaveValue("https://example.com/");
  await expect(page.locator("#competitor-url")).toHaveValue("https://example.org/");
});

for (const width of [320, 390, 768, 1440]) {
  test(`free results responsive at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 820 });
    await page.route("**/api/battle/preview?**", async route => route.fulfill({status:502,contentType:"application/json",body:JSON.stringify({error:"Capture unavailable"})}));
    await page.route("**/api/battle/inspect?**", async route => route.fulfill({
      status:200, contentType:"application/json",body:JSON.stringify(reportFixture()),
    }));
    await page.goto("/results?own=https%3A%2F%2Fexample.com&competitor=https%3A%2F%2Fexample.org");
    await expect(page.locator(".br-factor")).toHaveCount(5);
    await expect(page.locator(".br-fix")).toHaveCount(3);
    await expect(page.locator(".br-snapshot")).toHaveCount(2);
    await expect(page.locator(".br-journey-stage")).toHaveCount(4);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width + 1);
    await page.getByRole("button", { name: "Switch to dark mode" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  });
}
test("invalid screenshot URLs are rejected before remote capture", async ({ request }) => {
  const res = await request.get("/api/battle/preview?url=http%3A%2F%2F127.0.0.1");
  expect(res.status()).toBe(400);
});

test("incomplete website scan renders a clear inconclusive report", async ({ page }) => {
  await page.route("**/api/battle/inspect?**", async route => route.fulfill({
    status:200,contentType:"application/json",
    body:JSON.stringify({
      status:"partial", createdAt:new Date().toISOString(),summary:"Only one site was readable.",leader:null,methodology:"Homepage text checks.",
      own:{url:"https://example.com/",domain:"example.com",title:"Public homepage",status:"unavailable",signals:[],note:"Capture blocked."},
      competitor:{url:"https://example.org/",domain:"example.org",title:"Example",status:"inspected",signals:[{key:"headline",label:"Page headline",observed:true,excerpt:"Example headline"}]}
    })
  }));
  await page.goto("/results?own=https%3A%2F%2Fexample.com&competitor=https%3A%2F%2Fexample.org");
  await expect(page.locator("#br-verdict-title")).toContainText("Limited comparison");
  await expect(page.locator(".br-factor")).toHaveCount(5);
  await expect(page.locator(".br-fix")).toHaveCount(0);
  await expect(page.locator(".br-empty")).toContainText("Inspect your site");
});
