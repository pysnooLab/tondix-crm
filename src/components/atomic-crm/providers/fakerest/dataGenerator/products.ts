import type { Product } from "../../../types";

const CATALOGUE: Omit<Product, "id" | "created_at">[] = [
  {
    name: "Tondeuse autoportée T500",
    description:
      "Tondeuse autoportée coupe 102 cm, moteur Briggs & Stratton 656 cc",
    price: 2490,
    active: true,
  },
  {
    name: "Tondeuse robot R800",
    description:
      "Robot tondeuse connecté, surface jusqu'à 800 m², recharge automatique",
    price: 1290,
    active: true,
  },
  {
    name: "Tondeuse thermique TH46",
    description: "Tondeuse thermique tractée, coupe 46 cm, bac 55 L",
    price: 399,
    active: true,
  },
  {
    name: "Tronçonneuse 45 cm",
    description: "Tronçonneuse thermique guide 45 cm, puissance 2,2 kW",
    price: 279,
    active: true,
  },
  {
    name: "Débroussailleuse DF35",
    description: "Débroussailleuse thermique 35 cc, tête fil + lame 3 dents",
    price: 199,
    active: true,
  },
  {
    name: "Souffleur thermique SB570",
    description: "Souffleur-aspirateur thermique 570 m³/h, sac 45 L",
    price: 149,
    active: true,
  },
  {
    name: "Taille-haie 60 cm",
    description: "Taille-haie thermique lame 60 cm, double tranchant",
    price: 169,
    active: true,
  },
  {
    name: "Mini-tracteur MT120",
    description:
      "Mini-tracteur professionnel 12 CV, coupe 120 cm, relevage hydraulique",
    price: 4890,
    active: true,
  },
  {
    name: "Scarificateur SE32",
    description: "Scarificateur électrique 1400 W, largeur 32 cm, bac 40 L",
    price: 129,
    active: false,
  },
  {
    name: "Motoculteur MC55",
    description:
      "Motoculteur thermique 6,5 CV, fraises avant 55 cm, profondeur 25 cm",
    price: 699,
    active: true,
  },
];

export const generateProducts = (): Product[] =>
  CATALOGUE.map((p, id) => ({
    id,
    ...p,
    created_at: "2024-01-15",
  }));
