import { CreateBase, Form } from "ra-core";
import { Card, CardContent } from "@/components/ui/card";
import { FormToolbar } from "../../layout/FormToolbar";
import { ServiceInputs } from "./ServiceInputs";

export const ServiceCreate = () => (
  <CreateBase redirect="edit">
    <div className="mt-2 flex lg:mr-72">
      <div className="flex-1">
        <Form defaultValues={{ active: true }}>
          <Card>
            <CardContent>
              <ServiceInputs />
              <FormToolbar />
            </CardContent>
          </Card>
        </Form>
      </div>
    </div>
  </CreateBase>
);
