import { expect, test } from "@playwright/test";

test("renders the live dashboard and preserves deep-linked filters", async ({ page }) => {
  await page.goto("/?agent=autoresearch-bwell&view=pressure");

  await expect(page.getByText("Watch the frontier drop.")).toBeVisible();
  await expect(page.getByText("Crown table")).toBeVisible();
  await expect(page.getByText("What the swarm is doing now")).toBeVisible();
  await expect(page).toHaveURL(/agent=autoresearch-bwell/);
  await expect(page.getByRole("tab", { name: "Pressure" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(page.getByText("visible experiments for this agent")).toBeVisible();
});

test("opens an improvement story from the wall and navigates to stable detail pages", async ({
  page,
}) => {
  await page.goto("/");

  await page
    .getByRole("button", { name: /final lr frac 0\.05 -> 0\.02/i })
    .first()
    .click();

  await expect(page.getByText("Improvement story")).toBeVisible();
  await expect(page.getByRole("link", { name: "Open story page" })).toBeVisible();

  await page.getByRole("link", { name: "Open story page" }).click();
  await expect(page).toHaveURL(/\/improvement\//);
  await expect(page.getByText("Frontier cut")).toBeVisible();
  await expect(page.getByText("What else happened nearby")).toBeVisible();

  await page.getByRole("link", { name: /Open autoresearch-bwell/i }).click();
  await expect(page.getByText("Agent profile")).toBeVisible();
  await expect(page.getByText("Every cut this agent landed")).toBeVisible();
});

test("closes a deep-linked improvement sheet cleanly", async ({ page }) => {
  const stepId = "autoresearch-bwell-15-2026-03-15T08:49:00.000Z";
  await page.goto(`/?step=${encodeURIComponent(stepId)}`);

  await expect(page.getByText("Improvement story")).toBeVisible();
  await page.getByRole("button", { name: "Close detail sheet" }).click();
  await expect(page.getByText("Improvement story")).not.toBeVisible();
  await expect(page).not.toHaveURL(/step=/);
});
