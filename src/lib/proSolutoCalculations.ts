import type { ApprovalLetter, SimulationParams, Property, Campaign } from '@/types/proposal';

export interface ProSolutoFlowRow {
  month: number;
  date: string;
  proSolutoPayment: number;
  constructionFee: number;
  total: number;
  notes?: string;
}

export interface ProSolutoSummary {
  saleValue: number;
  appraisalValue: number;
  subsidy: number;
  fgts: number;
  discount: number;
  documentationCost: number;
  entryValue: number;
  proSolutoTotal: number;
  financedValue: number;
}

export function calculateProSolutoSummary(
  property: Property,
  approvalLetter: ApprovalLetter,
  simulationParams: SimulationParams,
  campaigns: Campaign[]
): ProSolutoSummary {
  const saleValue = property.sale_value || 0;
  const appraisalValue = property.appraisal_value || 0;
  const subsidy = approvalLetter.subsidy || 0;
  const fgts = approvalLetter.fgts || 0;
  const financedValue = approvalLetter.financed_value || 0;
  
  // Apply campaign discounts
  let totalDiscount = simulationParams.discount || 0;
  for (const campaign of campaigns) {
    if (campaign.status === 'aprovada' && campaign.discount_value) {
      if (campaign.discount_type === 'fixed') {
        totalDiscount += campaign.discount_value;
      } else if (campaign.discount_type === 'percentage') {
        totalDiscount += (saleValue * campaign.discount_value) / 100;
      }
    }
  }
  
  const documentationCost = simulationParams.has_documentation 
    ? appraisalValue * 0.05 
    : 0;
  
  const entryValue = Math.max(0, saleValue - subsidy - fgts - totalDiscount);
  const proSolutoTotal = entryValue + documentationCost;
  
  return {
    saleValue,
    appraisalValue,
    subsidy,
    fgts,
    discount: totalDiscount,
    documentationCost,
    entryValue,
    proSolutoTotal,
    financedValue,
  };
}

export function generateProSolutoFlow(
  summary: ProSolutoSummary,
  simulationParams: SimulationParams
): ProSolutoFlowRow[] {
  const flow: ProSolutoFlowRow[] = [];
  const { entry_term_months, construction_months, construction_rate, simulation_start_date } = simulationParams;
  
  const startDate = new Date(simulation_start_date);
  const totalMonths = Math.max(entry_term_months, construction_months + 6);
  
  // Distribute Pró-Soluto equally across entry term months
  const monthlyProSoluto = entry_term_months > 0 
    ? summary.proSolutoTotal / entry_term_months 
    : 0;
  
  for (let month = 1; month <= totalMonths; month++) {
    const currentDate = new Date(startDate);
    currentDate.setMonth(currentDate.getMonth() + month - 1);
    
    const isWithinEntryTerm = month <= entry_term_months;
    const isConstructionPeriod = month <= construction_months;
    
    // Pró-Soluto payment (only during entry term)
    const proSolutoPayment = isWithinEntryTerm ? monthlyProSoluto : 0;
    
    // Construction fee calculation (based on financed value and progress)
    // Simplified: assume linear progress during construction
    let constructionFee = 0;
    if (isConstructionPeriod && summary.financedValue > 0) {
      const progressPercentage = (month / construction_months) * 100;
      const releasedAmount = (summary.financedValue * progressPercentage) / 100;
      constructionFee = releasedAmount * construction_rate;
    }
    
    const total = proSolutoPayment + constructionFee;
    
    // Notes
    let notes = '';
    if (month === 1) notes = 'Início da simulação';
    if (month === construction_months) notes = 'Previsão de Habite-se';
    if (month === construction_months + 1) notes = 'Taxa de obra encerrada';
    if (month === entry_term_months) notes = 'Última parcela Pró-Soluto';
    
    flow.push({
      month,
      date: currentDate.toISOString().split('T')[0],
      proSolutoPayment,
      constructionFee,
      total,
      notes,
    });
  }
  
  return flow;
}
