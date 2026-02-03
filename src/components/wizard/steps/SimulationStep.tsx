import { useMemo } from 'react';
import { useProposal } from '@/contexts/ProposalContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CurrencyInput } from '@/components/ui/currency-input';
import { Calendar, TrendingUp, DollarSign, FileText, UserCheck } from 'lucide-react';
import { formatCurrency } from '@/lib/calculations';

export function SimulationStep() {
  const { state, dispatch } = useProposal();
  const { simulation_params, property, approval_letter } = state.proposal;

  // Valores das etapas anteriores
  const saleValue = property.sale_value || 0;
  const appraisalValue = property.appraisal_value || 0;
  const financedValue = approval_letter.financed_value || 0;
  const subsidy = approval_letter.subsidy || 0;
  const fgts = approval_letter.fgts || 0;

  // Cálculos em tempo real
  const calculations = useMemo(() => {
    const documentationCost = simulation_params.has_documentation 
      ? appraisalValue * 0.05 
      : 0;
    
    const entryValue = Math.max(0, saleValue - subsidy - fgts - simulation_params.discount);
    
    const proSoluto = entryValue + documentationCost;

    return {
      documentationCost,
      entryValue,
      proSoluto,
    };
  }, [saleValue, appraisalValue, subsidy, fgts, simulation_params.has_documentation, simulation_params.discount]);

  const updateParams = (updates: Partial<typeof simulation_params>) => {
    dispatch({
      type: 'UPDATE_SIMULATION_PARAMS',
      payload: { ...simulation_params, ...updates },
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Parâmetros da Simulação</h2>
        <p className="text-muted-foreground mt-1">
          Configure os valores de fechamento e prazos
        </p>
      </div>

      {/* Condição Financeira */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <DollarSign className="h-5 w-5 text-primary" />
            Condição Financeira
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Coluna 1 - Valores das etapas anteriores */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground text-sm">Valor de Venda</Label>
                <div className="p-3 bg-muted/50 rounded-lg font-mono text-lg">
                  {formatCurrency(saleValue)}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground text-sm">Valor de Avaliação</Label>
                <div className="p-3 bg-muted/50 rounded-lg font-mono text-lg">
                  {formatCurrency(appraisalValue)}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground text-sm">Financiamento</Label>
                <div className="p-3 bg-muted/50 rounded-lg font-mono text-lg">
                  {formatCurrency(financedValue)}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground text-sm">Subsídio</Label>
                <div className="p-3 bg-muted/50 rounded-lg font-mono text-lg">
                  {formatCurrency(subsidy)}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground text-sm">FGTS</Label>
                <div className="p-3 bg-muted/50 rounded-lg font-mono text-lg">
                  {formatCurrency(fgts)}
                </div>
              </div>
            </div>

            {/* Coluna 2 - Campos editáveis */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Documentação?
                </Label>
                <Select
                  value={simulation_params.has_documentation ? 'sim' : 'nao'}
                  onValueChange={(value) => updateParams({ has_documentation: value === 'sim' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sim">Sim</SelectItem>
                    <SelectItem value="nao">Não</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Desconto</Label>
                <CurrencyInput
                  value={simulation_params.discount}
                  onChange={(value) => updateParams({ discount: value })}
                  placeholder="0,00"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4" />
                  Possui Fiador?
                </Label>
                <Select
                  value={simulation_params.has_guarantor ? 'sim' : 'nao'}
                  onValueChange={(value) => updateParams({ has_guarantor: value === 'sim' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sim">Sim</SelectItem>
                    <SelectItem value="nao">Não</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Coluna 3 - Resultados calculados */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground text-sm">Entrada</Label>
                <div className="p-3 bg-muted/50 rounded-lg font-mono text-lg">
                  {formatCurrency(calculations.entryValue)}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground text-sm">Documentação (5%)</Label>
                <div className="p-3 bg-muted/50 rounded-lg font-mono text-lg">
                  {formatCurrency(calculations.documentationCost)}
                </div>
              </div>

              {/* Pró-Soluto - Destaque visual */}
              <div className="space-y-2 mt-4">
                <Label className="text-primary font-semibold text-base">Pró-Soluto (Valor Final)</Label>
                <div className="p-4 bg-primary text-primary-foreground rounded-xl font-mono text-2xl font-bold text-center shadow-lg">
                  {formatCurrency(calculations.proSoluto)}
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Entrada + Documentação
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Prazos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-primary" />
              Prazos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Data de Início da Simulação</Label>
              <Input
                type="date"
                value={simulation_params.simulation_start_date}
                onChange={(e) => updateParams({ simulation_start_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Prazo da Entrada (meses)</Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[simulation_params.entry_term_months]}
                  onValueChange={([val]) => updateParams({ entry_term_months: val })}
                  min={12}
                  max={60}
                  step={1}
                  className="flex-1"
                />
                <span className="w-12 text-center font-mono">
                  {simulation_params.entry_term_months}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Prazo Estimado da Obra (meses)</Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[simulation_params.construction_months]}
                  onValueChange={([val]) => updateParams({ construction_months: val })}
                  min={6}
                  max={48}
                  step={1}
                  className="flex-1"
                />
                <span className="w-12 text-center font-mono">
                  {simulation_params.construction_months}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Data Estimada do Habite-se (opcional)</Label>
              <Input
                type="date"
                value={simulation_params.habite_se_date || ''}
                onChange={(e) => updateParams({ habite_se_date: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
