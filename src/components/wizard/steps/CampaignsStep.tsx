import { useProposal } from '@/contexts/ProposalContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CurrencyInput } from '@/components/ui/currency-input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, Gift, Tag, CheckCircle, Clock, XCircle } from 'lucide-react';
import type { Campaign } from '@/types/proposal';
import { formatCurrency } from '@/lib/calculations';

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

export function CampaignsStep() {
  const { state, dispatch } = useProposal();
  const { isGerente } = useAuth();
  const { campaigns } = state.proposal;

  const addCampaign = () => {
    const newCampaign: Campaign = {
      id: generateId(),
      name: '',
      status: 'pendente',
    };
    dispatch({ type: 'ADD_CAMPAIGN', payload: newCampaign });
  };

  const updateCampaign = (index: number, updates: Partial<Campaign>) => {
    const updated = { ...campaigns[index], ...updates };
    dispatch({ type: 'UPDATE_CAMPAIGN', payload: { index, campaign: updated } });
  };

  const removeCampaign = (index: number) => {
    dispatch({ type: 'REMOVE_CAMPAIGN', payload: index });
  };

  const approveCampaign = (index: number) => {
    if (!isGerente) return;
    updateCampaign(index, { status: 'aprovada' });
  };

  const rejectCampaign = (index: number) => {
    if (!isGerente) return;
    updateCampaign(index, { status: 'rejeitada' });
  };

  const getStatusBadge = (status: Campaign['status']) => {
    switch (status) {
      case 'aprovada':
        return (
          <Badge className="bg-success text-success-foreground gap-1">
            <CheckCircle className="h-3 w-3" />
            Aprovada
          </Badge>
        );
      case 'rejeitada':
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Rejeitada
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            Pendente
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Campanhas e Condições Especiais</h2>
          <p className="text-muted-foreground mt-1">
            Adicione descontos, bônus e condições especiais para a proposta
          </p>
        </div>
        <Button onClick={addCampaign} className="gap-2">
          <Plus className="h-4 w-4" />
          Adicionar Campanha
        </Button>
      </div>

      {!isGerente && campaigns.some((c) => c.status === 'pendente') && (
        <Card className="bg-warning/10 border-warning/30">
          <CardContent className="py-4">
            <p className="text-sm text-warning flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Campanhas pendentes precisam de aprovação do gerente para serem aplicadas.
            </p>
          </CardContent>
        </Card>
      )}

      {campaigns.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Gift className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground text-center">
              Nenhuma campanha ou condição especial cadastrada.
              <br />
              Clique em "Adicionar Campanha" se houver benefícios.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {campaigns.map((campaign, index) => (
            <Card key={campaign.id || index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Tag className="h-5 w-5 text-accent" />
                    {campaign.name || `Campanha ${index + 1}`}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(campaign.status)}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeCampaign(index)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome da Campanha</Label>
                  <Input
                    value={campaign.name}
                    onChange={(e) => updateCampaign(index, { name: e.target.value })}
                    placeholder="Ex: Desconto de Lançamento"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo de Desconto</Label>
                    <Select
                      value={campaign.discount_type || ''}
                      onValueChange={(val) =>
                        updateCampaign(index, { discount_type: val as 'fixed' | 'percentage' })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                        <SelectItem value="percentage">Percentual (%)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Valor do Desconto</Label>
                    {campaign.discount_type === 'percentage' ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={campaign.discount_value || ''}
                          onChange={(e) =>
                            updateCampaign(index, {
                              discount_value: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-24"
                        />
                        <span>%</span>
                      </div>
                    ) : (
                      <CurrencyInput
                        value={campaign.discount_value || 0}
                        onChange={(val) => updateCampaign(index, { discount_value: val })}
                      />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Descrição do Bônus</Label>
                    <Input
                      value={campaign.bonus_description || ''}
                      onChange={(e) =>
                        updateCampaign(index, { bonus_description: e.target.value })
                      }
                      placeholder="Ex: Armários planejados inclusos"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Valor do Bônus</Label>
                    <CurrencyInput
                      value={campaign.bonus_value || 0}
                      onChange={(val) => updateCampaign(index, { bonus_value: val })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Condições Especiais</Label>
                  <Textarea
                    value={campaign.special_conditions || ''}
                    onChange={(e) =>
                      updateCampaign(index, { special_conditions: e.target.value })
                    }
                    placeholder="Descreva condições especiais aplicáveis..."
                    rows={2}
                  />
                </div>

                {isGerente && campaign.status === 'pendente' && (
                  <div className="flex items-center gap-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => approveCampaign(index)}
                      className="gap-2 text-success hover:text-success"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Aprovar
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => rejectCampaign(index)}
                      className="gap-2 text-destructive hover:text-destructive"
                    >
                      <XCircle className="h-4 w-4" />
                      Rejeitar
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
