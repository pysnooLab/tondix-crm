import { useGetList, useGetMany, useShowContext } from "ra-core";
import { Link } from "react-router";
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

  if (!record || !contracts?.length) return null;

  const servicesById = new Map((services ?? []).map((s) => [s.id, s]));

  return (
    <div className="bg-[#fefce8] border border-[#fde68a] rounded-lg p-4 mt-4">
      <h3 className="text-sm font-semibold mb-3">
        Contrats de maintenance ({contracts.length})
      </h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-muted-foreground">
            <th className="pb-2 font-medium">Service</th>
            <th className="pb-2 font-medium">P&eacute;riode</th>
            <th className="pb-2 font-medium">Statut</th>
            <th className="pb-2 font-medium">Affaire</th>
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
                  {formatFrenchMonth(contract.start_date)} &ndash;{" "}
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
                    {isActive ? "Actif" : "Expir\u00e9"}
                  </span>
                </td>
                <td className="py-1.5">
                  {contract.deal_id ? (
                    <Link
                      to={`/deals/${contract.deal_id}/show`}
                      className="text-primary hover:underline"
                    >
                      Voir l&apos;affaire
                    </Link>
                  ) : (
                    <span className="text-muted-foreground">&ndash;</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
