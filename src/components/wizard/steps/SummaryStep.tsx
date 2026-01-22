import { useMemo } from 'react';
import { useProposal } from '@/contexts/ProposalContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Users,
  Building,
  FileText,
  Calculator,
  Download,
  Eye,
  Gift,
  AlertTriangle,
  CheckCircle,
  Home,
} from 'lucide-react';
import {
  generatePaymentFlow,
  calculateIncomeCommitment,
  calculateTotalFamilyIncome,
  calculateEffectiveEntry,
  formatCurrency,
  formatPercentage,
} from '@/lib/calculations';

export function SummaryStep() {
  const { state, togglePresentationMode } = useProposal();
  const { proposal, isPresentationMode } = state;
  const { clients, intermediary, property, approval_letter, simulation_params, campaigns } = proposal;

  const totalIncome = useMemo(() => calculateTotalFamilyIncome(clients), [clients]);
  const effectiveEntry = useMemo(
    () => calculateEffectiveEntry(approval_letter, campaigns),
    [approval_letter, campaigns]
  );
  const paymentFlow = useMemo(
    () => generatePaymentFlow(approval_letter, simulation_params, campaigns),
    [approval_letter, simulation_params, campaigns]
  );
  const incomeCommitment = useMemo(
    () => calculateIncomeCommitment(paymentFlow, totalIncome, simulation_params.construction_months),
    [paymentFlow, totalIncome, simulation_params.construction_months]
  );

  const constructionPayments = paymentFlow.slice(0, simulation_params.construction_months);
  const maxTotal = Math.max(...constructionPayments.map((p) => p.total));
  const avgTotal =
    constructionPayments.reduce((sum, p) => sum + p.total, 0) / constructionPayments.length;

  const approvedCampaigns = campaigns.filter((c) => c.status === 'aprovada');
  const totalDiscount = approvedCampaigns.reduce((sum, c) => {
    if (!c.discount_value) return sum;
    if (c.discount_type === 'fixed') return sum + c.discount_value;
    if (c.discount_type === 'percentage') {
      return sum + (approval_letter.entry_value * c.discount_value) / 100;
    }
    return sum;
  }, 0);

  const mainClient = clients.find((c) => c.isMainProponent) || clients[0];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Resumo da Proposta</h2>
          <p className="text-muted-foreground mt-1">
            Revise todos os dados antes de gerar o documento
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={togglePresentationMode} className="gap-2">
            <Eye className="h-4 w-4" />
            {isPresentationMode ? 'Modo Técnico' : 'Modo Apresentação'}
          </Button>
          <Button className="gap-2">
            <Download className="h-4 w-4" />
            Gerar PDF
          </Button>
        </div>
      </div>

      {/* Hero Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="stat-card-primary col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2 mb-1">
            <Home className="h-4 w-4 text-primary" />
            <p className="text-xs text-muted-foreground">Imóvel</p>
          </div>
          <p className="text-lg font-bold">{formatCurrency(property.sale_value)}</p>
        </Card>
        <Card className="stat-card">
          <p className="text-xs text-muted-foreground">Entrada</p>
          <p className="text-lg font-bold">{formatCurrency(effectiveEntry)}</p>
          {totalDiscount > 0 && (
            <p className="text-xs text-success">-{formatCurrency(totalDiscount)} desc.</p>
          )}
        </Card>
        <Card className="stat-card">
          <p className="text-xs text-muted-foreground">Financiamento</p>
          <p className="text-lg font-bold">{formatCurrency(approval_letter.financed_value)}</p>
        </Card>
        <Card className="stat-card-success">
          <p className="text-xs text-muted-foreground">Subsídio</p>
          <p className="text-lg font-bold text-success">{formatCurrency(approval_letter.subsidy)}</p>
        </Card>
        <Card className="stat-card">
          <p className="text-xs text-muted-foreground">FGTS</p>
          <p className="text-lg font-bold">{formatCurrency(approval_letter.fgts)}</p>
        </Card>
      </div>

      {/* Cost Summary */}
      <Card className={incomeCommitment.is_over_limit ? 'border-destructive' : 'border-success'}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {incomeCommitment.is_over_limit ? (
              <AlertTriangle className="h-5 w-5 text-destructive" />
            ) : (
              <CheckCircle className="h-5 w-5 text-success" />
            )}
            Custo Mensal Durante a Obra
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-muted-foreground">Médio</p>
              <p className="text-2xl font-bold">{formatCurrency(avgTotal)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Máximo</p>
              <p className={`text-2xl font-bold ${incomeCommitment.is_over_limit ? 'text-destructive' : ''}`}>
                {formatCurrency(maxTotal)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Após Habite-se</p>
              <p className="text-2xl font-bold text-success">
                {formatCurrency(approval_letter.first_installment)}
              </p>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Comprometimento máximo de renda</span>
            <Badge
              variant={incomeCommitment.is_over_limit ? 'destructive' : 'default'}
              className={!incomeCommitment.is_over_limit ? 'bg-success' : ''}
            >
              {formatPercentage(incomeCommitment.worst_phase)}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Clients Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-primary" />
              Proponentes ({clients.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {clients.map((client, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="font-medium">
                    {client.full_name}
                    {client.isMainProponent && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        Principal
                      </Badge>
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">{client.cpf}</p>
                </div>
                <p className="font-mono">{formatCurrency(client.monthly_income)}</p>
              </div>
            ))}
            <div className="flex items-center justify-between pt-2 font-semibold">
              <span>Renda Familiar Total</span>
              <span>{formatCurrency(totalIncome)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Property Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building className="h-5 w-5 text-primary" />
              Imóvel
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <p className="font-medium text-lg">{property.empreendimento_name}</p>
              {property.address && <p className="text-sm text-muted-foreground">{property.address}</p>}
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-2 text-sm">
              {property.block && (
                <div>
                  <span className="text-muted-foreground">Bloco:</span> {property.block}
                </div>
              )}
              {property.unit && (
                <div>
                  <span className="text-muted-foreground">Unidade:</span> {property.unit}
                </div>
              )}
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Valor de Venda</span>
              <span className="font-bold text-lg">{formatCurrency(property.sale_value)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Approval Letter Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-primary" />
              Carta de Aprovação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Banco</span>
              <span>{approval_letter.bank}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sistema</span>
              <span>{approval_letter.amortization_system}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Valor Aprovado</span>
              <span className="font-mono">{formatCurrency(approval_letter.approved_value)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Financiado</span>
              <span className="font-mono">{formatCurrency(approval_letter.financed_value)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Primeira Prestação</span>
              <span className="font-mono">{formatCurrency(approval_letter.first_installment)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Campaigns Summary */}
        {campaigns.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Gift className="h-5 w-5 text-accent" />
                Campanhas ({campaigns.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {campaigns.map((campaign, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium">{campaign.name}</p>
                    {campaign.bonus_description && (
                      <p className="text-sm text-muted-foreground">{campaign.bonus_description}</p>
                    )}
                  </div>
                  <div className="text-right">
                    {campaign.discount_value && (
                      <p className="font-mono text-success">
                        -{campaign.discount_type === 'percentage' 
                          ? `${campaign.discount_value}%` 
                          : formatCurrency(campaign.discount_value)}
                      </p>
                    )}
                    <Badge
                      variant={campaign.status === 'aprovada' ? 'default' : 'secondary'}
                      className={campaign.status === 'aprovada' ? 'bg-success' : ''}
                    >
                      {campaign.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Disclaimers */}
      <Card className="bg-muted/50">
        <CardContent className="py-4 space-y-2">
          <p className="text-sm text-muted-foreground">
            ⚠️ <strong>Valores estimativos</strong> - sujeitos à aprovação e medições da Caixa.
          </p>
          <p className="text-sm text-muted-foreground">
            ⚠️ <strong>Taxa de evolução de obra</strong> - varia conforme liberação do banco.
          </p>
          <p className="text-sm text-muted-foreground">
            ⚠️ <strong>Este documento não possui vínculo contratual</strong> - trata-se apenas de uma 
            intenção/proposta de compra para fins de simulação.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
