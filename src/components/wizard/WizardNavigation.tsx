import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Save } from 'lucide-react';

interface WizardNavigationProps {
  onPrev?: () => void;
  onNext?: () => void;
  onSave?: () => void;
  canGoBack?: boolean;
  canGoNext?: boolean;
  isLastStep?: boolean;
  isLoading?: boolean;
}

export function WizardNavigation({
  onPrev,
  onNext,
  onSave,
  canGoBack = true,
  canGoNext = true,
  isLastStep = false,
  isLoading = false,
}: WizardNavigationProps) {
  return (
    <div className="flex items-center justify-between border-t bg-card px-6 py-4">
      <Button
        variant="outline"
        onClick={onPrev}
        disabled={!canGoBack || isLoading}
        className="gap-2"
      >
        <ChevronLeft className="h-4 w-4" />
        Voltar
      </Button>

      <div className="flex items-center gap-3">
        {onSave && (
          <Button
            variant="secondary"
            onClick={onSave}
            disabled={isLoading}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            Salvar Rascunho
          </Button>
        )}

        <Button
          onClick={onNext}
          disabled={!canGoNext || isLoading}
          className="gap-2"
        >
          {isLastStep ? 'Gerar Proposta' : 'Próximo'}
          {!isLastStep && <ChevronRight className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
