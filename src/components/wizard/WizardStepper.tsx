import { useProposal } from '@/contexts/ProposalContext';
import { WIZARD_STEPS, WizardStep } from '@/types/proposal';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WizardStepperProps {
  completedSteps: WizardStep[];
}

export function WizardStepper({ completedSteps }: WizardStepperProps) {
  const { state, setStep } = useProposal();
  const { currentStep } = state;

  const currentIndex = WIZARD_STEPS.findIndex(s => s.key === currentStep);

  return (
    <div className="w-full overflow-x-auto pb-2">
      <div className="flex items-center justify-between min-w-[600px] px-4">
        {WIZARD_STEPS.map((step, index) => {
          const isCompleted = completedSteps.includes(step.key);
          const isCurrent = step.key === currentStep;
          const isPast = index < currentIndex;

          return (
            <div key={step.key} className="flex items-center">
              <button
                onClick={() => setStep(step.key)}
                className={cn(
                  "flex flex-col items-center gap-1.5 transition-all",
                  (isCompleted || isPast) && "cursor-pointer",
                  !isCompleted && !isCurrent && !isPast && "cursor-not-allowed opacity-50"
                )}
                disabled={!isCompleted && !isCurrent && !isPast}
              >
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-all",
                    isCurrent && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                    isCompleted && "bg-success text-success-foreground",
                    !isCurrent && !isCompleted && "bg-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : step.number}
                </div>
                <span
                  className={cn(
                    "text-xs font-medium whitespace-nowrap",
                    isCurrent && "text-primary",
                    isCompleted && "text-success",
                    !isCurrent && !isCompleted && "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </button>
              
              {index < WIZARD_STEPS.length - 1 && (
                <div
                  className={cn(
                    "mx-2 h-0.5 w-8 md:w-12 lg:w-16 transition-colors",
                    index < currentIndex ? "bg-success" : "bg-border"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
