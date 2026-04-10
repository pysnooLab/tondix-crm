import { useListContext, useRecordContext } from "ra-core";
import { CreateButton } from "@/components/admin/create-button";
import { DataTable } from "@/components/admin/data-table";
import { DeleteButton } from "@/components/admin/delete-button";
import { EditButton } from "@/components/admin/edit-button";
import { List } from "@/components/admin/list";
import { SearchInput } from "@/components/admin/search-input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TopToolbar } from "../../layout/TopToolbar";
import type { Service } from "../../types";

const filters = [<SearchInput source="q" alwaysOn key="search" />];

const ServiceListActions = () => (
  <TopToolbar>
    <CreateButton label="Ajouter un entretien" />
  </TopToolbar>
);

const ActiveField = (_props: { label?: string | boolean }) => {
  const record = useRecordContext<Service>();
  if (!record) return null;
  return record.active ? (
    <Badge variant="outline" className="border-green-400">
      Actif
    </Badge>
  ) : (
    <Badge variant="outline" className="border-gray-300">
      Inactif
    </Badge>
  );
};

const ActiveFilterTabs = () => {
  const { filterValues, setFilters } = useListContext();
  const current = filterValues["active@eq"];
  return (
    <Tabs
      value={
        current === true ? "active" : current === false ? "inactive" : "all"
      }
      onValueChange={(v) => {
        if (v === "active") setFilters({ ...filterValues, "active@eq": true });
        else if (v === "inactive")
          setFilters({ ...filterValues, "active@eq": false });
        else {
          const { "active@eq": _r, ...rest } = filterValues;
          setFilters(rest);
        }
      }}
    >
      <TabsList>
        <TabsTrigger value="all">Toutes</TabsTrigger>
        <TabsTrigger value="active">Actives</TabsTrigger>
        <TabsTrigger value="inactive">Inactives</TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export const ServiceList = () => (
  <List
    filters={filters}
    actions={<ServiceListActions />}
    sort={{ field: "name", order: "ASC" }}
  >
    <div className="flex flex-col gap-2">
      <ActiveFilterTabs />
      <DataTable>
        <DataTable.Col source="name" />
        <DataTable.Col source="type" />
        <DataTable.NumberCol source="periodicity_months" />
        <DataTable.NumberCol
          source="price"
          options={{ style: "currency", currency: "EUR" }}
        />
        <DataTable.Col source="active" label="Actif">
          <ActiveField />
        </DataTable.Col>
        <DataTable.Col label={false}>
          <div className="flex gap-2">
            <EditButton />
            <DeleteButton redirect={false} />
          </div>
        </DataTable.Col>
      </DataTable>
    </div>
  </List>
);
