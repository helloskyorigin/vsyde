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
  await expect(page.getByRole("tabpanel")).toContainText("See the reason behind the score.");
  await page.getByRole("tab", { name: "Fix plan" }).click();
  await expect(page.getByRole("tabpanel")).toContainText("Less guessing. More shipping.");
  const faq = page.getByRole("button", { name: "Is vsyde free to try?" });
  await faq.click();
  await expect(faq).toHaveAttribute("aria-expanded", "true");
  await faq.click();
  await expect(faq).toHaveAttribute("aria-expanded", "false");
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
  await expect(page.locator(".battle-stage--current")).toContainText("Limited");
  await expect(page.getByRole("link", { name: "Open www.example.com in a new tab" })).toHaveAttribute("href", "https://www.example.com/");
});

for (const width of [320, 375, 390, 768, 1024, 1440]) {
  test(`battle room fits width ${width}px, including saved dark mode`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.route("**/api/battle/preview?**", async route => {
      await route.fulfill({ status: 422, contentType: "application/json", body: JSON.stringify({ error: "Could not capture this page." }) });
    });
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
