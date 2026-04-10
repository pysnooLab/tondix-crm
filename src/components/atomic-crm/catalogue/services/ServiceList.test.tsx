import { render } from "vitest-browser-react";
import { describe, it, expect } from "vitest";
import { Empty, WithServices } from "./ServiceList.stories";

describe("ServiceList", () => {
  it("renders empty state", async () => {
    const screen = await render(<Empty />);
    await expect
      .element(screen.getByText("Ajouter un entretien"))
      .toBeVisible();
  });

  it("renders services", async () => {
    const screen = await render(<WithServices />);
    await expect.element(screen.getByText("Entretien complet")).toBeVisible();
  });
});
