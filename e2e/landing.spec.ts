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
  await expect(page.getByRole("status")).toContainText("does not run a scan yet");
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
