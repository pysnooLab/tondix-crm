import { datatype, random } from "faker/locale/en_US";

import type { DealProduct } from "../../../types";
import type { Db } from "./types";

export const generateDealProducts = (db: Db): DealProduct[] => {
  const result: DealProduct[] = [];
  let id = 0;

  const activeProducts = db.products.filter((p) => p.active);

  // Attach 1-3 products to ~60% of deals
  for (const deal of db.deals) {
    if (datatype.boolean() && datatype.boolean()) continue; // ~25% skip

    const count = datatype.number({ min: 1, max: 3 });
    const picked = random.arrayElements(activeProducts, count);

    for (const product of picked) {
      result.push({
        id: id++,
        deal_id: deal.id,
        product_id: product.id,
        quantity: datatype.number({ min: 1, max: 5 }),
        unit_price: product.price,
      });
    }
  }

  return result;
};
