import { useMemo } from 'react';
import { useProposal } from '@/contexts/ProposalContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Calculator,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  FileDown,
  Percent,
  Target,
} from 'lucide-react';
import {
  calculateProSolutoSummary,
  generateIncomeBasedProSolutoFlow,
  getCommitmentPercentage,
} from '@/lib/proSolutoCalculations';
import {
  calculateTotalFamilyIncome,
  formatCurrency,
  formatPercentage,
} from '@/lib/calculations';
import { generatePaymentFlowPdf } from '@/lib/pdfGenerator';
import { getEmpreendimentoById } from '@/data/empreendimentos';

export function CalculationsStep() {
  const { state } = useProposal();
  const { clients, approval_letter, simulation_params, campaigns, property, intermediary } = state.proposal;

  const totalIncome = useMemo(() => calculateTotalFamilyIncome(clients), [clients]);

  const summary = useMemo(
    () => calculateProSolutoSummary(property, approval_letter, simulation_params, campaigns),
    [property, approval_letter, simulation_params, campaigns]
  );

  const empreendimento = useMemo(
    () => getEmpreendimentoById(property.empreendimento_id || ''),
    [property.empreendimento_id]
  );

  const flowResult = useMemo(
    () => generateIncomeBasedProSolutoFlow(summary, simulation_params, totalIncome, property),
    [summary, simulation_params, totalIncome, property]
  );

  const { 
    flow: paymentFlow, 
    residualBalance, 
    hasResidualBalance, 
    monthlyIncomeCeiling,
    commitmentPercentage,
    monthsToPayOff,
    totalPaid,
  } = flowResult;

  // Find min, max, and average total during entry term
  const entryPayments = paymentFlow.slice(0, simulation_params.entry_term_months);
  const totals = entryPayments.map((p) => p.total).filter((t) => t > 0);
  const minTotal = totals.length > 0 ? Math.min(...totals) : 0;
  const maxTotal = totals.length > 0 ? Math.max(...totals) : 0;
  const avgTotal = totals.length > 0 ? totals.reduce((a, b) => a + b, 0) / totals.length : 0;

  // Income commitment calculation
  const maxCommitment = totalIncome > 0 ? (maxTotal / totalIncome) * 100 : 0;
  const avgCommitment = totalIncome > 0 ? (avgTotal / totalIncome) * 100 : 0;
  const isOverLimit = maxCommitment > commitmentPercentage;

  // Post-construction commitment (only financing installment)
  const postConstructionCommitment = totalIncome > 0 
    ? ((approval_letter.first_installment || 0) / totalIncome) * 100 
    : 0;

  const handleDownloadPdf = () => {
    generatePaymentFlowPdf({
      clients,
      property,
      intermediary,
      summary,
      flow: paymentFlow,
      simulationDate: simulation_params.simulation_start_date,
      constructionMonths: empreendimento?.constructionMonths || simulation_params.construction_months,
      entryTermMonths: simulation_params.entry_term_months,
      monthlyIncomeCeiling,
      commitmentPercentage,
      totalFamilyIncome: totalIncome,
      hasResidualBalance,
      residualBalance,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">
            Cálculos e Fluxo de Pagamento
          </h2>
          <p className="text-muted-foreground mt-1">
            Fluxo baseado em comprometimento de renda
            {empreendimento && ` - ${empreendimento.name}`}
          </p>
        </div>
        <Button onClick={handleDownloadPdf} className="gap-2">
          <FileDown className="h-4 w-4" />
          Baixar Fluxo em PDF
        </Button>
      </div>

      {/* Income Ceiling Card - Primary Highlight */}
      <Card className="border-2 border-accent bg-gradient-to-br from-accent/10 via-accent/5 to-transparent">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Target className="h-5 w-5 text-accent-foreground" />
                <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium">
                  Teto Mensal
                </p>
              </div>
              <p className="text-4xl font-bold text-primary">
                {formatCurrency(monthlyIncomeCeiling)}
              </p>
              <p className="text-sm text-muted-foreground">
                {commitmentPercentage}% da renda ({simulation_params.has_guarantor ? 'c/ fiador' : 's/ fiador'})
              </p>
            </div>
            
            <div className="text-center space-y-2 border-l border-r border-border px-4">
              <div className="flex items-center justify-center gap-2">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium">
                  Renda Familiar
                </p>
              </div>
              <p className="text-3xl font-bold">{formatCurrency(totalIncome)}</p>
              <Badge variant={simulation_params.has_guarantor ? 'default' : 'secondary'}>
                {simulation_params.has_guarantor ? 'Com Fiador (35%)' : 'Sem Fiador (30%)'}
              </Badge>
            </div>

            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Percent className="h-5 w-5 text-muted-foreground" />
                <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium">
                  Comprometimento
                </p>
              </div>
              <p className="text-3xl font-bold">{commitmentPercentage}%</p>
              <p className="text-sm text-muted-foreground">
                Limite máximo por mês
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pró-Soluto Highlight Card */}
      <Card className="border-2 border-primary bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium">
              Valor Total a Pagar (Pró-Soluto)
            </p>
            <p className="text-5xl font-bold text-primary">
              {formatCurrency(summary.proSolutoTotal)}
            </p>
            <p className="text-sm text-muted-foreground">
              Pró-Soluto = Entrada ({formatCurrency(summary.entryValue)}) + Documentação ({formatCurrency(summary.documentationCost)})
            </p>
            <div className="pt-4 flex justify-center gap-8 text-sm">
              <div>
                <span className="text-muted-foreground">Prazo estimado: </span>
                <span className="font-mono font-semibold">{monthsToPayOff} meses</span>
              </div>
              <div>
                <span className="text-muted-foreground">Prazo da entrada: </span>
                <span className="font-mono font-semibold">{simulation_params.entry_term_months}x</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Residual Balance Alert */}
      {hasResidualBalance && (
        <Alert variant="destructive" className="border-2">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle className="text-lg font-semibold">Saldo Residual Detectado</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-2">
              Renda insuficiente para o prazo selecionado. Após {simulation_params.entry_term_months} meses, 
              ainda restará um saldo de <strong>{formatCurrency(residualBalance)}</strong>.
            </p>
            <p className="text-sm">
              Sugestão: Aumente o prazo da entrada, reduza o valor do imóvel, ou busque 
              um fiador para aumentar o teto de comprometimento para 35%.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {/* Success Alert */}
      {!hasResidualBalance && (
        <Alert className="border-success bg-success/5">
          <CheckCircle className="h-4 w-4 text-success" />
          <AlertTitle className="text-success">Comprometimento de Renda Adequado</AlertTitle>
          <AlertDescription>
            O Pró-Soluto será quitado em aproximadamente {monthsToPayOff} meses, 
            respeitando o limite de {commitmentPercentage}% da renda familiar.
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="stat-card-primary">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="h-4 w-4 text-primary" />
            <p className="text-xs text-muted-foreground">Já Pago (Projeção)</p>
          </div>
          <p className="text-xl font-bold">{formatCurrency(totalPaid)}</p>
        </Card>

        <Card className="stat-card">
          <p className="text-xs text-muted-foreground">Custo Mínimo/Mês</p>
          <p className="text-xl font-bold">{formatCurrency(minTotal)}</p>
        </Card>

        <Card className="stat-card">
          <p className="text-xs text-muted-foreground">Custo Médio/Mês</p>
          <p className="text-xl font-bold">{formatCurrency(avgTotal)}</p>
        </Card>

        <Card className={hasResidualBalance ? 'stat-card border-destructive bg-destructive/5' : 'stat-card-success'}>
          <p className="text-xs text-muted-foreground">Custo Máximo/Mês</p>
          <p className="text-xl font-bold">{formatCurrency(maxTotal)}</p>
        </Card>
      </div>

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
              <span className="text-muted-foreground">Limite configurado</span>
              <span className="font-bold text-lg">
                {formatPercentage(commitmentPercentage)}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-muted-foreground">Máximo (pior mês)</span>
              <span className={`font-bold text-lg ${isOverLimit ? 'text-destructive' : 'text-foreground'}`}>
                {formatPercentage(maxCommitment)}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-muted-foreground">Média durante entrada</span>
              <span className="font-bold text-lg">{formatPercentage(avgCommitment)}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground">Após quitação da entrada</span>
              <span className="font-bold text-lg text-success">
                {formatPercentage(postConstructionCommitment)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calculator className="h-5 w-5 text-primary" />
              Resumo Financeiro
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-muted-foreground">Valor de Venda</span>
              <span className="font-bold">{formatCurrency(summary.saleValue)}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-muted-foreground">(-) Subsídio + FGTS + Desconto</span>
              <span className="font-bold text-destructive">
                -{formatCurrency(summary.subsidy + summary.fgts + summary.discount)}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-muted-foreground">(+) Documentação</span>
              <span className="font-bold">{formatCurrency(summary.documentationCost)}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground font-semibold">= Pró-Soluto</span>
              <span className="font-bold text-lg text-primary">{formatCurrency(summary.proSolutoTotal)}</span>
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
                  <th className="text-right">% Evolução</th>
                  <th className="text-right">Pró-Soluto</th>
                  <th className="text-right">Taxa Obra</th>
                  <th className="text-right font-bold">Total</th>
                  <th className="text-right">Compr. Renda</th>
                  <th>Obs.</th>
                </tr>
              </thead>
              <tbody>
                {paymentFlow.map((row) => {
                  const isCompleted = row.evolutionPercentage >= 100;
                  return (
                    <tr
                      key={row.month}
                      className={
                        row.isConstructionFeeOverLimit
                          ? 'bg-destructive/20 text-destructive'
                          : isCompleted
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
                      <td className="text-right font-mono text-sm">
                        {row.evolutionPercentage > 0 ? `${row.evolutionPercentage.toFixed(0)}%` : '-'}
                      </td>
                      <td className="text-right font-mono">
                        {row.proSolutoPayment > 0 ? formatCurrency(row.proSolutoPayment) : '-'}
                      </td>
                      <td className="text-right font-mono">
                        {row.constructionFee > 0 ? formatCurrency(row.constructionFee) : '-'}
                      </td>
                      <td className="text-right font-mono font-bold">
                        {formatCurrency(row.total)}
                      </td>
                      <td className="text-right font-mono">
                        <Badge 
                          variant={row.incomeCommitmentPercentage > commitmentPercentage ? 'destructive' : 'outline'}
                          className="text-xs"
                        >
                          {formatPercentage(row.incomeCommitmentPercentage, 1)}
                        </Badge>
                      </td>
                      <td className="text-xs text-muted-foreground">
                        {row.isConstructionFeeOverLimit && (
                          <span className="flex items-center gap-1 text-destructive font-medium">
                            <AlertTriangle className="h-3 w-3" />
                            Taxa &gt; Teto
                          </span>
                        )}
                        {!row.isConstructionFeeOverLimit && row.notes}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </ScrollArea>

          {/* Alert when any month has construction fee over limit */}
          {paymentFlow.some(row => row.isConstructionFeeOverLimit) && (
            <Alert variant="destructive" className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Alerta: Taxa de obra superior à capacidade de pagamento</AlertTitle>
              <AlertDescription>
                Em alguns meses, a Taxa de Evolução de Obra sozinha ultrapassa o teto de comprometimento 
                de renda ({commitmentPercentage}% = {formatCurrency(monthlyIncomeCeiling)}). 
                Considere aumentar a renda ou adicionar um fiador.
              </AlertDescription>
            </Alert>
          )}

          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Legenda:</strong> Taxa de Obra = Valor Financiado × % Evolução × 0,9% | 
              Pró-Soluto = Teto Mensal - Taxa de Obra (limitado ao saldo devedor)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
