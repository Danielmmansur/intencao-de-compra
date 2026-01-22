import { useState } from 'react';
import { useProposal, ProposalProvider } from '@/contexts/ProposalContext';
import { WizardStepper } from './WizardStepper';
import { WizardNavigation } from './WizardNavigation';
import { ClientsStep } from './steps/ClientsStep';
import { IntermediariesStep } from './steps/IntermediariesStep';
import { PropertyStep } from './steps/PropertyStep';
import { ApprovalStep } from './steps/ApprovalStep';
import { SimulationStep } from './steps/SimulationStep';
import { CalculationsStep } from './steps/CalculationsStep';
import { CampaignsStep } from './steps/CampaignsStep';
import { SummaryStep } from './steps/SummaryStep';
import type { WizardStep } from '@/types/proposal';

function WizardContent() {
  const { state, nextStep, prevStep } = useProposal();
  const { currentStep } = state;
  const [completedSteps, setCompletedSteps] = useState<WizardStep[]>([]);

  const handleNext = () => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }
    nextStep();
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'clients':
        return <ClientsStep />;
      case 'intermediaries':
        return <IntermediariesStep />;
      case 'property':
        return <PropertyStep />;
      case 'approval':
        return <ApprovalStep />;
      case 'simulation':
        return <SimulationStep />;
      case 'calculations':
        return <CalculationsStep />;
      case 'campaigns':
        return <CampaignsStep />;
      case 'summary':
        return <SummaryStep />;
      default:
        return <ClientsStep />;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="border-b bg-card px-6 py-4">
        <WizardStepper completedSteps={completedSteps} />
      </div>
      
      <div className="flex-1 overflow-auto p-6">
        {renderStep()}
      </div>
      
      <WizardNavigation
        onPrev={prevStep}
        onNext={handleNext}
        canGoBack={currentStep !== 'clients'}
        isLastStep={currentStep === 'summary'}
      />
    </div>
  );
}

export function ProposalWizard() {
  return (
    <ProposalProvider>
      <WizardContent />
    </ProposalProvider>
  );
}
