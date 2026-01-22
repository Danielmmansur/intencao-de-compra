import { useProposal } from '@/contexts/ProposalContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CurrencyInput } from '@/components/ui/currency-input';
import { Building, MapPin, Home } from 'lucide-react';
import { formatCurrency } from '@/lib/calculations';

export function PropertyStep() {
  const { state, dispatch } = useProposal();
  const { property } = state.proposal;

  const updateField = (field: string, value: any) => {
    dispatch({
      type: 'UPDATE_PROPERTY',
      payload: { ...property, [field]: value },
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Dados do Imóvel</h2>
        <p className="text-muted-foreground mt-1">
          Informe as características e valores do imóvel
        </p>
      </div>

      {/* Summary */}
      {property.sale_value > 0 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Home className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Valor de Venda</p>
                <p className="font-semibold text-xl">{formatCurrency(property.sale_value)}</p>
              </div>
            </div>
            {property.appraisal_value && property.appraisal_value !== property.sale_value && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Avaliação</p>
                <p className="font-semibold">{formatCurrency(property.appraisal_value)}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Empreendimento */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building className="h-5 w-5 text-primary" />
              Empreendimento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="empreendimento">Nome do Empreendimento *</Label>
              <Input
                id="empreendimento"
                value={property.empreendimento_name || ''}
                onChange={(e) => updateField('empreendimento_name', e.target.value)}
                placeholder="Ex: Residencial Parque das Flores"
              />
            </div>
          </CardContent>
        </Card>

        {/* Endereço */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="h-5 w-5 text-primary" />
              Localização
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Endereço Completo</Label>
              <Input
                id="address"
                value={property.address || ''}
                onChange={(e) => updateField('address', e.target.value)}
                placeholder="Rua, número, bairro, cidade - UF"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="block">Bloco / Torre</Label>
                <Input
                  id="block"
                  value={property.block || ''}
                  onChange={(e) => updateField('block', e.target.value)}
                  placeholder="Ex: Bloco A"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unidade / Apartamento *</Label>
                <Input
                  id="unit"
                  value={property.unit || ''}
                  onChange={(e) => updateField('unit', e.target.value)}
                  placeholder="Ex: 101"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Valores */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Valor de Venda *</CardTitle>
          </CardHeader>
          <CardContent>
            <CurrencyInput
              value={property.sale_value}
              onChange={(val) => updateField('sale_value', val)}
            />
            <p className="text-xs text-muted-foreground mt-2">
              Valor total do imóvel conforme tabela de vendas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Valor de Avaliação</CardTitle>
          </CardHeader>
          <CardContent>
            <CurrencyInput
              value={property.appraisal_value || 0}
              onChange={(val) => updateField('appraisal_value', val)}
            />
            <p className="text-xs text-muted-foreground mt-2">
              Valor de avaliação do banco (se diferente do valor de venda)
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
