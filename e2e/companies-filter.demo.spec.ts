import { test, expect } from "@playwright/test";

test.describe("Companies filter — demo mode", () => {
  test("Avec équipement filter returns only companies with equipment", async ({
    page,
  }) => {
    await page.goto("/");

    // Navigate to Companies list
    await page.getByRole("link", { name: "Companies" }).click();
    await page.waitForURL("**/#/companies**");

    // Wait for company cards to load (links to company show pages)
    const companyCards = page.locator("a[href*='#/companies/'][href*='/show']");
    await expect(companyCards.first()).toBeVisible({ timeout: 10000 });

    // Count total companies before filtering
    const totalCards = await companyCards.count();
    expect(totalCards).toBeGreaterThan(0);

    // Click the "Avec équipement" filter button
    await page.getByRole("button", { name: /Avec équipement/ }).click();

    // Wait for filtered results to settle (FakeRest has 300ms latency)
    // Use a locator-based wait: pagination text should change
    await expect(page.locator("text=1-25 of 55")).not.toBeVisible({
      timeout: 5000,
    });

    // The filtered list should have fewer companies
    const filteredCards = await companyCards.count();
    expect(filteredCards).toBeGreaterThan(0);
    expect(filteredCards).toBeLessThan(totalCards);

    // Click on the first company in the filtered list
    await companyCards.first().click();
    await page.waitForURL("**/#/companies/*/show**");

    // The equipment section header should be visible
    await expect(page.getByText("Équipements achetés")).toBeVisible({
      timeout: 10000,
    });

    // Verify the equipment section shows actual products (not the empty state)
    await expect(
      page.getByText("Aucun équipement acheté"),
    ).not.toBeVisible();
  });

  test("Avec entretien actif filter returns only companies with active maintenance", async ({
    page,
  }) => {
    await page.goto("/");

    // Navigate to Companies list
    await page.getByRole("link", { name: "Companies" }).click();
    await page.waitForURL("**/#/companies**");

    // Wait for company cards to load
    const companyCards = page.locator("a[href*='#/companies/'][href*='/show']");
    await expect(companyCards.first()).toBeVisible({ timeout: 10000 });

    // Count total companies before filtering
    const totalCards = await companyCards.count();
    expect(totalCards).toBeGreaterThan(0);

    // Click the "Avec entretien actif" filter button
    await page
      .getByRole("button", { name: /Avec entretien actif/ })
      .click();

    // Wait for filtered results to settle
    await expect(page.locator("text=1-25 of 55")).not.toBeVisible({
      timeout: 5000,
    });

    // The filtered list should have fewer companies
    const filteredCards = await companyCards.count();
    expect(filteredCards).toBeGreaterThan(0);
    expect(filteredCards).toBeLessThan(totalCards);

    // Click on the first company in the filtered list
    await companyCards.first().click();
    await page.waitForURL("**/#/companies/*/show**");

    // The maintenance section should be visible
    await expect(page.getByText("Contrats d'entretien")).toBeVisible({
      timeout: 10000,
    });

    // Verify at least one "Actif" status is shown
    await expect(
      page.getByText("Actif", { exact: true }).first(),
    ).toBeVisible();
  });
});
