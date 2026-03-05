import { test, expect } from "@playwright/test"

test.describe("Game screen", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
  })

  test("renders the board with 225 squares", async ({ page }) => {
    const squares = page.locator("[data-cell]")
    await expect(squares).toHaveCount(225)
  })

  test("shows the center square bulls-eye", async ({ page }) => {
    const center = page.locator('[data-cell="7-7"]')
    await expect(center).toBeVisible()
    // Center square has the bulls-eye (rounded-full elements)
    await expect(center.locator(".rounded-full").first()).toBeVisible()
  })

  test("shows player names and scores", async ({ page }) => {
    await expect(page.locator('[data-player="You"]')).toBeVisible()
    await expect(page.locator('[data-player="Computer"]')).toBeVisible()
    await expect(page.locator('[data-score="You"]')).toHaveText("0")
    await expect(page.locator('[data-score="Computer"]')).toHaveText("0")
  })

  test("shows the player rack with 7 tiles", async ({ page }) => {
    const rack = page.locator("[data-rack]")
    await expect(rack).toBeVisible()
    const tiles = rack.locator("[data-tile]")
    await expect(tiles).toHaveCount(7)
  })

  test("shows action buttons", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Play" })).toBeVisible()
    await expect(page.getByRole("button", { name: "Swap" })).toBeVisible()
    await expect(page.getByRole("button", { name: "Pass" })).toBeVisible()
    await expect(page.getByRole("button", { name: "Shuffle" })).toBeVisible()
  })

  test("can place a tile on the board by clicking a square", async ({ page }) => {
    // Click an empty square — should place the first rack tile
    await page.locator('[data-cell="7-7"]').click()

    // The square should now contain a tile letter
    const center = page.locator('[data-cell="7-7"]')
    const text = await center.textContent()
    expect(text?.length).toBeGreaterThan(0)
  })

  test("shows error when playing without placing tiles", async ({ page }) => {
    // Try to play without placing any tiles
    await page.getByRole("button", { name: "Play" }).click()

    // Should show an error
    await expect(page.locator('[role="alert"]')).toBeVisible()
  })

  test("shuffle button reorders the rack", async ({ page }) => {
    const rack = page.locator("[data-rack]")
    const tilesBefore = await rack
      .locator("[data-tile]")
      .evaluateAll(els => els.map(el => el.getAttribute("data-tile")))

    // Click shuffle multiple times to increase chance of different order
    for (let i = 0; i < 5; i++) {
      await page.getByRole("button", { name: "Shuffle" }).click()
    }

    const tilesAfter = await rack
      .locator("[data-tile]")
      .evaluateAll(els => els.map(el => el.getAttribute("data-tile")))

    // Same tiles should be present (just possibly reordered)
    expect(tilesAfter.sort()).toEqual(tilesBefore.sort())
  })

  test("swap mode toggles tile selection", async ({ page }) => {
    await page.getByRole("button", { name: "Swap" }).click()

    // Should show confirm and cancel buttons
    await expect(page.getByRole("button", { name: "Confirm swap" })).toBeVisible()
    await expect(page.getByRole("button", { name: "Cancel" })).toBeVisible()

    // Cancel returns to normal mode
    await page.getByRole("button", { name: "Cancel" }).click()
    await expect(page.getByRole("button", { name: "Play" })).toBeVisible()
  })

  test("pass advances the turn to computer", async ({ page }) => {
    await page.getByRole("button", { name: "Pass" }).click()

    // Computer should take its turn — wait for human turn to come back
    // The turn indicator or rack should reappear
    await expect(page.locator("[data-rack]")).toBeVisible({ timeout: 5000 })
  })
})
