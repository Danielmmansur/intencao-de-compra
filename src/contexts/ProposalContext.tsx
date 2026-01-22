import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import type { 
  ProposalData, 
  Client, 
  Intermediary, 
  Property, 
  ApprovalLetter, 
  SimulationParams,
  Campaign,
  WizardStep
} from '@/types/proposal';

// Generate unique ID
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

const defaultSimulationParams: SimulationParams = {
  entry_term_months: 60,
  simulation_start_date: new Date().toISOString().split('T')[0],
  construction_months: 20,
  construction_rate: 0.009,
  entry_bands: [
    { id: generateId(), parcels: 10, percentage: 40 },
    { id: generateId(), parcels: 10, percentage: 25 },
    { id: generateId(), parcels: 20, percentage: 20 },
    { id: generateId(), parcels: 20, percentage: 15 },
  ],
  construction_phases: [
    { id: generateId(), name: 'Fundação', percentage: 15, duration_months: 3 },
    { id: generateId(), name: 'Estrutura', percentage: 40, duration_months: 6 },
    { id: generateId(), name: 'Acabamento', percentage: 75, duration_months: 8 },
    { id: generateId(), name: 'Conclusão', percentage: 100, duration_months: 3 },
  ],
  apply_annual_adjustment: false,
};

const defaultApprovalLetter: ApprovalLetter = {
  approved_value: 0,
  subsidy: 0,
  fgts: 0,
  entry_value: 0,
  financed_value: 0,
  first_installment: 0,
  bank: 'Caixa',
  amortization_system: 'SAC',
};

const defaultProperty: Property = {
  sale_value: 0,
};

const defaultIntermediary: Intermediary = {};

const initialProposalData: ProposalData = {
  status: 'rascunho',
  clients: [],
  intermediary: defaultIntermediary,
  property: defaultProperty,
  approval_letter: defaultApprovalLetter,
  simulation_params: defaultSimulationParams,
  campaigns: [],
};

interface ProposalState {
  proposal: ProposalData;
  currentStep: WizardStep;
  isPresentationMode: boolean;
  isLoading: boolean;
  error: string | null;
}

type ProposalAction =
  | { type: 'SET_PROPOSAL'; payload: ProposalData }
  | { type: 'SET_STEP'; payload: WizardStep }
  | { type: 'SET_PRESENTATION_MODE'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'UPDATE_CLIENTS'; payload: Client[] }
  | { type: 'ADD_CLIENT'; payload: Client }
  | { type: 'UPDATE_CLIENT'; payload: { index: number; client: Client } }
  | { type: 'REMOVE_CLIENT'; payload: number }
  | { type: 'UPDATE_INTERMEDIARY'; payload: Intermediary }
  | { type: 'UPDATE_PROPERTY'; payload: Property }
  | { type: 'UPDATE_APPROVAL_LETTER'; payload: ApprovalLetter }
  | { type: 'UPDATE_SIMULATION_PARAMS'; payload: SimulationParams }
  | { type: 'UPDATE_CAMPAIGNS'; payload: Campaign[] }
  | { type: 'ADD_CAMPAIGN'; payload: Campaign }
  | { type: 'UPDATE_CAMPAIGN'; payload: { index: number; campaign: Campaign } }
  | { type: 'REMOVE_CAMPAIGN'; payload: number }
  | { type: 'RESET_PROPOSAL' };

function proposalReducer(state: ProposalState, action: ProposalAction): ProposalState {
  switch (action.type) {
    case 'SET_PROPOSAL':
      return { ...state, proposal: action.payload };
    case 'SET_STEP':
      return { ...state, currentStep: action.payload };
    case 'SET_PRESENTATION_MODE':
      return { ...state, isPresentationMode: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'UPDATE_CLIENTS':
      return { ...state, proposal: { ...state.proposal, clients: action.payload } };
    case 'ADD_CLIENT':
      return { 
        ...state, 
        proposal: { 
          ...state.proposal, 
          clients: [...state.proposal.clients, action.payload] 
        } 
      };
    case 'UPDATE_CLIENT':
      return {
        ...state,
        proposal: {
          ...state.proposal,
          clients: state.proposal.clients.map((c, i) => 
            i === action.payload.index ? action.payload.client : c
          ),
        },
      };
    case 'REMOVE_CLIENT':
      return {
        ...state,
        proposal: {
          ...state.proposal,
          clients: state.proposal.clients.filter((_, i) => i !== action.payload),
        },
      };
    case 'UPDATE_INTERMEDIARY':
      return { ...state, proposal: { ...state.proposal, intermediary: action.payload } };
    case 'UPDATE_PROPERTY':
      return { ...state, proposal: { ...state.proposal, property: action.payload } };
    case 'UPDATE_APPROVAL_LETTER':
      return { ...state, proposal: { ...state.proposal, approval_letter: action.payload } };
    case 'UPDATE_SIMULATION_PARAMS':
      return { ...state, proposal: { ...state.proposal, simulation_params: action.payload } };
    case 'UPDATE_CAMPAIGNS':
      return { ...state, proposal: { ...state.proposal, campaigns: action.payload } };
    case 'ADD_CAMPAIGN':
      return {
        ...state,
        proposal: {
          ...state.proposal,
          campaigns: [...state.proposal.campaigns, action.payload],
        },
      };
    case 'UPDATE_CAMPAIGN':
      return {
        ...state,
        proposal: {
          ...state.proposal,
          campaigns: state.proposal.campaigns.map((c, i) =>
            i === action.payload.index ? action.payload.campaign : c
          ),
        },
      };
    case 'REMOVE_CAMPAIGN':
      return {
        ...state,
        proposal: {
          ...state.proposal,
          campaigns: state.proposal.campaigns.filter((_, i) => i !== action.payload),
        },
      };
    case 'RESET_PROPOSAL':
      return {
        ...state,
        proposal: initialProposalData,
        currentStep: 'clients',
      };
    default:
      return state;
  }
}

interface ProposalContextValue {
  state: ProposalState;
  dispatch: React.Dispatch<ProposalAction>;
  // Convenience methods
  setStep: (step: WizardStep) => void;
  nextStep: () => void;
  prevStep: () => void;
  togglePresentationMode: () => void;
}

const ProposalContext = createContext<ProposalContextValue | undefined>(undefined);

const stepOrder: WizardStep[] = [
  'clients',
  'intermediaries',
  'property',
  'approval',
  'simulation',
  'calculations',
  'campaigns',
  'summary',
];

export function ProposalProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(proposalReducer, {
    proposal: initialProposalData,
    currentStep: 'clients',
    isPresentationMode: false,
    isLoading: false,
    error: null,
  });

  const setStep = (step: WizardStep) => {
    dispatch({ type: 'SET_STEP', payload: step });
  };

  const nextStep = () => {
    const currentIndex = stepOrder.indexOf(state.currentStep);
    if (currentIndex < stepOrder.length - 1) {
      dispatch({ type: 'SET_STEP', payload: stepOrder[currentIndex + 1] });
    }
  };

  const prevStep = () => {
    const currentIndex = stepOrder.indexOf(state.currentStep);
    if (currentIndex > 0) {
      dispatch({ type: 'SET_STEP', payload: stepOrder[currentIndex - 1] });
    }
  };

  const togglePresentationMode = () => {
    dispatch({ type: 'SET_PRESENTATION_MODE', payload: !state.isPresentationMode });
  };

  return (
    <ProposalContext.Provider 
      value={{ state, dispatch, setStep, nextStep, prevStep, togglePresentationMode }}
    >
      {children}
    </ProposalContext.Provider>
  );
}

export function useProposal() {
  const context = useContext(ProposalContext);
  if (!context) {
    throw new Error('useProposal must be used within a ProposalProvider');
  }
  return context;
}
