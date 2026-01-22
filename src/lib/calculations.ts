import type { 
  Client, 
  ApprovalLetter, 
  SimulationParams, 
  Campaign,
  PaymentFlowRow, 
  IncomeCommitment,
  ConstructionPhase 
} from '@/types/proposal';

export function calculateTotalFamilyIncome(clients: Client[]): number {
  return clients.reduce((sum, client) => sum + (client.monthly_income || 0), 0);
}

export function calculateEffectiveEntry(
  approvalLetter: ApprovalLetter,
  campaigns: Campaign[]
): number {
  let effectiveEntry = approvalLetter.entry_value || 0;
  
  for (const campaign of campaigns) {
    if (campaign.status === 'aprovada' && campaign.discount_value) {
      if (campaign.discount_type === 'fixed') {
        effectiveEntry -= campaign.discount_value;
      } else if (campaign.discount_type === 'percentage') {
        effectiveEntry -= (effectiveEntry * campaign.discount_value) / 100;
      }
    }
  }
  
  return Math.max(0, effectiveEntry);
}

export function distributeEntryPayments(
  totalEntry: number,
  params: SimulationParams
): number[] {
  const payments: number[] = [];
  const { entry_bands, entry_term_months } = params;
  
  if (!entry_bands || entry_bands.length === 0) {
    // Equal distribution
    const monthlyPayment = totalEntry / entry_term_months;
    for (let i = 0; i < entry_term_months; i++) {
      payments.push(monthlyPayment);
    }
    return payments;
  }
  
  // Distribute according to bands
  let currentMonth = 0;
  for (const band of entry_bands) {
    const bandTotal = (totalEntry * band.percentage) / 100;
    const monthlyPayment = bandTotal / band.parcels;
    
    for (let i = 0; i < band.parcels && currentMonth < entry_term_months; i++) {
      payments.push(monthlyPayment);
      currentMonth++;
    }
  }
  
  // Fill remaining months with 0 if any
  while (payments.length < entry_term_months) {
    payments.push(0);
  }
  
  return payments;
}

export function getPhaseAtMonth(
  month: number,
  phases: ConstructionPhase[],
  constructionMonths: number
): { phase: ConstructionPhase; accumulatedMonths: number } {
  let accumulatedMonths = 0;
  
  for (const phase of phases) {
    accumulatedMonths += phase.duration_months;
    if (month <= accumulatedMonths) {
      return { phase, accumulatedMonths };
    }
  }
  
  // After construction
  return { 
    phase: phases[phases.length - 1] || { 
      id: 'conclusao',
      name: 'Pós-Habite-se', 
      percentage: 100, 
      duration_months: 0 
    }, 
    accumulatedMonths: constructionMonths 
  };
}

export function calculateConstructionFee(
  accumulatedPercentage: number,
  financedValue: number,
  monthlyRate: number
): number {
  const releasedAmount = (financedValue * accumulatedPercentage) / 100;
  return releasedAmount * monthlyRate;
}

export function generatePaymentFlow(
  approvalLetter: ApprovalLetter,
  params: SimulationParams,
  campaigns: Campaign[]
): PaymentFlowRow[] {
  const flow: PaymentFlowRow[] = [];
  const effectiveEntry = calculateEffectiveEntry(approvalLetter, campaigns);
  const entryPayments = distributeEntryPayments(effectiveEntry, params);
  
  const startDate = new Date(params.simulation_start_date);
  const { construction_months, construction_phases, construction_rate } = params;
  const financedValue = approvalLetter.financed_value || 0;
  const monthlyInstallment = approvalLetter.first_installment || 0;
  
  // Calculate total months to simulate (max of entry term or construction + 12 months post)
  const totalMonths = Math.max(params.entry_term_months, construction_months + 12);
  
  let accumulatedPercentage = 0;
  let currentPhaseIndex = 0;
  let monthsInCurrentPhase = 0;
  
  for (let month = 1; month <= totalMonths; month++) {
    const currentDate = new Date(startDate);
    currentDate.setMonth(currentDate.getMonth() + month - 1);
    
    const isConstructionPeriod = month <= construction_months;
    
    // Update phase
    if (isConstructionPeriod && construction_phases.length > 0) {
      monthsInCurrentPhase++;
      const currentPhase = construction_phases[currentPhaseIndex];
      
      if (currentPhase && monthsInCurrentPhase > currentPhase.duration_months) {
        currentPhaseIndex++;
        monthsInCurrentPhase = 1;
      }
      
      const phase = construction_phases[currentPhaseIndex] || construction_phases[construction_phases.length - 1];
      accumulatedPercentage = phase?.percentage || 100;
    } else {
      accumulatedPercentage = 100;
    }
    
    // Entry payment
    const entryPayment = month <= params.entry_term_months ? (entryPayments[month - 1] || 0) : 0;
    
    // Financing installment (during construction, some models charge it)
    const financingInstallment = monthlyInstallment;
    
    // Construction fee (only during construction)
    const constructionFee = isConstructionPeriod
      ? calculateConstructionFee(accumulatedPercentage, financedValue, construction_rate)
      : 0;
    
    const total = entryPayment + financingInstallment + constructionFee;
    
    const phaseName = isConstructionPeriod
      ? (construction_phases[currentPhaseIndex]?.name || 'Obra')
      : 'Pós-Habite-se';
    
    let notes = '';
    if (month === 1) notes = 'Início da simulação';
    if (month === construction_months) notes = 'Previsão de Habite-se';
    if (month === construction_months + 1) notes = 'Taxa de obra encerrada';
    if (month === params.entry_term_months) notes = 'Última parcela da entrada';
    
    flow.push({
      month,
      date: currentDate.toISOString().split('T')[0],
      entry_payment: entryPayment,
      financing_installment: financingInstallment,
      construction_fee: constructionFee,
      total,
      phase: phaseName,
      phase_percentage: accumulatedPercentage,
      accumulated_released: (financedValue * accumulatedPercentage) / 100,
      notes,
    });
  }
  
  return flow;
}

export function calculateIncomeCommitment(
  paymentFlow: PaymentFlowRow[],
  totalFamilyIncome: number,
  constructionMonths: number,
  maxCommitmentLimit: number = 30
): IncomeCommitment {
  if (totalFamilyIncome <= 0 || paymentFlow.length === 0) {
    return { worst_phase: 0, average: 0, is_over_limit: false };
  }
  
  // Calculate commitment for construction period only
  const constructionPayments = paymentFlow.slice(0, constructionMonths);
  
  const commitments = constructionPayments.map(row => 
    (row.total / totalFamilyIncome) * 100
  );
  
  const worstPhase = Math.max(...commitments);
  const average = commitments.reduce((a, b) => a + b, 0) / commitments.length;
  
  return {
    worst_phase: worstPhase,
    average: average,
    is_over_limit: worstPhase > maxCommitmentLimit,
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}

export function parseCurrency(value: string): number {
  const cleaned = value.replace(/[^\d,.-]/g, '').replace(',', '.');
  return parseFloat(cleaned) || 0;
}

export function validateCPF(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, '');
  
  if (cleaned.length !== 11) return false;
  if (/^(\d)\1+$/.test(cleaned)) return false;
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned.charAt(9))) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned.charAt(10))) return false;
  
  return true;
}

export function formatCPF(cpf: string): string {
  const cleaned = cpf.replace(/\D/g, '');
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return phone;
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('pt-BR');
}
