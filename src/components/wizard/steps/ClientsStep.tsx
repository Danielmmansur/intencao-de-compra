import { useState } from 'react';
import { useProposal } from '@/contexts/ProposalContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CurrencyInput } from '@/components/ui/currency-input';
import { CPFInput } from '@/components/ui/cpf-input';
import { PhoneInput } from '@/components/ui/phone-input';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, User, Users } from 'lucide-react';
import type { Client } from '@/types/proposal';
import { formatCurrency, calculateTotalFamilyIncome } from '@/lib/calculations';

const emptyClient: Client = {
  full_name: '',
  cpf: '',
  phone: '',
  email: '',
  address: '',
  monthly_income: 0,
  family_composition: '',
  notes: '',
  isMainProponent: false,
};

export function ClientsStep() {
  const { state, dispatch } = useProposal();
  const { clients } = state.proposal;
  const [expandedClient, setExpandedClient] = useState<number | null>(
    clients.length === 0 ? 0 : null
  );

  const addClient = () => {
    const newClient = { 
      ...emptyClient, 
      isMainProponent: clients.length === 0 
    };
    dispatch({ type: 'ADD_CLIENT', payload: newClient });
    setExpandedClient(clients.length);
  };

  const updateClient = (index: number, field: keyof Client, value: any) => {
    const updated = { ...clients[index], [field]: value };
    dispatch({ type: 'UPDATE_CLIENT', payload: { index, client: updated } });
  };

  const removeClient = (index: number) => {
    dispatch({ type: 'REMOVE_CLIENT', payload: index });
    if (expandedClient === index) {
      setExpandedClient(null);
    }
  };

  const setMainProponent = (index: number) => {
    const updated = clients.map((c, i) => ({
      ...c,
      isMainProponent: i === index,
    }));
    dispatch({ type: 'UPDATE_CLIENTS', payload: updated });
  };

  const totalIncome = calculateTotalFamilyIncome(clients);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Clientes / Proponentes</h2>
          <p className="text-muted-foreground mt-1">
            Cadastre os compradores e suas informações de renda
          </p>
        </div>
        <Button onClick={addClient} className="gap-2">
          <Plus className="h-4 w-4" />
          Adicionar Cliente
        </Button>
      </div>

      {/* Summary Card */}
      {clients.length > 0 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {clients.length} {clients.length === 1 ? 'proponente' : 'proponentes'}
                </p>
                <p className="font-semibold text-lg">
                  Renda familiar: {formatCurrency(totalIncome)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Client Cards */}
      {clients.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground text-center">
              Nenhum cliente cadastrado.<br />
              Clique em "Adicionar Cliente" para começar.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {clients.map((client, index) => (
            <Card 
              key={index} 
              className={expandedClient === index ? 'ring-2 ring-primary' : ''}
            >
              <CardHeader 
                className="cursor-pointer"
                onClick={() => setExpandedClient(expandedClient === index ? null : index)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <CardTitle className="text-base">
                        {client.full_name || `Cliente ${index + 1}`}
                        {client.isMainProponent && (
                          <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                            Principal
                          </span>
                        )}
                      </CardTitle>
                      {client.cpf && (
                        <p className="text-sm text-muted-foreground">{client.cpf}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Renda</p>
                      <p className="font-semibold">{formatCurrency(client.monthly_income)}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeClient(index);
                      }}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {expandedClient === index && (
                <CardContent className="border-t pt-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`name-${index}`}>Nome Completo *</Label>
                      <Input
                        id={`name-${index}`}
                        value={client.full_name}
                        onChange={(e) => updateClient(index, 'full_name', e.target.value)}
                        placeholder="Nome completo do cliente"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`cpf-${index}`}>CPF *</Label>
                      <CPFInput
                        id={`cpf-${index}`}
                        value={client.cpf}
                        onChange={(val) => updateClient(index, 'cpf', val)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`birth-${index}`}>Data de Nascimento</Label>
                      <Input
                        id={`birth-${index}`}
                        type="date"
                        value={client.birth_date || ''}
                        onChange={(e) => updateClient(index, 'birth_date', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`income-${index}`}>Renda Mensal *</Label>
                      <CurrencyInput
                        id={`income-${index}`}
                        value={client.monthly_income}
                        onChange={(val) => updateClient(index, 'monthly_income', val)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`phone-${index}`}>Telefone</Label>
                      <PhoneInput
                        id={`phone-${index}`}
                        value={client.phone || ''}
                        onChange={(val) => updateClient(index, 'phone', val)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`email-${index}`}>E-mail</Label>
                      <Input
                        id={`email-${index}`}
                        type="email"
                        value={client.email || ''}
                        onChange={(e) => updateClient(index, 'email', e.target.value)}
                        placeholder="email@exemplo.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`address-${index}`}>Endereço</Label>
                    <Input
                      id={`address-${index}`}
                      value={client.address || ''}
                      onChange={(e) => updateClient(index, 'address', e.target.value)}
                      placeholder="Endereço completo"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`family-${index}`}>Composição Familiar</Label>
                    <Input
                      id={`family-${index}`}
                      value={client.family_composition || ''}
                      onChange={(e) => updateClient(index, 'family_composition', e.target.value)}
                      placeholder="Ex: Casado, 2 filhos"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`notes-${index}`}>Observações de Atendimento</Label>
                    <Textarea
                      id={`notes-${index}`}
                      value={client.notes || ''}
                      onChange={(e) => updateClient(index, 'notes', e.target.value)}
                      placeholder="Anotações sobre o atendimento..."
                      rows={3}
                    />
                  </div>

                  {clients.length > 1 && (
                    <div className="flex items-center space-x-2 pt-2 border-t">
                      <Checkbox
                        id={`main-${index}`}
                        checked={client.isMainProponent}
                        onCheckedChange={() => setMainProponent(index)}
                      />
                      <Label 
                        htmlFor={`main-${index}`}
                        className="text-sm cursor-pointer"
                      >
                        Definir como proponente principal
                      </Label>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
