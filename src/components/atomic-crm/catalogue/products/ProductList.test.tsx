import { render } from "vitest-browser-react";
import { describe, it, expect } from "vitest";
import { Empty, Success } from "./ProductList.stories";

describe("ProductList", () => {
  it("renders empty state", async () => {
    const screen = await render(<Empty />);
    await expect
      .element(screen.getByText("Ajouter une tondeuse"))
      .toBeVisible();
  });

  it("renders products", async () => {
    const screen = await render(<Success />);
    await expect.element(screen.getByText("Tondeuse Robot 400")).toBeVisible();
    await expect
      .element(screen.getByText("Tondeuse Thermique 51"))
      .toBeVisible();
  });
});
