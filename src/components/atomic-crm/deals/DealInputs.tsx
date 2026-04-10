import { useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { required, useGetList, useRecordContext, useTranslate } from "ra-core";
import { useFieldArray, useFormContext } from "react-hook-form";
import { AutocompleteArrayInput } from "@/components/admin/autocomplete-array-input";
import { ReferenceArrayInput } from "@/components/admin/reference-array-input";
import { ReferenceInput } from "@/components/admin/reference-input";
import { TextInput } from "@/components/admin/text-input";
import { NumberInput } from "@/components/admin/number-input";
import { DateInput } from "@/components/admin/date-input";
import { SelectInput } from "@/components/admin/select-input";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

import { contactOptionText } from "../misc/ContactOption";
import { useConfigurationContext } from "../root/ConfigurationContext";
import { AutocompleteCompanyInput } from "../companies/AutocompleteCompanyInput.tsx";
import type { Deal, Product, Service } from "../types";

export const DealInputs = () => {
  const isMobile = useIsMobile();
  return (
    <div className="flex flex-col gap-8">
      <DealInfoInputs />

      <div className={`flex gap-6 ${isMobile ? "flex-col" : "flex-row"}`}>
        <DealLinkedToInputs />
        <Separator orientation={isMobile ? "horizontal" : "vertical"} />
        <DealMiscInputs />
      </div>

      <DealProductLinesInput />
      <DealServiceLinesInput />
    </div>
  );
};

const DealInfoInputs = () => {
  return (
    <div className="flex flex-col gap-4 flex-1">
      <TextInput source="name" validate={required()} helperText={false} />
      <TextInput source="description" multiline rows={3} helperText={false} />
    </div>
  );
};

const DealLinkedToInputs = () => {
  const translate = useTranslate();
  return (
    <div className="flex flex-col gap-4 flex-1">
      <h3 className="text-base font-medium">
        {translate("resources.deals.inputs.linked_to")}
      </h3>
      <ReferenceInput source="company_id" reference="companies">
        <AutocompleteCompanyInput
          label="resources.deals.fields.company_id"
          validate={required()}
          modal
        />
      </ReferenceInput>

      <ReferenceArrayInput source="contact_ids" reference="contacts_summary">
        <AutocompleteArrayInput
          label="resources.deals.fields.contact_ids"
          optionText={contactOptionText}
          helperText={false}
        />
      </ReferenceArrayInput>
    </div>
  );
};

const DealMiscInputs = () => {
  const { dealStages, dealCategories } = useConfigurationContext();
  const translate = useTranslate();
  return (
    <div className="flex flex-col gap-4 flex-1">
      <h3 className="text-base font-medium">
        {translate("resources.deals.field_categories.misc")}
      </h3>

      <SelectInput
        source="category"
        choices={dealCategories}
        optionText="label"
        optionValue="value"
        helperText={false}
      />
      <NumberInput
        source="amount"
        defaultValue={0}
        helperText={false}
        validate={required()}
      />
      <DateInput
        validate={required()}
        source="expected_closing_date"
        helperText={false}
        defaultValue={new Date().toISOString().split("T")[0]}
      />
      <SelectInput
        source="stage"
        choices={dealStages}
        optionText="label"
        optionValue="value"
        defaultValue="opportunity"
        helperText={false}
        validate={required()}
      />
    </div>
  );
};

const DealProductLinesInput = () => {
  const record = useRecordContext<Deal>();
  const { setValue } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    name: "product_lines",
  });

  const { data: products } = useGetList<Product>("products", {
    filter: { "active@eq": true },
    pagination: { page: 1, perPage: 1000 },
    sort: { field: "name", order: "ASC" },
  });

  const { data: existingProducts } = useGetList(
    "deal_products",
    {
      filter: { "deal_id@eq": record?.id },
      pagination: { page: 1, perPage: 1000 },
      sort: { field: "id", order: "ASC" },
    },
    { enabled: !!record?.id },
  );

  useEffect(() => {
    if (existingProducts) {
      setValue(
        "product_lines",
        existingProducts.map(({ product_id, quantity, unit_price }) => ({
          product_id,
          quantity,
          unit_price,
        })),
      );
    }
  }, [existingProducts]); // eslint-disable-line react-hooks/exhaustive-deps

  const productChoices =
    products?.map((p) => ({ id: p.id, name: p.name })) ?? [];

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-medium">Tondeuses</h3>
        <a
          href="/products"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-green-700 hover:underline"
        >
          Gérer le catalogue &rarr;
        </a>
      </div>

      {fields.map((field, index) => (
        <div key={field.id} className="flex items-end gap-3 mb-3">
          <div className="flex-1">
            <SelectInput
              source={`product_lines.${index}.product_id`}
              choices={productChoices}
              label="Produit"
              helperText={false}
              validate={required()}
              onChange={(...args: unknown[]) => {
                const value = args[0] as string;
                const product = products?.find((p) => String(p.id) === value);
                if (product) {
                  setValue(`product_lines.${index}.unit_price`, product.price);
                }
              }}
            />
          </div>
          <div className="w-24">
            <NumberInput
              source={`product_lines.${index}.quantity`}
              label="Qté"
              min={1}
              defaultValue={1}
              helperText={false}
              validate={required()}
            />
          </div>
          <div className="w-32">
            <NumberInput
              source={`product_lines.${index}.unit_price`}
              label="Prix unit."
              min={0}
              step={0.01}
              helperText={false}
              validate={required()}
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => remove(index)}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => append({ product_id: "", quantity: 1, unit_price: 0 })}
      >
        <Plus className="h-4 w-4 mr-1" />
        Ajouter une tondeuse
      </Button>
    </div>
  );
};

const DealServiceLinesInput = () => {
  const record = useRecordContext<Deal>();
  const { setValue } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    name: "service_lines",
  });

  const { data: services } = useGetList<Service>("services", {
    filter: { "active@eq": true },
    pagination: { page: 1, perPage: 1000 },
    sort: { field: "name", order: "ASC" },
  });

  const { data: existingServices } = useGetList(
    "deal_services",
    {
      filter: { "deal_id@eq": record?.id },
      pagination: { page: 1, perPage: 1000 },
      sort: { field: "id", order: "ASC" },
    },
    { enabled: !!record?.id },
  );

  useEffect(() => {
    if (existingServices) {
      setValue(
        "service_lines",
        existingServices.map(({ service_id, quantity, unit_price }) => ({
          service_id,
          quantity,
          unit_price,
        })),
      );
    }
  }, [existingServices]); // eslint-disable-line react-hooks/exhaustive-deps

  const serviceChoices =
    services?.map((s) => ({ id: s.id, name: s.name })) ?? [];

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-medium">Entretiens</h3>
        <a
          href="/services"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-yellow-700 hover:underline"
        >
          Gérer le catalogue &rarr;
        </a>
      </div>

      {fields.map((field, index) => (
        <div key={field.id} className="flex items-end gap-3 mb-3">
          <div className="flex-1">
            <SelectInput
              source={`service_lines.${index}.service_id`}
              choices={serviceChoices}
              label="Service"
              helperText={false}
              validate={required()}
              onChange={(...args: unknown[]) => {
                const value = args[0] as string;
                const service = services?.find((s) => String(s.id) === value);
                if (service) {
                  setValue(`service_lines.${index}.unit_price`, service.price);
                }
              }}
            />
          </div>
          <div className="w-24">
            <NumberInput
              source={`service_lines.${index}.quantity`}
              label="Qté"
              min={1}
              defaultValue={1}
              helperText={false}
              validate={required()}
            />
          </div>
          <div className="w-32">
            <NumberInput
              source={`service_lines.${index}.unit_price`}
              label="Prix unit."
              min={0}
              step={0.01}
              helperText={false}
              validate={required()}
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => remove(index)}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => append({ service_id: "", quantity: 1, unit_price: 0 })}
      >
        <Plus className="h-4 w-4 mr-1" />
        Ajouter un entretien
      </Button>

      <div className="mt-3 bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-700">
        Quand ce deal passe en Gagné, un contrat sera automatiquement créé
      </div>
    </div>
  );
};
