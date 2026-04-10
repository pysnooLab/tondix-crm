import type { Meta } from "@storybook/react-vite";
import type { ReactNode } from "react";

import type { Db } from "../providers/fakerest/dataGenerator/types";
import { StoryWrapper } from "@/test/StoryWrapper";
import { MaintenanceRenewalWidget } from "./MaintenanceRenewalWidget";

const meta = {
  title: "Atomic CRM/Dashboard/MaintenanceRenewalWidget",
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta;

export default meta;

const storyData: Partial<Db> = {
  companies: [
    {
      id: 1,
      name: "Acme Corp",
      sector: "farming",
      size: 10,
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
      start_date: "2025-04-25",
      end_date: "2026-04-25",
      status: "active" as const,
      created_at: "2025-04-25",
    },
    {
      id: 2,
      company_id: 1,
      service_id: 1,
      start_date: "2024-02-01",
      end_date: "2026-02-15",
      status: "expired" as const,
      created_at: "2024-02-01",
    },
  ],
};

export const Default = ({
  children,
  data = storyData,
}: {
  children?: ReactNode;
  data?: Partial<Db>;
}) => (
  <StoryWrapper data={data}>
    <MaintenanceRenewalWidget />
    {children}
  </StoryWrapper>
);
