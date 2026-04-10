import { useRecordContext } from "ra-core";
import { CreateButton } from "@/components/admin/create-button";
import { DataTable } from "@/components/admin/data-table";
import { DeleteButton } from "@/components/admin/delete-button";
import { EditButton } from "@/components/admin/edit-button";
import { List } from "@/components/admin/list";
import { SearchInput } from "@/components/admin/search-input";
import { ToggleFilterButton } from "@/components/admin/toggle-filter-button";
import { Badge } from "@/components/ui/badge";
import { TopToolbar } from "../../layout/TopToolbar";
import type { Product } from "../../types";

const filters = [<SearchInput source="q" alwaysOn key="search" />];

const ProductListActions = () => (
  <TopToolbar>
    <CreateButton label="Ajouter une tondeuse" />
  </TopToolbar>
);

const ActiveField = (_props: { label?: string | boolean }) => {
  const record = useRecordContext<Product>();
  if (!record) return null;
  return (
    <Badge variant={record.active ? "default" : "outline"}>
      {record.active ? "Actif" : "Inactif"}
    </Badge>
  );
};

export const ProductList = () => (
  <List
    filters={filters}
    actions={<ProductListActions />}
    sort={{ field: "name", order: "ASC" }}
  >
    <div>
      <div className="flex gap-2 p-4">
        <ToggleFilterButton label="Actives" value={{ "active@eq": true }} />
        <ToggleFilterButton label="Inactives" value={{ "active@eq": false }} />
      </div>
      <DataTable>
        <DataTable.Col source="name" />
        <DataTable.NumberCol
          source="price"
          label="Prix (€)"
          options={{ style: "currency", currency: "EUR" }}
        />
        <DataTable.Col label="Actif">
          <ActiveField />
        </DataTable.Col>
        <DataTable.Col label={false}>
          <EditButton />
          <DeleteButton mutationMode="pessimistic" />
        </DataTable.Col>
      </DataTable>
    </div>
  </List>
);
