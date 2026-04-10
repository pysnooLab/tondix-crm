import type { DataProvider, Identifier } from "ra-core";
import type { DealProductLine, DealServiceLine } from "../types";

export async function syncDealProducts(
  dataProvider: DataProvider,
  dealId: Identifier,
  lines: DealProductLine[],
): Promise<void> {
  const { data: existing } = await dataProvider.getList("deal_products", {
    filter: { "deal_id@eq": dealId },
    pagination: { page: 1, perPage: 1000 },
    sort: { field: "id", order: "ASC" },
  });
  await Promise.all(
    existing.map((rec) =>
      dataProvider.delete("deal_products", { id: rec.id, previousData: rec }),
    ),
  );
  await Promise.all(
    lines.map((line) =>
      dataProvider.create("deal_products", {
        data: { ...line, deal_id: dealId },
      }),
    ),
  );
}

export async function syncDealServices(
  dataProvider: DataProvider,
  dealId: Identifier,
  lines: DealServiceLine[],
): Promise<void> {
  const { data: existing } = await dataProvider.getList("deal_services", {
    filter: { "deal_id@eq": dealId },
    pagination: { page: 1, perPage: 1000 },
    sort: { field: "id", order: "ASC" },
  });
  await Promise.all(
    existing.map((rec) =>
      dataProvider.delete("deal_services", { id: rec.id, previousData: rec }),
    ),
  );
  await Promise.all(
    lines.map((line) =>
      dataProvider.create("deal_services", {
        data: { ...line, deal_id: dealId },
      }),
    ),
  );
}
