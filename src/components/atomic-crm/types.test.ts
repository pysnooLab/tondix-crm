import { describe, it, expectTypeOf } from "vitest";
import type {
  Product,
  Service,
  DealProduct,
  MaintenanceContract,
  DealProductLine,
  CompanySummary,
} from "./types";

describe("Tondix types", () => {
  it("Product has required fields", () => {
    expectTypeOf<Product>().toHaveProperty("name");
    expectTypeOf<Product>().toHaveProperty("price");
    expectTypeOf<Product>().toHaveProperty("active");
  });

  it("Service has periodicity_months", () => {
    expectTypeOf<Service>().toHaveProperty("periodicity_months");
  });

  it("DealProduct links deal_id to product_id", () => {
    expectTypeOf<DealProduct>().toHaveProperty("deal_id");
    expectTypeOf<DealProduct>().toHaveProperty("product_id");
    expectTypeOf<DealProduct>().toHaveProperty("quantity");
    expectTypeOf<DealProduct>().toHaveProperty("unit_price");
  });

  it("MaintenanceContract has start_date and end_date", () => {
    expectTypeOf<MaintenanceContract>().toHaveProperty("start_date");
    expectTypeOf<MaintenanceContract>().toHaveProperty("end_date");
  });

  it("DealProductLine has no id (virtual type)", () => {
    expectTypeOf<DealProductLine>().not.toHaveProperty("id");
    expectTypeOf<DealProductLine>().toHaveProperty("product_id");
  });

  it("CompanySummary extends Company", () => {
    expectTypeOf<CompanySummary>().toHaveProperty("has_equipment");
    expectTypeOf<CompanySummary>().toHaveProperty("has_maintenance");
  });
});
