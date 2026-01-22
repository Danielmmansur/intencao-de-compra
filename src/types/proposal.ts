export interface Client {
  id?: string;
  full_name: string;
  cpf: string;
  birth_date?: string;
  phone?: string;
  email?: string;
  address?: string;
  monthly_income: number;
  family_composition?: string;
  notes?: string;
  isMainProponent?: boolean;
}

export interface Intermediary {
  imobiliaria_id?: string;
  imobiliaria_name?: string;
  corretor_id?: string;
  corretor_name?: string;
  coordinator_name?: string;
  manager_name?: string;
}

export interface Property {
  empreendimento_id?: string;
  empreendimento_name?: string;
  address?: string;
  block?: string;
  unit?: string;
  sale_value: number;
  appraisal_value?: number;
}

export interface ApprovalLetter {
  approved_value: number;
  subsidy: number;
  fgts: number;
  entry_value: number;
  financed_value: number;
  first_installment: number;
  bank: string;
  amortization_system: 'SAC' | 'PRICE';
}

export interface EntryBand {
  id: string;
  parcels: number;
  percentage: number;
}

export interface ConstructionPhase {
  id: string;
  name: string;
  percentage: number;
  duration_months: number;
}

export interface SimulationParams {
  entry_term_months: number;
  simulation_start_date: string;
  construction_months: number;
  habite_se_date?: string;
  construction_rate: number;
  entry_bands: EntryBand[];
  construction_phases: ConstructionPhase[];
  apply_annual_adjustment: boolean;
}

export interface Campaign {
  id?: string;
  name: string;
  discount_type?: 'fixed' | 'percentage';
  discount_value?: number;
  bonus_description?: string;
  bonus_value?: number;
  special_conditions?: string;
  status: 'pendente' | 'aprovada' | 'rejeitada';
}

export interface PaymentFlowRow {
  month: number;
  date: string;
  entry_payment: number;
  financing_installment: number;
  construction_fee: number;
  total: number;
  phase: string;
  phase_percentage: number;
  accumulated_released: number;
  notes?: string;
}

export interface IncomeCommitment {
  worst_phase: number;
  average: number;
  is_over_limit: boolean;
}

export interface ProposalData {
  id?: string;
  status: 'rascunho' | 'enviada' | 'aprovada' | 'cancelada';
  clients: Client[];
  intermediary: Intermediary;
  property: Property;
  approval_letter: ApprovalLetter;
  simulation_params: SimulationParams;
  campaigns: Campaign[];
  payment_flow?: PaymentFlowRow[];
  income_commitment?: IncomeCommitment;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export type WizardStep = 
  | 'clients'
  | 'intermediaries'
  | 'property'
  | 'approval'
  | 'simulation'
  | 'calculations'
  | 'campaigns'
  | 'summary';

export const WIZARD_STEPS: { key: WizardStep; label: string; number: number }[] = [
  { key: 'clients', label: 'Clientes', number: 1 },
  { key: 'intermediaries', label: 'Intermediadores', number: 2 },
  { key: 'property', label: 'Imóvel', number: 3 },
  { key: 'approval', label: 'Carta de Aprovação', number: 4 },
  { key: 'simulation', label: 'Parâmetros', number: 5 },
  { key: 'calculations', label: 'Cálculos', number: 6 },
  { key: 'campaigns', label: 'Campanhas', number: 7 },
  { key: 'summary', label: 'Resumo', number: 8 },
];
