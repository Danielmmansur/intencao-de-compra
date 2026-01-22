import { useProposal } from '@/contexts/ProposalContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CurrencyInput } from '@/components/ui/currency-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileCheck, BadgeDollarSign, Landmark, Calculator } from 'lucide-react';
import { formatCurrency } from '@/lib/calculations';

export function ApprovalStep() {
  const { state, dispatch } = useProposal();
  const { approval_letter } = state.proposal;

  const updateField = (field: string, value: any) => {
    dispatch({
      type: 'UPDATE_APPROVAL_LETTER',
      payload: { ...approval_letter, [field]: value },
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Carta de Aprovação</h2>
        <p className="text-muted-foreground mt-1">
          Insira os dados da carta de aprovação do financiamento
        </p>
      </div>

      {/* Summary Cards */}
      {approval_letter.approved_value > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="stat-card-primary">
            <p className="text-xs text-muted-foreground">Aprovado</p>
            <p className="text-lg font-bold text-primary">
              {formatCurrency(approval_letter.approved_value)}
            </p>
          </Card>
          <Card className="stat-card">
            <p className="text-xs text-muted-foreground">Subsídio</p>
            <p className="text-lg font-bold text-success">
              {formatCurrency(approval_letter.subsidy)}
            </p>
          </Card>
          <Card className="stat-card">
            <p className="text-xs text-muted-foreground">FGTS</p>
            <p className="text-lg font-bold text-info">
              {formatCurrency(approval_letter.fgts)}
            </p>
          </Card>
          <Card className="stat-card-accent">
            <p className="text-xs text-muted-foreground">1ª Prestação</p>
            <p className="text-lg font-bold text-accent">
              {formatCurrency(approval_letter.first_installment)}
            </p>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Valores Aprovados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileCheck className="h-5 w-5 text-primary" />
              Valores Aprovados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Valor Aprovado *</Label>
              <CurrencyInput
                value={approval_letter.approved_value}
                onChange={(val) => updateField('approved_value', val)}
              />
            </div>
            <div className="space-y-2">
              <Label>Valor Financiado *</Label>
              <CurrencyInput
                value={approval_letter.financed_value}
                onChange={(val) => updateField('financed_value', val)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Benefícios */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BadgeDollarSign className="h-5 w-5 text-success" />
              Benefícios
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Subsídio (MCMV)</Label>
              <CurrencyInput
                value={approval_letter.subsidy}
                onChange={(val) => updateField('subsidy', val)}
              />
            </div>
            <div className="space-y-2">
              <Label>FGTS</Label>
              <CurrencyInput
                value={approval_letter.fgts}
                onChange={(val) => updateField('fgts', val)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Entrada */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calculator className="h-5 w-5 text-primary" />
              Entrada
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Valor da Entrada *</Label>
              <CurrencyInput
                value={approval_letter.entry_value}
                onChange={(val) => updateField('entry_value', val)}
              />
              <p className="text-xs text-muted-foreground">
                Valor a ser pago à construtora durante a obra
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Banco e Financiamento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Landmark className="h-5 w-5 text-primary" />
              Financiamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Primeira Prestação (estimada) *</Label>
              <CurrencyInput
                value={approval_letter.first_installment}
                onChange={(val) => updateField('first_installment', val)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Banco</Label>
                <Select
                  value={approval_letter.bank}
                  onValueChange={(val) => updateField('bank', val)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Caixa">Caixa Econômica</SelectItem>
                    <SelectItem value="Bradesco">Bradesco</SelectItem>
                    <SelectItem value="Itau">Itaú</SelectItem>
                    <SelectItem value="Santander">Santander</SelectItem>
                    <SelectItem value="BB">Banco do Brasil</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Sistema de Amortização</Label>
                <Select
                  value={approval_letter.amortization_system}
                  onValueChange={(val) => updateField('amortization_system', val)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SAC">SAC</SelectItem>
                    <SelectItem value="PRICE">PRICE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
