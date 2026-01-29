import { useMemo } from 'react';
import { useProposal } from '@/contexts/ProposalContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CurrencyInput } from '@/components/ui/currency-input';
import { Plus, Trash2, Settings, Calendar, Layers, TrendingUp, DollarSign, FileText, UserCheck } from 'lucide-react';
import type { EntryBand, ConstructionPhase } from '@/types/proposal';
import { formatCurrency } from '@/lib/calculations';

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

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
    
    const entryValue = saleValue - subsidy - fgts - simulation_params.discount;
    
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

  const updateEntryBand = (index: number, field: keyof EntryBand, value: any) => {
    const updated = simulation_params.entry_bands.map((band, i) =>
      i === index ? { ...band, [field]: value } : band
    );
    updateParams({ entry_bands: updated });
  };

  const addEntryBand = () => {
    if (simulation_params.entry_bands.length >= 6) return;
    updateParams({
      entry_bands: [
        ...simulation_params.entry_bands,
        { id: generateId(), parcels: 10, percentage: 10 },
      ],
    });
  };

  const removeEntryBand = (index: number) => {
    if (simulation_params.entry_bands.length <= 1) return;
    updateParams({
      entry_bands: simulation_params.entry_bands.filter((_, i) => i !== index),
    });
  };

  const updatePhase = (index: number, field: keyof ConstructionPhase, value: any) => {
    const updated = simulation_params.construction_phases.map((phase, i) =>
      i === index ? { ...phase, [field]: value } : phase
    );
    updateParams({ construction_phases: updated });
  };

  const totalPercentage = simulation_params.entry_bands.reduce(
    (sum, band) => sum + band.percentage,
    0
  );

  const totalParcels = simulation_params.entry_bands.reduce(
    (sum, band) => sum + band.parcels,
    0
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Parâmetros da Simulação</h2>
        <p className="text-muted-foreground mt-1">
          Configure os valores de fechamento, prazos e fases da obra
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

        {/* Taxa de Obra */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
              Taxa de Evolução de Obra
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Taxa de Juros Mensal (estimativa)</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  step="0.01"
                  value={(simulation_params.construction_rate * 100).toFixed(2)}
                  onChange={(e) =>
                    updateParams({ construction_rate: parseFloat(e.target.value) / 100 || 0 })
                  }
                  className="w-24 text-right font-mono"
                />
                <span className="text-muted-foreground">% a.m.</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Padrão: 0,90% a.m. (aproximadamente 11% a.a.)
              </p>
            </div>

            <div className="flex items-center space-x-2 pt-4 border-t">
              <Switch
                id="annual-adjustment"
                checked={simulation_params.apply_annual_adjustment}
                onCheckedChange={(checked) =>
                  updateParams({ apply_annual_adjustment: checked })
                }
              />
              <Label htmlFor="annual-adjustment" className="cursor-pointer">
                Aplicar reajuste anual na prestação
              </Label>
            </div>

            <div className="p-3 bg-warning/10 border border-warning/30 rounded-lg mt-4">
              <p className="text-xs text-warning">
                ⚠️ Valor estimativo - pode variar conforme medições do banco.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Faixas de Entrada */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Layers className="h-5 w-5 text-primary" />
              Distribuição da Entrada
            </CardTitle>
            <div className="text-right">
              <p className="text-sm">
                Total:{' '}
                <span className={totalPercentage === 100 ? 'text-success font-bold' : 'text-destructive font-bold'}>
                  {totalPercentage}%
                </span>
              </p>
              <p className="text-xs text-muted-foreground">{totalParcels} parcelas</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {simulation_params.entry_bands.map((band, index) => (
              <div
                key={band.id}
                className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg"
              >
                <span className="text-sm font-medium w-16">Faixa {index + 1}</span>
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    type="number"
                    value={band.parcels}
                    onChange={(e) =>
                      updateEntryBand(index, 'parcels', parseInt(e.target.value) || 0)
                    }
                    className="w-20 text-center"
                  />
                  <span className="text-sm text-muted-foreground">parcelas</span>
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    type="number"
                    value={band.percentage}
                    onChange={(e) =>
                      updateEntryBand(index, 'percentage', parseInt(e.target.value) || 0)
                    }
                    className="w-20 text-center"
                  />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeEntryBand(index)}
                  disabled={simulation_params.entry_bands.length <= 1}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {totalPercentage !== 100 && (
            <p className="text-sm text-destructive">
              A soma dos percentuais deve ser igual a 100%
            </p>
          )}

          <Button
            variant="outline"
            onClick={addEntryBand}
            disabled={simulation_params.entry_bands.length >= 6}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Faixa
          </Button>
        </CardContent>
      </Card>

      {/* Fases da Obra */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Settings className="h-5 w-5 text-primary" />
            Fases da Obra (liberação do financiamento)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {simulation_params.construction_phases.map((phase, index) => (
              <div
                key={phase.id}
                className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg"
              >
                <Input
                  value={phase.name}
                  onChange={(e) => updatePhase(index, 'name', e.target.value)}
                  className="flex-1"
                  placeholder="Nome da fase"
                />
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={phase.percentage}
                    onChange={(e) =>
                      updatePhase(index, 'percentage', parseInt(e.target.value) || 0)
                    }
                    className="w-20 text-center"
                  />
                  <span className="text-sm text-muted-foreground">% liberado</span>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={phase.duration_months}
                    onChange={(e) =>
                      updatePhase(index, 'duration_months', parseInt(e.target.value) || 0)
                    }
                    className="w-16 text-center"
                  />
                  <span className="text-sm text-muted-foreground">meses</span>
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground mt-4">
            Os percentuais representam o valor acumulado liberado pelo banco em cada fase.
            A última fase deve ter 100%.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
