import { CRM } from '@/components/atomic-crm/root/CRM';

const tondixDealStages = [
  { value: 'opportunity', label: 'Opportunité' },
  { value: 'proposal-sent', label: 'Devis envoyé' },
  { value: 'in-negociation', label: 'En négociation' },
  { value: 'won', label: 'Gagné' },
  { value: 'lost', label: 'Perdu' },
  { value: 'delayed', label: 'Différé' },
];

const tondixDealCategories = [
  { value: 'tondeuse', label: 'Vente tondeuse' },
  { value: 'entretien', label: 'Contrat entretien' },
  { value: 'mixte', label: 'Tondeuse + Entretien' },
];

const tondixCompanySectors = [
  { value: 'paysagiste', label: 'Paysagiste' },
  { value: 'golf', label: 'Golf / Terrain de sport' },
  { value: 'collectivite', label: 'Collectivité' },
  { value: 'agriculture', label: 'Agriculture' },
  { value: 'autre', label: 'Autre' },
];

const App = () => (
  <CRM
    title="Tondix CRM"
    dealStages={tondixDealStages}
    dealCategories={tondixDealCategories}
    companySectors={tondixCompanySectors}
    disableTelemetry
  />
);

export default App;
