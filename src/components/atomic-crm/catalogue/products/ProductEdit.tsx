import { EditBase, Form, useRecordContext } from "ra-core";
import { Card, CardContent } from "@/components/ui/card";
import { FormToolbar } from "../../layout/FormToolbar";
import { ProductInputs } from "./ProductInputs";
import type { Product } from "../../types";

const ProductEditTitle = () => {
  const record = useRecordContext<Product>();
  if (!record) return null;
  return <h2 className="text-lg font-semibold mb-4">{record.name}</h2>;
};

export const ProductEdit = () => (
  <div className="max-w-lg w-full mx-auto mt-8">
    <Card>
      <CardContent>
        <EditBase mutationMode="pessimistic">
          <Form>
            <ProductEditTitle />
            <ProductInputs />
            <FormToolbar />
          </Form>
        </EditBase>
      </CardContent>
    </Card>
  </div>
);
