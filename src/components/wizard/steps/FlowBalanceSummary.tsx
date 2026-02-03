import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, Calculator } from 'lucide-react';
import { formatCurrency } from '@/lib/calculations';
import { cn } from '@/lib/utils';

interface FlowBalanceSummaryProps {
  totalProSolutoToPay: number;
  sumOfManualPayments: number;
  remainingBalance: number;
  isBalanced: boolean;
}

export function FlowBalanceSummary({
  totalProSolutoToPay,
  sumOfManualPayments,
  remainingBalance,
  isBalanced,
}: FlowBalanceSummaryProps) {
  return (
    <Card className={cn(
      'border-2 transition-colors',
      isBalanced 
        ? 'border-success bg-success/5' 
        : 'border-destructive bg-destructive/5'
    )}>
      <CardContent className="pt-4">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="h-5 w-5" />
          <h3 className="font-semibold">Verificação de Saldo (Modo Manual)</h3>
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Total Pró-Soluto a Pagar
            </p>
            <p className="text-lg font-bold">{formatCurrency(totalProSolutoToPay)}</p>
          </div>
          
          <div className="space-y-1 border-l border-r border-border px-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Soma das Parcelas
            </p>
            <p className="text-lg font-bold">{formatCurrency(sumOfManualPayments)}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Saldo a Distribuir
            </p>
            <div className="flex items-center justify-center gap-2">
              {isBalanced ? (
                <Badge variant="outline" className="bg-success/10 text-success border-success gap-1">
                  <CheckCircle className="h-3 w-3" />
                  {formatCurrency(0)}
                </Badge>
              ) : (
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {formatCurrency(Math.abs(remainingBalance))}
                  {remainingBalance > 0 ? ' restante' : ' excedente'}
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        {!isBalanced && (
          <p className="text-xs text-destructive mt-4 text-center">
            ⚠️ Ajuste o fluxo para que a soma das parcelas seja igual ao valor total do Pró-Soluto.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
