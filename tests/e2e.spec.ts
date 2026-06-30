import { test, expect } from "@playwright/test";

test.describe("RegexDebug E2E", () => {
  test("landing page loads with hero section", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("text=Debug Regex")).toBeVisible();
    await expect(page.locator("text=Like a Pro")).toBeVisible();
  });

  test("landing page has feature cards", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=Step Debugging")).toBeVisible();
    await expect(page.locator("text=ReDoS Detection")).toBeVisible();
    await expect(page.locator("text=Test Generator")).toBeVisible();
    await expect(page.locator("text=Share Sessions")).toBeVisible();
  });

  test("navigation to playground", async ({ page }) => {
    await page.goto("/");
    await page.click("text=Launch Debugger");
    await expect(page).toHaveURL(/.*playground/);
  });

  test("playground has regex editor", async ({ page }) => {
    await page.goto("/playground");
    await expect(page.locator("text=Regular Expression")).toBeVisible();
    await expect(page.locator("text=Test String")).toBeVisible();
    await expect(page.locator("text=Match Results")).toBeVisible();
  });

  test("playground has tabs", async ({ page }) => {
    await page.goto("/playground");
    await expect(page.locator("text=Step Debug")).toBeVisible();
    await expect(page.locator("text=ReDoS")).toBeVisible();
    await expect(page.locator("text=Tests")).toBeVisible();
    await expect(page.locator("text=Groups")).toBeVisible();
    await expect(page.locator("text=Explain")).toBeVisible();
  });

  test("cheatsheet sidebar is visible", async ({ page }) => {
    await page.goto("/playground");
    await expect(page.locator("text=Cheatsheet")).toBeVisible();
    await expect(page.locator("text=Quick Reference")).toBeVisible();
  });

  test("settings page has theme options", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.locator("text=Theme")).toBeVisible();
    await expect(page.locator("text=Dark")).toBeVisible();
    await expect(page.locator("text=Light")).toBeVisible();
    await expect(page.locator("text=System")).toBeVisible();
  });

  test("sessions page loads", async ({ page }) => {
    await page.goto("/sessions");
    await expect(page.locator("text=Debug Sessions")).toBeVisible();
  });

  test("health endpoint returns healthy", async ({ request }) => {
    const response = await request.get("/api/health");
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.status).toBe("healthy");
  });

  test("debug API returns results", async ({ request }) => {
    const response = await request.post("/api/debug", {
      data: {
        pattern: "\\d+",
        testString: "hello 123 world",
        flags: "g",
      },
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.matches).toBeDefined();
    expect(body.matches.length).toBeGreaterThan(0);
    expect(body.matches[0].match).toBe("123");
  });

  test("explain API returns tokens", async ({ request }) => {
    const response = await request.post("/api/explain", {
      data: { pattern: "\\d+" },
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.tokens).toBeDefined();
    expect(body.tokens.length).toBeGreaterThan(0);
  });

  test("redos-check API detects vulnerable patterns", async ({ request }) => {
    const response = await request.post("/api/redos-check", {
      data: { pattern: "(a+)+" },
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.isVulnerable).toBe(true);
  });

  test("generate-tests API returns test cases", async ({ request }) => {
    const response = await request.post("/api/generate-tests", {
      data: { pattern: "\\d{3}", count: 3 },
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.tests).toBeDefined();
    expect(body.tests.length).toBeGreaterThan(0);
  });

  test("invalid input is rejected", async ({ request }) => {
    const response = await request.post("/api/debug", {
      data: { pattern: "", testString: "test" },
    });
    expect(response.status()).toBe(400);
  });

  test("footer is visible", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=MIT License")).toBeVisible();
  });
});
