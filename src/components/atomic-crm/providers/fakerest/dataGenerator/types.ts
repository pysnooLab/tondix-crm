import type {
  Company,
  Contact,
  ContactNote,
  Deal,
  DealNote,
  DealProduct,
  DealService,
  MaintenanceContract,
  Product,
  Sale,
  Service,
  Tag,
  Task,
} from "../../../types";
import type { ConfigurationContextValue } from "../../../root/ConfigurationContext";

export interface Db {
  companies: Company[];
  contacts: Contact[];
  contact_notes: ContactNote[];
  deals: Deal[];
  deal_notes: DealNote[];
  sales: Sale[];
  tags: Tag[];
  tasks: Task[];
  products: Product[];
  services: Service[];
  deal_products: DealProduct[];
  deal_services: DealService[];
  maintenance_contracts: MaintenanceContract[];
  configuration: Array<{ id: number; config: ConfigurationContextValue }>;
}
