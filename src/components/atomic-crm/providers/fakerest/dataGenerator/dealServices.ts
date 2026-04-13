import { datatype, random } from "faker/locale/en_US";

import type { DealService } from "../../../types";
import type { Db } from "./types";

export const generateDealServices = (db: Db): DealService[] => {
  const result: DealService[] = [];
  let id = 0;

  const activeServices = db.services.filter((s) => s.active);
  const wonDeals = db.deals.filter((d) => d.stage === "won");

  // Attach 1-2 services to ~40% of won deals
  for (const deal of wonDeals) {
    if (Math.random() > 0.4) continue;

    const count = datatype.number({ min: 1, max: 2 });
    const picked = random.arrayElements(activeServices, count);

    for (const service of picked) {
      result.push({
        id: id++,
        deal_id: deal.id,
        service_id: service.id,
        quantity: 1,
        unit_price: service.price,
      });
    }
  }

  return result;
};
