import type { Meta } from "@storybook/react-vite";
import { ResourceContextProvider } from "ra-core";
import { StoryWrapper } from "@/test/StoryWrapper";
import type { Service } from "@/components/atomic-crm/types";
import { ServiceList } from "./ServiceList";

const meta = {
  title: "Tondix CRM/Catalogue/Service List",
  parameters: { layout: "fullscreen" },
} satisfies Meta;
export default meta;

const sampleServices: Service[] = [
  {
    id: 1,
    name: "Entretien complet",
    type: "complet",
    periodicity_months: 6,
    price: 149.99,
    description: "Révision complète",
    active: true,
    created_at: "2025-01-01T00:00:00.000Z",
  },
  {
    id: 2,
    name: "Entretien intermédiaire",
    type: "intermédiaire",
    periodicity_months: 3,
    price: 79.99,
    active: false,
    created_at: "2025-01-01T00:00:00.000Z",
  },
];

export const Empty = () => (
  <StoryWrapper>
    <ResourceContextProvider value="services">
      <ServiceList />
    </ResourceContextProvider>
  </StoryWrapper>
);

export const WithServices = () => (
  <StoryWrapper data={{ services: sampleServices }}>
    <ResourceContextProvider value="services">
      <ServiceList />
    </ResourceContextProvider>
  </StoryWrapper>
);
