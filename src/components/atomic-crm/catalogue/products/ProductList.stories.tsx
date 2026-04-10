import type { Meta } from "@storybook/react-vite";
import { ResourceContextProvider } from "ra-core";
import { StoryWrapper } from "@/test/StoryWrapper";
import { ProductList } from "./ProductList";
import type { Product } from "../../types";

const meta = {
  title: "Tondix CRM/Catalogue/Product List",
  parameters: { layout: "fullscreen" },
} satisfies Meta;
export default meta;

const successProducts: Product[] = [
  {
    id: 1,
    name: "Tondeuse Robot 400",
    price: 1299.99,
    active: true,
    description: "Robot autonome",
    created_at: "2025-01-01T00:00:00Z",
  },
  {
    id: 2,
    name: "Tondeuse Thermique 51",
    price: 499.99,
    active: false,
    description: "Thermique 51cm",
    created_at: "2025-01-01T00:00:00Z",
  },
];

export const Empty = () => (
  <StoryWrapper>
    <ResourceContextProvider value="products">
      <ProductList />
    </ResourceContextProvider>
  </StoryWrapper>
);

export const Success = () => (
  <StoryWrapper data={{ products: successProducts }}>
    <ResourceContextProvider value="products">
      <ProductList />
    </ResourceContextProvider>
  </StoryWrapper>
);

export const Loading = () => (
  <StoryWrapper
    dataProvider={{
      getList: async (resource) => {
        if (resource === "products") await new Promise(() => {});
        return { data: [], total: 0 };
      },
    }}
  >
    <ResourceContextProvider value="products">
      <ProductList />
    </ResourceContextProvider>
  </StoryWrapper>
);
