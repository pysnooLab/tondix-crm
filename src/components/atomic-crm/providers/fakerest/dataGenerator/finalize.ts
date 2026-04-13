import type { Db } from "./types";

export const finalize = (db: Db) => {
  // set contact status according to the latest note
  db.contact_notes
    .sort((a, b) => new Date(a.date).valueOf() - new Date(b.date).valueOf())
    .forEach((note) => {
      db.contacts[note.contact_id as number].status = note.status;
    });

  // Patch has_equipment and has_maintenance based on actual data
  const now = new Date();
  db.companies.forEach((company) => {
    const companyDeals = db.deals.filter((d) => d.company_id === company.id);
    const dealIds = new Set(companyDeals.map((d) => d.id));
    (company as any).has_equipment = db.deal_products.some((dp) =>
      dealIds.has(dp.deal_id as number),
    );
    (company as any).has_maintenance = db.maintenance_contracts.some(
      (mc) => mc.company_id === company.id && new Date(mc.end_date) > now,
    );
  });
};
