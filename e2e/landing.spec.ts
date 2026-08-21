import { test, expect } from "@playwright/test";

test.describe("Landing page", () => {
  test("shows the hero and navigation to login/register", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("matematiku k přijímačkám");
    await expect(page.getByRole("link", { name: "Přihlásit se" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Vyzkoušet zdarma" })).toBeVisible();
  });

  test("navigates to the login page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Přihlásit se" }).click();
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByLabel("E-mail")).toBeVisible();
    await expect(page.getByLabel("Heslo")).toBeVisible();
  });
});

test.describe("Route protection", () => {
  test("redirects unauthenticated users away from the dashboard", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });
});
