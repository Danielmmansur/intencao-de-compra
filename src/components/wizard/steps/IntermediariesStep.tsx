import { useProposal } from '@/contexts/ProposalContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, User, Users } from 'lucide-react';

export function IntermediariesStep() {
  const { state, dispatch } = useProposal();
  const { intermediary } = state.proposal;

  const updateField = (field: string, value: string) => {
    dispatch({
      type: 'UPDATE_INTERMEDIARY',
      payload: { ...intermediary, [field]: value },
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Intermediadores</h2>
        <p className="text-muted-foreground mt-1">
          Informe os dados da imobiliária e dos profissionais envolvidos
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Imobiliária */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="h-5 w-5 text-primary" />
              Imobiliária
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="imobiliaria">Nome da Imobiliária</Label>
              <Input
                id="imobiliaria"
                value={intermediary.imobiliaria_name || ''}
                onChange={(e) => updateField('imobiliaria_name', e.target.value)}
                placeholder="Nome da imobiliária"
              />
            </div>
          </CardContent>
        </Card>

        {/* Corretor */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-primary" />
              Corretor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="corretor">Nome do Corretor</Label>
              <Input
                id="corretor"
                value={intermediary.corretor_name || ''}
                onChange={(e) => updateField('corretor_name', e.target.value)}
                placeholder="Nome do corretor responsável"
              />
            </div>
          </CardContent>
        </Card>

        {/* Coordenador */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-primary" />
              Coordenador
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="coordinator">Nome do Coordenador</Label>
              <Input
                id="coordinator"
                value={intermediary.coordinator_name || ''}
                onChange={(e) => updateField('coordinator_name', e.target.value)}
                placeholder="Nome do coordenador"
              />
            </div>
          </CardContent>
        </Card>

        {/* Gerente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-primary" />
              Gerente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="manager">Nome do Gerente</Label>
              <Input
                id="manager"
                value={intermediary.manager_name || ''}
                onChange={(e) => updateField('manager_name', e.target.value)}
                placeholder="Nome do gerente"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
