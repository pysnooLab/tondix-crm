import { CreateBase, Form } from "ra-core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormToolbar } from "../../layout/FormToolbar";
import { ProductInputs } from "./ProductInputs";

export const ProductCreate = () => (
  <div className="max-w-lg w-full mx-auto mt-8">
    <Card>
      <CardHeader>
        <CardTitle>Ajouter une tondeuse</CardTitle>
      </CardHeader>
      <CardContent>
        <CreateBase resource="products">
          <Form defaultValues={{ active: true, price: 0 }}>
            <ProductInputs />
            <FormToolbar />
          </Form>
        </CreateBase>
      </CardContent>
    </Card>
  </div>
);
