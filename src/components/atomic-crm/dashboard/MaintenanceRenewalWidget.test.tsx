import { describe, it, expect } from "vitest";
import { render } from "vitest-browser-react";

import type { Db } from "../providers/fakerest/dataGenerator/types";
import { Default } from "./MaintenanceRenewalWidget.stories";

// Build test dates relative to "now" so we don't need fake timers.
// The widget shows contracts expiring within +30 days or expired within -60 days.
const todayStr = new Date().toISOString().split("T")[0];
const soonDate = new Date(todayStr);
soonDate.setDate(soonDate.getDate() + 15);
const soonDateStr = soonDate.toISOString().split("T")[0];

const expiredDate = new Date(todayStr);
expiredDate.setDate(expiredDate.getDate() - 30);
const expiredDateStr = expiredDate.toISOString().split("T")[0];

const dynamicData: Partial<Db> = {
  companies: [
    {
      id: 1,
      name: "Acme Corp",
      sector: "farming",
      size: 10 as const,
      logo: { src: "", title: "" } as any,
      linkedin_url: "",
      website: "",
      phone_number: "",
      address: "",
      zipcode: "",
      city: "",
      state_abbr: "",
      created_at: "2025-01-01",
      description: "",
      revenue: "",
      tax_identifier: "",
      country: "FR",
    },
    {
      id: 2,
      name: "Beta Ltd",
      sector: "farming",
      size: 10 as const,
      logo: { src: "", title: "" } as any,
      linkedin_url: "",
      website: "",
      phone_number: "",
      address: "",
      zipcode: "",
      city: "",
      state_abbr: "",
      created_at: "2025-01-01",
      description: "",
      revenue: "",
      tax_identifier: "",
      country: "FR",
    },
  ],
  services: [
    {
      id: 1,
      name: "Entretien Standard",
      type: "maintenance",
      periodicity_months: 12,
      price: 150,
      active: true,
      created_at: "2025-01-01",
    },
  ],
  maintenance_contracts: [
    {
      id: 1,
      company_id: 1,
      service_id: 1,
      start_date: "2025-01-01",
      end_date: soonDateStr,
      status: "active" as const,
      created_at: "2025-01-01",
    },
    {
      id: 2,
      company_id: 2,
      service_id: 1,
      start_date: "2024-01-01",
      end_date: expiredDateStr,
      status: "expired" as const,
      created_at: "2024-01-01",
    },
  ],
};

describe("MaintenanceRenewalWidget", () => {
  it("affiche le badge bientot et le nom du contrat", async () => {
    const screen = await render(<Default data={dynamicData} />);
    await expect.element(screen.getByText(/Expire bien/)).toBeVisible();
    await expect.element(screen.getByText("Acme Corp")).toBeVisible();
    await expect
      .element(screen.getByText("Entretien Standard").first())
      .toBeVisible();
  });

  it("affiche le badge expire", async () => {
    const screen = await render(<Default data={dynamicData} />);
    await expect
      .element(screen.getByText(/expiré\(s\)/i))
      .toBeVisible();
  });

  it("retourne null si aucun contrat dans les fenêtres 0-30j et 0-60j", async () => {
    const emptyData: Partial<Db> = {
      ...dynamicData,
      maintenance_contracts: [
        {
          id: 1,
          company_id: 1,
          service_id: 1,
          start_date: "2023-01-01",
          end_date: "2023-06-01", // well outside both windows
          status: "expired" as const,
          created_at: "2023-01-01",
        },
      ],
    };
    const screen = await render(<Default data={emptyData} />);
    // The widget should not render any content
    await expect
      .element(screen.getByText(/Entretiens/))
      .not.toBeInTheDocument();
  });

  it("affiche 'Dans Xj' pour les contrats bientôt expirés et 'Expiré il y a Xj' pour les expirés", async () => {
    const screen = await render(<Default data={dynamicData} />);

    const startOfTodayMs = new Date(todayStr).getTime();
    const soonDays = Math.round(
      (new Date(soonDateStr).getTime() - startOfTodayMs) / 86_400_000,
    );
    const expiredDays = Math.round(
      (startOfTodayMs - new Date(expiredDateStr).getTime()) / 86_400_000,
    );

    await expect.element(screen.getByText(`Dans ${soonDays}j`)).toBeVisible();
    await expect
      .element(screen.getByText(`Expiré il y a ${expiredDays}j`))
      .toBeVisible();
  });
});
