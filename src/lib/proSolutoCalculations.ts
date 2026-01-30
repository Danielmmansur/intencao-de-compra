import type { ApprovalLetter, SimulationParams, Property, Campaign, Client } from '@/types/proposal';
import { getEmpreendimentoById, calculateMonthlyConstructionFee } from '@/data/empreendimentos';

export interface ProSolutoFlowRow {
  month: number;
  date: string;
  proSolutoPayment: number;
  constructionFee: number;
  total: number;
  incomeCommitmentPercentage: number;
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

export interface IncomeBasedFlowResult {
  flow: ProSolutoFlowRow[];
  totalPaid: number;
  residualBalance: number;
  hasResidualBalance: boolean;
  monthlyIncomeCeiling: number;
  commitmentPercentage: number;
  monthsToPayOff: number;
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

/**
 * Calculate income commitment percentage based on guarantor status
 * @param hasGuarantor - Whether the client has a guarantor
 * @returns Commitment percentage (30% or 35%)
 */
export function getCommitmentPercentage(hasGuarantor: boolean): number {
  return hasGuarantor ? 35 : 30;
}

/**
 * Calculate the monthly income ceiling for payments
 * @param totalFamilyIncome - Total family gross income
 * @param hasGuarantor - Whether the client has a guarantor
 * @returns The maximum monthly payment the client can afford
 */
export function calculateMonthlyIncomeCeiling(
  totalFamilyIncome: number,
  hasGuarantor: boolean
): number {
  const percentage = getCommitmentPercentage(hasGuarantor);
  return (totalFamilyIncome * percentage) / 100;
}

/**
 * Generate payment flow based on income commitment rules
 * The Pro Soluto payment is calculated as: Ceiling - Construction Fee
 * This ensures the total never exceeds the client's income limit
 */
export function generateIncomeBasedProSolutoFlow(
  summary: ProSolutoSummary,
  simulationParams: SimulationParams,
  totalFamilyIncome: number,
  property: Property
): IncomeBasedFlowResult {
  const flow: ProSolutoFlowRow[] = [];
  const { entry_term_months, simulation_start_date, has_guarantor } = simulationParams;
  
  const startDate = new Date(simulation_start_date);
  const empreendimento = getEmpreendimentoById(property.empreendimento_id || '');
  const constructionMonths = empreendimento?.constructionMonths || simulationParams.construction_months;
  
  // Calculate income ceiling
  const commitmentPercentage = getCommitmentPercentage(has_guarantor);
  const monthlyIncomeCeiling = calculateMonthlyIncomeCeiling(totalFamilyIncome, has_guarantor);
  
  let remainingProSoluto = summary.proSolutoTotal;
  let totalPaid = 0;
  let monthsToPayOff = 0;
  
  // Generate flow for the entry term or until Pro Soluto is paid off
  const totalMonths = Math.max(entry_term_months, constructionMonths + 6);
  
  for (let month = 1; month <= totalMonths; month++) {
    const currentDate = new Date(startDate);
    currentDate.setMonth(currentDate.getMonth() + month - 1);
    
    const isWithinEntryTerm = month <= entry_term_months;
    const isConstructionPeriod = month <= constructionMonths;
    
    // Get construction fee for this month based on empreendimento data
    let constructionFee = 0;
    if (isConstructionPeriod && summary.financedValue > 0) {
      constructionFee = calculateMonthlyConstructionFee(
        empreendimento,
        month,
        summary.financedValue
      );
    }
    
    // Calculate Pro Soluto payment based on income ceiling
    // Formula: Parcela_Pro_Soluto = Teto_Mensal - Taxa_Obra_do_Mes
    let proSolutoPayment = 0;
    if (isWithinEntryTerm && remainingProSoluto > 0) {
      const maxProSolutoThisMonth = Math.max(0, monthlyIncomeCeiling - constructionFee);
      proSolutoPayment = Math.min(maxProSolutoThisMonth, remainingProSoluto);
      remainingProSoluto -= proSolutoPayment;
      totalPaid += proSolutoPayment;
      
      if (remainingProSoluto <= 0 && monthsToPayOff === 0) {
        monthsToPayOff = month;
      }
    }
    
    const total = proSolutoPayment + constructionFee;
    
    // Calculate actual commitment percentage for this month
    const actualCommitment = totalFamilyIncome > 0 
      ? (total / totalFamilyIncome) * 100 
      : 0;
    
    // Notes
    let notes = '';
    if (month === 1) notes = 'Início da simulação';
    if (month === constructionMonths) notes = 'Previsão de Habite-se';
    if (month === constructionMonths + 1) notes = 'Taxa de obra encerrada';
    if (remainingProSoluto <= 0 && proSolutoPayment > 0) notes = 'Última parcela Pró-Soluto';
    if (month === entry_term_months && remainingProSoluto > 0) notes = 'Prazo encerrado com saldo';
    
    flow.push({
      month,
      date: currentDate.toISOString().split('T')[0],
      proSolutoPayment,
      constructionFee,
      total,
      incomeCommitmentPercentage: actualCommitment,
      notes,
    });
  }
  
  const residualBalance = Math.max(0, remainingProSoluto);
  
  return {
    flow,
    totalPaid,
    residualBalance,
    hasResidualBalance: residualBalance > 0,
    monthlyIncomeCeiling,
    commitmentPercentage,
    monthsToPayOff: monthsToPayOff || entry_term_months,
  };
}

/**
 * Legacy function for backwards compatibility
 * Use generateIncomeBasedProSolutoFlow for new implementations
 */
export function generateProSolutoFlow(
  summary: ProSolutoSummary,
  simulationParams: SimulationParams
): ProSolutoFlowRow[] {
  const { entry_term_months, construction_months, construction_rate, simulation_start_date } = simulationParams;
  
  const startDate = new Date(simulation_start_date);
  const totalMonths = Math.max(entry_term_months, construction_months + 6);
  
  // Distribute Pró-Soluto equally across entry term months
  const monthlyProSoluto = entry_term_months > 0 
    ? summary.proSolutoTotal / entry_term_months 
    : 0;
  
  const flow: ProSolutoFlowRow[] = [];
  
  for (let month = 1; month <= totalMonths; month++) {
    const currentDate = new Date(startDate);
    currentDate.setMonth(currentDate.getMonth() + month - 1);
    
    const isWithinEntryTerm = month <= entry_term_months;
    const isConstructionPeriod = month <= construction_months;
    
    const proSolutoPayment = isWithinEntryTerm ? monthlyProSoluto : 0;
    
    let constructionFee = 0;
    if (isConstructionPeriod && summary.financedValue > 0) {
      const progressPercentage = (month / construction_months) * 100;
      const releasedAmount = (summary.financedValue * progressPercentage) / 100;
      constructionFee = releasedAmount * construction_rate;
    }
    
    const total = proSolutoPayment + constructionFee;
    
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
      incomeCommitmentPercentage: 0,
      notes,
    });
  }
  
  return flow;
}
