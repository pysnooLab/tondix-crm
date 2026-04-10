import { required, minValue } from "ra-core";
import { BooleanInput } from "@/components/admin/boolean-input";
import { NumberInput } from "@/components/admin/number-input";
import { TextInput } from "@/components/admin/text-input";

export const ServiceInputs = () => (
  <div className="space-y-4 w-full">
    <TextInput
      source="name"
      label="Nom"
      validate={required()}
      helperText={false}
    />
    <TextInput
      source="type"
      label="Type"
      helperText="ex: complet, intermédiaire"
    />
    <NumberInput
      source="periodicity_months"
      label="Périodicité (mois)"
      validate={[required(), minValue(1)]}
      min={1}
      step={1}
      helperText="Fréquence recommandée en mois (ex : 6 = tous les 6 mois)"
    />
    <NumberInput
      source="price"
      label="Prix (€)"
      validate={[required(), minValue(0)]}
      min={0}
      step={0.01}
      helperText={false}
    />
    <TextInput
      source="description"
      label="Description"
      multiline
      rows={3}
      helperText={false}
    />
    <BooleanInput
      source="active"
      label="Actif"
      defaultValue={true}
      helperText={false}
    />
  </div>
);
