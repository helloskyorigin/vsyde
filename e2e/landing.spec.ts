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
