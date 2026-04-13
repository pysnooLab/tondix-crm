import { datatype } from "faker/locale/en_US";

import type { MaintenanceContract } from "../../../types";
import type { Db } from "./types";

export const generateMaintenanceContracts = (db: Db): MaintenanceContract[] => {
  const result: MaintenanceContract[] = [];
  let id = 0;

  // Collect deal_services grouped by deal
  const dealServicesByDeal = new Map<number, typeof db.deal_services>();
  for (const ds of db.deal_services) {
    const dealId = ds.deal_id as number;
    if (!dealServicesByDeal.has(dealId)) {
      dealServicesByDeal.set(dealId, []);
    }
    dealServicesByDeal.get(dealId)!.push(ds);
  }

  // For each won deal that has services, create maintenance contracts
  const entries: Array<{
    dealId: number;
    companyId: number;
    serviceId: number;
    periodicityMonths: number;
  }> = [];

  for (const [dealId, dealServices] of dealServicesByDeal) {
    const deal = db.deals.find((d) => d.id === dealId);
    if (!deal) continue;
    for (const ds of dealServices) {
      const service = db.services.find((s) => s.id === ds.service_id);
      if (!service) continue;
      entries.push({
        dealId,
        companyId: deal.company_id as number,
        serviceId: ds.service_id as number,
        periodicityMonths: service.periodicity_months || 12,
      });
    }
  }

  const today = new Date();

  // Distribute entries into 3 buckets ensuring minimums
  // Bucket 0: urgent (expires in 0-29 days) — at least 5
  // Bucket 1: recently expired (expired 1-59 days ago) — at least 5
  // Bucket 2: healthy (expires in 90-365 days) — the rest

  const minUrgent = 5;
  const minExpired = 5;

  // If not enough entries from deal_services, we'll duplicate some to meet minimums
  // But first, try to distribute naturally
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    let offsetDays: number;
    let status: "active" | "expired";

    if (i < minUrgent) {
      // Urgent: end_date = today + random(0, 29)
      offsetDays = datatype.number({ min: 0, max: 29 });
      status = "active";
    } else if (i < minUrgent + minExpired) {
      // Recently expired: end_date = today - random(1, 59)
      offsetDays = -datatype.number({ min: 1, max: 59 });
      status = "expired";
    } else {
      // Healthy: end_date = today + random(90, 365)
      offsetDays = datatype.number({ min: 90, max: 365 });
      status = "active";
    }

    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + offsetDays);

    const startDate = new Date(endDate);
    startDate.setMonth(startDate.getMonth() - entry.periodicityMonths);

    result.push({
      id: id++,
      company_id: entry.companyId,
      service_id: entry.serviceId,
      deal_id: entry.dealId,
      start_date: startDate.toISOString().split("T")[0],
      end_date: endDate.toISOString().split("T")[0],
      status,
      created_at: startDate.toISOString(),
    });
  }

  // If we didn't have enough entries, generate synthetic ones to meet minimums
  const urgentCount = result.filter(
    (c) => c.status === "active" && dateDiffDays(today, new Date(c.end_date)) <= 29,
  ).length;
  const expiredCount = result.filter((c) => c.status === "expired").length;

  // Fill urgent if needed
  for (let i = urgentCount; i < minUrgent; i++) {
    const entry = entries[i % entries.length] || {
      dealId: db.deals[0]?.id as number,
      companyId: db.deals[0]?.company_id as number,
      serviceId: db.services[0]?.id as number,
      periodicityMonths: 12,
    };
    const offsetDays = datatype.number({ min: 0, max: 29 });
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + offsetDays);
    const startDate = new Date(endDate);
    startDate.setMonth(startDate.getMonth() - entry.periodicityMonths);

    result.push({
      id: id++,
      company_id: entry.companyId,
      service_id: entry.serviceId,
      deal_id: entry.dealId,
      start_date: startDate.toISOString().split("T")[0],
      end_date: endDate.toISOString().split("T")[0],
      status: "active",
      created_at: startDate.toISOString(),
    });
  }

  // Fill expired if needed
  for (let i = expiredCount; i < minExpired; i++) {
    const entry = entries[(i + minUrgent) % entries.length] || {
      dealId: db.deals[0]?.id as number,
      companyId: db.deals[0]?.company_id as number,
      serviceId: db.services[0]?.id as number,
      periodicityMonths: 12,
    };
    const offsetDays = datatype.number({ min: 1, max: 59 });
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() - offsetDays);
    const startDate = new Date(endDate);
    startDate.setMonth(startDate.getMonth() - entry.periodicityMonths);

    result.push({
      id: id++,
      company_id: entry.companyId,
      service_id: entry.serviceId,
      deal_id: entry.dealId,
      start_date: startDate.toISOString().split("T")[0],
      end_date: endDate.toISOString().split("T")[0],
      status: "expired",
      created_at: startDate.toISOString(),
    });
  }

  return result;
};

function dateDiffDays(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
}
