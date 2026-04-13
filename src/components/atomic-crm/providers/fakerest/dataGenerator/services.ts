import type { Service } from "../../../types";

const CATALOGUE: Omit<Service, "id" | "created_at">[] = [
  {
    name: "Entretien annuel standard",
    type: "maintenance",
    periodicity_months: 12,
    price: 89,
    description:
      "Vidange, filtre à air, bougie, réglage carburateur, affûtage lame",
    active: true,
  },
  {
    name: "Révision complète",
    type: "maintenance",
    periodicity_months: 24,
    price: 189,
    description:
      "Entretien standard + courroies, câbles, roues motrices, nettoyage complet",
    active: true,
  },
  {
    name: "Contrat maintenance premium",
    type: "maintenance",
    periodicity_months: 12,
    price: 249,
    description:
      "2 visites/an, pièces de rechange incluses, prêt matériel pendant l'entretien",
    active: true,
  },
  {
    name: "Hivernage",
    type: "maintenance",
    periodicity_months: 12,
    price: 59,
    description:
      "Vidange carburant, protection moteur, nettoyage avant stockage",
    active: true,
  },
  {
    name: "Remise en service printemps",
    type: "maintenance",
    periodicity_months: 12,
    price: 69,
    description: "Contrôle général, plein carburant, test fonctionnement",
    active: true,
  },
  {
    name: "Réparation hors contrat",
    type: "repair",
    periodicity_months: 0,
    price: 75,
    description: "Taux horaire main d'œuvre, hors pièces",
    active: true,
  },
];

export const generateServices = (): Service[] =>
  CATALOGUE.map((s, id) => ({
    id,
    ...s,
    created_at: "2024-01-15",
  }));
