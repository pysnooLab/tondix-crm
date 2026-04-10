import { useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Form,
  useDataProvider,
  useGetIdentity,
  useListContext,
  useRedirect,
  type GetListResult,
} from "ra-core";
import { Create } from "@/components/admin/create";
import { SaveButton } from "@/components/admin/form";
import { FormToolbar } from "@/components/admin/simple-form";
import { Dialog, DialogContent } from "@/components/ui/dialog";

import type { Deal, DealProductLine, DealServiceLine } from "../types";
import { DealInputs } from "./DealInputs";
import { syncDealProducts, syncDealServices } from "./syncDealLines";

export const DealCreate = ({ open }: { open: boolean }) => {
  const redirect = useRedirect();
  const dataProvider = useDataProvider();
  const { data: allDeals } = useListContext<Deal>();
  const productLinesRef = useRef<DealProductLine[]>([]);
  const serviceLinesRef = useRef<DealServiceLine[]>([]);

  const handleClose = () => {
    redirect("/deals");
  };

  const queryClient = useQueryClient();

  const transform = (
    data: Partial<Deal> & {
      product_lines?: DealProductLine[];
      service_lines?: DealServiceLine[];
    },
  ) => {
    productLinesRef.current = data.product_lines ?? [];
    serviceLinesRef.current = data.service_lines ?? [];
    const {
      product_lines: _product_lines,
      service_lines: _service_lines,
      ...rest
    } = data;
    return rest;
  };

  const onSuccess = async (deal: Deal) => {
    await Promise.all([
      syncDealProducts(dataProvider, deal.id, productLinesRef.current),
      syncDealServices(dataProvider, deal.id, serviceLinesRef.current),
    ]);
    if (!allDeals) {
      redirect("/deals");
      return;
    }
    // increase the index of all deals in the same stage as the new deal
    // first, get the list of deals in the same stage
    const deals = allDeals.filter(
      (d: Deal) => d.stage === deal.stage && d.id !== deal.id,
    );
    // update the actual deals in the database
    await Promise.all(
      deals.map(async (oldDeal) =>
        dataProvider.update("deals", {
          id: oldDeal.id,
          data: { index: oldDeal.index + 1 },
          previousData: oldDeal,
        }),
      ),
    );
    // refresh the list of deals in the cache as we used dataProvider.update(),
    // which does not update the cache
    const dealsById = deals.reduce(
      (acc, d) => ({
        ...acc,
        [d.id]: { ...d, index: d.index + 1 },
      }),
      {} as { [key: string]: Deal },
    );
    const now = Date.now();
    queryClient.setQueriesData<GetListResult | undefined>(
      { queryKey: ["deals", "getList"] },
      (res) => {
        if (!res) return res;
        return {
          ...res,
          data: res.data.map((d: Deal) => dealsById[d.id] || d),
        };
      },
      { updatedAt: now },
    );
    redirect("/deals");
  };

  const { identity } = useGetIdentity();

  return (
    <Dialog open={open} onOpenChange={() => handleClose()}>
      <DialogContent className="lg:max-w-4xl overflow-y-auto max-h-9/10 top-1/20 translate-y-0">
        <Create
          resource="deals"
          transform={transform}
          mutationOptions={{ onSuccess }}
        >
          <Form
            defaultValues={{
              sales_id: identity?.id,
              contact_ids: [],
              index: 0,
            }}
          >
            <DealInputs />
            <FormToolbar>
              <SaveButton />
            </FormToolbar>
          </Form>
        </Create>
      </DialogContent>
    </Dialog>
  );
};
