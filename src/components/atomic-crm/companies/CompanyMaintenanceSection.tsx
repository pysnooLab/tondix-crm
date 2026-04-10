import { Badge } from "@/components/ui/badge";
import { useGetList, useGetMany, useShowContext } from "ra-core";
import type { Company, MaintenanceContract, Service } from "../types";

const formatFrenchMonth = (dateStr: string) =>
  new Intl.DateTimeFormat("fr-FR", {
    year: "numeric",
    month: "long",
  }).format(new Date(dateStr));

export const CompanyMaintenanceSection = () => {
  const { record } = useShowContext<Company>();

  const { data: contracts } = useGetList<MaintenanceContract>(
    "maintenance_contracts",
    {
      pagination: { page: 1, perPage: 100 },
      sort: { field: "start_date", order: "DESC" },
      filter: { company_id: record?.id },
    },
  );

  const serviceIds = [...new Set((contracts ?? []).map((c) => c.service_id))];

  const { data: services } = useGetMany<Service>(
    "services",
    { ids: serviceIds },
    { enabled: serviceIds.length > 0 },
  );

  if (!record) return null;

  const activeCount = (contracts ?? []).filter(
    (c) => new Date(c.end_date) > new Date(),
  ).length;

  if (!contracts?.length) {
    return (
      <div className="bg-[#fefce8] border border-[#fde68a] rounded-lg p-4 mt-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="font-semibold">🔧 Contrats d&apos;entretien</span>
          <Badge variant="secondary">0 actif(s)</Badge>
        </div>
        <p className="text-sm text-gray-500">Aucun contrat</p>
      </div>
    );
  }

  const servicesById = new Map((services ?? []).map((s) => [s.id, s]));

  return (
    <div className="bg-[#fefce8] border border-[#fde68a] rounded-lg p-4 mt-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="font-semibold">🔧 Contrats d&apos;entretien</span>
        <Badge variant="secondary">{activeCount} actif(s)</Badge>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-muted-foreground">
            <th className="pb-2 font-medium">Service</th>
            <th className="pb-2 font-medium">Début</th>
            <th className="pb-2 font-medium">Fin</th>
            <th className="pb-2 font-medium">Statut</th>
          </tr>
        </thead>
        <tbody>
          {contracts.map((contract) => {
            const service = servicesById.get(contract.service_id);
            const isActive = new Date(contract.end_date) > new Date();
            return (
              <tr key={contract.id} className="border-t border-[#fde68a]">
                <td className="py-1.5">{service?.name ?? "Service inconnu"}</td>
                <td className="py-1.5">
                  {formatFrenchMonth(contract.start_date)}
                </td>
                <td className="py-1.5">
                  {formatFrenchMonth(contract.end_date)}
                </td>
                <td className="py-1.5">
                  <span
                    className={
                      isActive
                        ? "text-green-700 font-medium"
                        : "text-red-600 font-medium"
                    }
                  >
                    {isActive ? "Actif" : "Expiré"}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
