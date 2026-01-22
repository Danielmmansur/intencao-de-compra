import { useMemo } from 'react';
import { useProposal } from '@/contexts/ProposalContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Calculator,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  DollarSign,
} from 'lucide-react';
import {
  generatePaymentFlow,
  calculateIncomeCommitment,
  calculateTotalFamilyIncome,
  formatCurrency,
  formatPercentage,
} from '@/lib/calculations';

export function CalculationsStep() {
  const { state } = useProposal();
  const { clients, approval_letter, simulation_params, campaigns } = state.proposal;

  const totalIncome = useMemo(() => calculateTotalFamilyIncome(clients), [clients]);

  const paymentFlow = useMemo(
    () => generatePaymentFlow(approval_letter, simulation_params, campaigns),
    [approval_letter, simulation_params, campaigns]
  );

  const incomeCommitment = useMemo(
    () => calculateIncomeCommitment(paymentFlow, totalIncome, simulation_params.construction_months),
    [paymentFlow, totalIncome, simulation_params.construction_months]
  );

  // Find min, max, and average total during construction
  const constructionPayments = paymentFlow.slice(0, simulation_params.construction_months);
  const minTotal = Math.min(...constructionPayments.map((p) => p.total));
  const maxTotal = Math.max(...constructionPayments.map((p) => p.total));
  const avgTotal =
    constructionPayments.reduce((sum, p) => sum + p.total, 0) / constructionPayments.length;

  // Post-construction payment (no construction fee)
  const postConstructionPayment = paymentFlow.find(
    (p) => p.month > simulation_params.construction_months
  );

  const getPhaseBadgeClass = (phase: string) => {
    const lower = phase.toLowerCase();
    if (lower.includes('fundação')) return 'phase-fundacao';
    if (lower.includes('estrutura')) return 'phase-estrutura';
    if (lower.includes('acabamento')) return 'phase-acabamento';
    if (lower.includes('conclusão') || lower.includes('pós')) return 'phase-conclusao';
    return 'bg-muted text-muted-foreground';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">
          Cálculos e Comprometimento de Renda
        </h2>
        <p className="text-muted-foreground mt-1">
          Visualize o fluxo de pagamento e análise de comprometimento
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="stat-card-primary">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="h-4 w-4 text-primary" />
            <p className="text-xs text-muted-foreground">Renda Familiar</p>
          </div>
          <p className="text-xl font-bold">{formatCurrency(totalIncome)}</p>
        </Card>

        <Card className="stat-card">
          <p className="text-xs text-muted-foreground">Custo Mínimo (obra)</p>
          <p className="text-xl font-bold">{formatCurrency(minTotal)}</p>
        </Card>

        <Card className="stat-card">
          <p className="text-xs text-muted-foreground">Custo Médio (obra)</p>
          <p className="text-xl font-bold">{formatCurrency(avgTotal)}</p>
        </Card>

        <Card className={incomeCommitment.is_over_limit ? 'stat-card border-destructive bg-destructive/5' : 'stat-card-success'}>
          <p className="text-xs text-muted-foreground">Custo Máximo (obra)</p>
          <p className="text-xl font-bold">{formatCurrency(maxTotal)}</p>
        </Card>
      </div>

      {/* Income Commitment Alert */}
      {incomeCommitment.is_over_limit ? (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Comprometimento de Renda Elevado</AlertTitle>
          <AlertDescription>
            O comprometimento máximo de {formatPercentage(incomeCommitment.worst_phase)} excede o
            limite recomendado de 30%. Considere ajustar os parâmetros da simulação.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="border-success bg-success/5">
          <CheckCircle className="h-4 w-4 text-success" />
          <AlertTitle className="text-success">Comprometimento de Renda Adequado</AlertTitle>
          <AlertDescription>
            Comprometimento máximo de {formatPercentage(incomeCommitment.worst_phase)} e médio de{' '}
            {formatPercentage(incomeCommitment.average)} durante a obra.
          </AlertDescription>
        </Alert>
      )}

      {/* Commitment Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
              Comprometimento de Renda
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-muted-foreground">Na pior fase (máximo)</span>
              <span className={`font-bold text-lg ${incomeCommitment.is_over_limit ? 'text-destructive' : 'text-foreground'}`}>
                {formatPercentage(incomeCommitment.worst_phase)}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-muted-foreground">Média durante a obra</span>
              <span className="font-bold text-lg">{formatPercentage(incomeCommitment.average)}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground">Após Habite-se</span>
              <span className="font-bold text-lg text-success">
                {totalIncome > 0
                  ? formatPercentage((approval_letter.first_installment / totalIncome) * 100)
                  : '0%'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calculator className="h-5 w-5 text-primary" />
              Resumo Pós-Habite-se
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-muted-foreground">Prestação do Financiamento</span>
              <span className="font-bold">{formatCurrency(approval_letter.first_installment)}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-muted-foreground">Taxa de Evolução de Obra</span>
              <span className="font-bold text-success">R$ 0,00</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground">Entrada (se ainda houver)</span>
              <span className="font-bold">
                {simulation_params.entry_term_months > simulation_params.construction_months
                  ? 'Pode continuar'
                  : 'Encerrada'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Flow Table */}
      <Card>
        <CardHeader>
          <CardTitle>Fluxo de Pagamento Mês a Mês</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] rounded-md border">
            <table className="table-flow">
              <thead className="sticky top-0 z-10">
                <tr>
                  <th className="w-16">Mês</th>
                  <th className="w-24">Data</th>
                  <th>Fase</th>
                  <th className="text-right">Entrada</th>
                  <th className="text-right">Prestação</th>
                  <th className="text-right">Taxa Obra</th>
                  <th className="text-right font-bold">Total</th>
                  <th>Obs.</th>
                </tr>
              </thead>
              <tbody>
                {paymentFlow.map((row) => (
                  <tr
                    key={row.month}
                    className={
                      row.month === simulation_params.construction_months
                        ? 'bg-success/10'
                        : row.month > simulation_params.construction_months
                        ? 'bg-muted/30'
                        : ''
                    }
                  >
                    <td className="font-mono">{row.month}</td>
                    <td className="font-mono text-sm">
                      {new Date(row.date).toLocaleDateString('pt-BR', {
                        month: 'short',
                        year: '2-digit',
                      })}
                    </td>
                    <td>
                      <span className={getPhaseBadgeClass(row.phase)}>{row.phase}</span>
                    </td>
                    <td className="text-right font-mono">
                      {row.entry_payment > 0 ? formatCurrency(row.entry_payment) : '-'}
                    </td>
                    <td className="text-right font-mono">
                      {formatCurrency(row.financing_installment)}
                    </td>
                    <td className="text-right font-mono">
                      {row.construction_fee > 0 ? formatCurrency(row.construction_fee) : '-'}
                    </td>
                    <td className="text-right font-mono font-bold">
                      {formatCurrency(row.total)}
                    </td>
                    <td className="text-xs text-muted-foreground">{row.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollArea>

          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Legenda:</strong> Entrada = pago à construtora | Prestação = pago ao banco |
              Taxa de Obra = juros sobre valor liberado (encerra no Habite-se)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
