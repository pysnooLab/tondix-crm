import { EditBase, Form } from "ra-core";
import { Card, CardContent } from "@/components/ui/card";
import { DeleteButton } from "@/components/admin/delete-button";
import { SaveButton } from "@/components/admin/form";
import { CancelButton } from "@/components/admin/cancel-button";
import { ServiceInputs } from "./ServiceInputs";

export const ServiceEdit = () => (
  <EditBase actions={false} redirect="list">
    <div className="mt-2 flex lg:mr-72">
      <div className="flex-1">
        <Form>
          <Card>
            <CardContent>
              <ServiceInputs />
              <div
                role="toolbar"
                className="sticky flex pt-4 pb-4 md:pb-0 bottom-0 bg-linear-to-b from-transparent to-card to-10% flex-row justify-between gap-2"
              >
                <DeleteButton redirect="list" />
                <div className="flex gap-2">
                  <CancelButton />
                  <SaveButton />
                </div>
              </div>
            </CardContent>
          </Card>
        </Form>
      </div>
    </div>
  </EditBase>
);
