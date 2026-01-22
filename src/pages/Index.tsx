import { ProposalWizard } from '@/components/wizard/ProposalWizard';
import { Building2, FileText } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-primary text-primary-foreground">
        <div className="container flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-foreground/10">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">Simulador MCMV</h1>
              <p className="text-xs text-primary-foreground/70">Intenção de Compra</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4" />
            <span>Nova Proposta</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <ProposalWizard />
      </main>
    </div>
  );
};

export default Index;
