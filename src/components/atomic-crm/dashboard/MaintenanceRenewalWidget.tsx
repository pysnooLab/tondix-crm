import { useGetList, useGetMany } from "ra-core";
import { Link } from "react-router";

import { Badge } from "@/components/ui/badge";
import type { Company, MaintenanceContract, Service } from "../types";

export const MaintenanceRenewalWidget = () => {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const plus30 = new Date(today);
  plus30.setDate(today.getDate() + 30);
  const plus30Str = plus30.toISOString().split("T")[0];
  const minus60 = new Date(today);
  minus60.setDate(today.getDate() - 60);
  const minus60Str = minus60.toISOString().split("T")[0];

  const { data: contracts = [], isPending } = useGetList<MaintenanceContract>(
    "maintenance_contracts",
    {
      filter: { "end_date@gte": minus60Str, "end_date@lte": plus30Str },
      pagination: { page: 1, perPage: 100 },
      sort: { field: "end_date", order: "ASC" },
    },
  );

  const companyIds = [...new Set(contracts.map((c) => c.company_id))];
  const serviceIds = [...new Set(contracts.map((c) => c.service_id))];

  const { data: companies = [] } = useGetMany<Company>(
    "companies",
    {
      ids: companyIds,
    },
    { enabled: companyIds.length > 0 },
  );

  const { data: services = [] } = useGetMany<Service>(
    "services",
    {
      ids: serviceIds,
    },
    { enabled: serviceIds.length > 0 },
  );

  const companyById = Object.fromEntries(companies.map((c) => [c.id, c]));
  const serviceById = Object.fromEntries(services.map((s) => [s.id, s]));

  const soonContracts = contracts.filter(
    (c) => c.end_date >= todayStr && c.end_date <= plus30Str,
  );
  const expiredContracts = contracts.filter(
    (c) => c.end_date >= minus60Str && c.end_date < todayStr,
  );

  if (
    isPending ||
    (soonContracts.length === 0 && expiredContracts.length === 0)
  ) {
    return null;
  }

  const diffDays = (dateStr: string) => {
    const target = new Date(dateStr).getTime();
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return Math.round((target - now.getTime()) / 86_400_000);
  };

  const renderRow = (c: MaintenanceContract) => {
    const d = diffDays(c.end_date);
    return (
      <Link
        key={c.id}
        to={`/companies/${c.company_id}/show`}
        className="flex gap-4 px-4 py-2 hover:bg-gray-50 text-sm border-b last:border-0"
      >
        <span className="flex-1 font-medium">
          {companyById[c.company_id]?.name ?? "\u2014"}
        </span>
        <span className="flex-1 text-gray-600">
          {serviceById[c.service_id]?.name ?? "\u2014"}
        </span>
        <span className="w-32 text-right">
          {d >= 0 ? `Dans ${d}j` : `Expir\u00e9 il y a ${-d}j`}
        </span>
        <span className="w-24 text-right text-gray-500">{c.end_date}</span>
      </Link>
    );
  };

  return (
    <div className="rounded-xl border overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-green-600 to-yellow-600">
        <span className="text-white font-semibold">
          🔧 Entretiens à relancer
        </span>
        <div className="flex gap-2">
          {soonContracts.length > 0 && (
            <Badge
              variant="outline"
              className="bg-orange-100 text-orange-800 border-orange-300"
            >
              {"\u26A0"} {soonContracts.length} bient\u00f4t
            </Badge>
          )}
          {expiredContracts.length > 0 && (
            <Badge variant="destructive">
              {"\u2715"} {expiredContracts.length} expir\u00e9(s)
            </Badge>
          )}
        </div>
      </div>
      {soonContracts.length > 0 && (
        <div>
          <div className="px-4 py-2 bg-orange-50 text-orange-700 text-sm font-medium">
            Expire bient\u00f4t
          </div>
          {soonContracts.map(renderRow)}
        </div>
      )}
      {expiredContracts.length > 0 && (
        <div>
          <div className="px-4 py-2 bg-red-50 text-red-700 text-sm font-medium">
            Expir\u00e9s r\u00e9cemment
          </div>
          {expiredContracts.map(renderRow)}
        </div>
      )}
      <div className="px-4 py-2 border-t text-sm">
        <Link
          to={{
            pathname: "/companies",
            search: `filter=${JSON.stringify({ "has_maintenance@eq": true })}`,
          }}
          className="text-primary hover:underline"
        >
          Voir toutes les entreprises avec contrat d&apos;entretien &rarr;
        </Link>
      </div>
    </div>
  );
};
