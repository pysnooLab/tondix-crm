import { required, minValue } from "ra-core";
import { BooleanInput } from "@/components/admin/boolean-input";
import { NumberInput } from "@/components/admin/number-input";
import { TextInput } from "@/components/admin/text-input";

export const ProductInputs = () => (
  <div className="space-y-4 w-full">
    <TextInput source="name" validate={required()} helperText={false} />
    <TextInput source="description" multiline rows={3} helperText={false} />
    <NumberInput
      source="price"
      validate={[required(), minValue(0)]}
      helperText={false}
    />
    <BooleanInput source="active" defaultValue={true} helperText={false} />
  </div>
);
