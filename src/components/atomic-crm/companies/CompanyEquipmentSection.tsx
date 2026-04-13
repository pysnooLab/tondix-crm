import { Plus } from "lucide-react";
import { useGetList, useGetMany, useShowContext } from "ra-core";
import { Link } from "react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Company, Deal, DealProduct, Product } from "../types";

export const CompanyEquipmentSection = () => {
  const { record } = useShowContext<Company>();

  const { data: wonDeals } = useGetList<Deal>("deals", {
    pagination: { page: 1, perPage: 100 },
    sort: { field: "name", order: "ASC" },
    filter: { company_id: record?.id, stage: "won" },
  });

  const dealIds = (wonDeals ?? []).map((d) => d.id);

  const { data: dealProducts } = useGetList<DealProduct>(
    "deal_products",
    {
      pagination: { page: 1, perPage: 200 },
      filter: { "deal_id@in": `(${dealIds.join(",")})` },
    },
    { enabled: dealIds.length > 0 },
  );

  const productIds = [
    ...new Set((dealProducts ?? []).map((dp) => dp.product_id)),
  ];

  const { data: products } = useGetMany<Product>(
    "products",
    { ids: productIds },
    { enabled: productIds.length > 0 },
  );

  if (!record) return null;

  if (!dealProducts?.length) {
    return (
      <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-lg p-4 mt-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="font-semibold">🌿 Équipements achetés</span>
          <Badge variant="secondary">0</Badge>
        </div>
        <p className="text-sm text-gray-500">Aucun équipement acheté</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-3 cursor-pointer"
          asChild
        >
          <Link to="/deals/create">
            <Plus className="h-4 w-4 mr-1" />
            Créer un deal
          </Link>
        </Button>
      </div>
    );
  }

  const productsById = new Map((products ?? []).map((p) => [p.id, p]));

  // Group deal products by product, summing quantities
  const grouped = new Map<
    string,
    { product: Product | undefined; totalQty: number; dealNames: string[] }
  >();

  const dealsById = new Map((wonDeals ?? []).map((d) => [d.id, d]));

  for (const dp of dealProducts) {
    const key = String(dp.product_id);
    const existing = grouped.get(key);
    const dealName = dealsById.get(dp.deal_id)?.name ?? "";
    if (existing) {
      existing.totalQty += dp.quantity;
      if (dealName && !existing.dealNames.includes(dealName)) {
        existing.dealNames.push(dealName);
      }
    } else {
      grouped.set(key, {
        product: productsById.get(dp.product_id),
        totalQty: dp.quantity,
        dealNames: dealName ? [dealName] : [],
      });
    }
  }

  return (
    <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-lg p-4 mt-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="font-semibold">🌿 Équipements achetés</span>
        <Badge variant="secondary">{grouped.size}</Badge>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-muted-foreground">
            <th className="pb-2 font-medium">Produit</th>
            <th className="pb-2 font-medium">Quantit&eacute;</th>
            <th className="pb-2 font-medium">Affaire</th>
          </tr>
        </thead>
        <tbody>
          {[...grouped.values()].map((row, i) => (
            <tr key={i} className="border-t border-[#bbf7d0]">
              <td className="py-1.5">
                {row.product?.name ?? "Produit inconnu"}
              </td>
              <td className="py-1.5">{row.totalQty}</td>
              <td className="py-1.5">
                {row.dealNames.map((name, j) => {
                  const deal = (wonDeals ?? []).find((d) => d.name === name);
                  return (
                    <span key={j}>
                      {j > 0 && ", "}
                      {deal ? (
                        <Link
                          to={`/deals/${deal.id}/show`}
                          className="text-primary hover:underline"
                        >
                          {name}
                        </Link>
                      ) : (
                        name
                      )}
                    </span>
                  );
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Button
        variant="outline"
        size="sm"
        className="mt-3 cursor-pointer"
        asChild
      >
        <Link to="/deals/create">
          <Plus className="h-4 w-4 mr-1" />
          Créer un deal
        </Link>
      </Button>
    </div>
  );
};
