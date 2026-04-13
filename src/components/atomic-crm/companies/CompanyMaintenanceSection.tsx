import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { useCreate, useGetList, useGetMany, useShowContext } from "ra-core";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import type { Company, MaintenanceContract, Service } from "../types";

const formatFrenchMonth = (dateStr: string) =>
  new Intl.DateTimeFormat("fr-FR", {
    year: "numeric",
    month: "long",
  }).format(new Date(dateStr));

type ContractFormData = {
  service_id: string;
  start_date: string;
  end_date: string;
};

const addMonths = (dateStr: string, months: number): string => {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().split("T")[0];
};

const AddMaintenanceContractButton = ({
  companyId,
}: {
  companyId: Company["id"];
}) => {
  const [open, setOpen] = useState(false);
  const [create, { isPending }] = useCreate();
  const queryClient = useQueryClient();

  const { data: allServices } = useGetList<Service>("services", {
    filter: { "active@eq": true },
    pagination: { page: 1, perPage: 100 },
    sort: { field: "name", order: "ASC" },
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ContractFormData>({
    defaultValues: {
      service_id: "",
      start_date: new Date().toISOString().split("T")[0],
      end_date: "",
    },
  });

  const selectedServiceId = watch("service_id");
  const startDate = watch("start_date");
  const endDate = watch("end_date");
  const [endDateManuallyEdited, setEndDateManuallyEdited] = useState(false);

  // Auto-calculate end_date when service or start_date changes
  const selectedService = allServices?.find(
    (s) => String(s.id) === selectedServiceId,
  );

  useEffect(() => {
    if (endDateManuallyEdited) return;
    // periodicity_months === 0 means no recurring period (e.g. one-off repair) — skip auto-calc
    if (
      selectedService &&
      selectedService.periodicity_months > 0 &&
      startDate
    ) {
      setValue(
        "end_date",
        addMonths(startDate, selectedService.periodicity_months),
      );
    }
  }, [
    selectedServiceId,
    startDate,
    selectedService,
    endDateManuallyEdited,
    setValue,
  ]);

  const onSubmit = (data: ContractFormData) => {
    create(
      "maintenance_contracts",
      {
        data: {
          company_id: companyId,
          service_id: data.service_id,
          start_date: data.start_date,
          end_date: data.end_date,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["maintenance_contracts", "getList"],
          });
          setOpen(false);
          reset();
          setEndDateManuallyEdited(false);
        },
      },
    );
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="mt-3 cursor-pointer"
        onClick={() => setOpen(true)}
      >
        <Plus className="h-4 w-4 mr-1" />
        Ajouter un contrat
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Nouveau contrat d&apos;entretien</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="service_id">Service</Label>
                <select
                  id="service_id"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  {...register("service_id", { required: true })}
                >
                  <option value="">Choisir un service...</option>
                  {(allServices ?? []).map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                {errors.service_id && (
                  <span className="text-xs text-red-500">
                    Le service est requis
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="start_date">Date de début</Label>
                <input
                  id="start_date"
                  type="date"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  {...register("start_date", { required: true })}
                />
                {errors.start_date && (
                  <span className="text-xs text-red-500">
                    La date de début est requise
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="end_date">Date de fin</Label>
                <input
                  id="end_date"
                  type="date"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  {...register("end_date", { required: true })}
                  onChange={(e) => {
                    setEndDateManuallyEdited(true);
                    setValue("end_date", e.target.value);
                  }}
                />
                {errors.end_date && (
                  <span className="text-xs text-red-500">
                    La date de fin est requise
                  </span>
                )}
                {!endDateManuallyEdited &&
                  selectedService &&
                  selectedService.periodicity_months > 0 &&
                  endDate && (
                    <span className="text-xs text-muted-foreground">
                      Calculé automatiquement (
                      {selectedService.periodicity_months} mois)
                    </span>
                  )}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                disabled={isPending}
                className="cursor-pointer"
              >
                {isPending ? "Création..." : "Créer le contrat"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

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
        <AddMaintenanceContractButton companyId={record.id} />
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
      <AddMaintenanceContractButton companyId={record.id} />
    </div>
  );
};
