// Empreendimentos data with monthly construction evolution percentages
// Based on real estate development data (Previsão de Evolução de Obra)
// Source: Planilha DADOS - jan/26 to dez/27

export interface EmpreendimentoData {
  id: string;
  name: string;
  constructionMonths: number;
  startDate: string; // Reference start date (jan/26)
  // Monthly evolution percentages (cumulative % of construction progress)
  monthlyEvolutionPercentages: number[];
}

// Construction evolution data based on the "Previsão de Evolução de Obra" spreadsheet
// These represent the cumulative % of construction progress for each month
// Starting from jan/26 through dez/27 (24 months)
export const EMPREENDIMENTOS: EmpreendimentoData[] = [
  {
    id: 'reserva-equitativa',
    name: 'Reserva Equitativa',
    constructionMonths: 18, // Until 100% at jun/27
    startDate: '2026-01-01',
    monthlyEvolutionPercentages: [
      5, 13, 21, 28, 36, 42, 49, 53, 59, 64, 69, 77,  // jan-dez/26
      85, 89, 92, 94, 96, 100, 106, 109, 113, 115, 115, 115, // jan-dez/27
    ],
  },
  {
    id: 'unic-primavera',
    name: 'Unic Primavera',
    constructionMonths: 18, // Until 100% at jun/27
    startDate: '2026-01-01',
    monthlyEvolutionPercentages: [
      7, 11, 21, 27, 35, 41, 48, 52, 57, 65, 68, 75,  // jan-dez/26
      84, 88, 93, 94, 96, 100, 106, 109, 113, 115, 115, 115, // jan-dez/27
    ],
  },
  {
    id: 'liv-primavera',
    name: 'LIV Primavera',
    constructionMonths: 18, // Until 100% at jun/27
    startDate: '2026-01-01',
    monthlyEvolutionPercentages: [
      6, 13, 18, 26, 36, 42, 49, 55, 59, 64, 69, 77,  // jan-dez/26
      85, 89, 94, 94, 96, 100, 106, 109, 113, 115, 115, 115, // jan-dez/27
    ],
  },
  {
    id: 'seleto-primavera',
    name: 'Seleto Primavera',
    constructionMonths: 18, // Until 100% at jun/27
    startDate: '2026-01-01',
    monthlyEvolutionPercentages: [
      3, 11, 21, 29, 36, 41, 48, 54, 60, 64, 70, 78,  // jan-dez/26
      83, 87, 92, 94, 96, 100, 106, 109, 113, 115, 115, 115, // jan-dez/27
    ],
  },
  {
    id: 'unic-sao-goncalo',
    name: 'Unic São Gonçalo',
    constructionMonths: 18, // Until 100% at jun/27
    startDate: '2026-01-01',
    monthlyEvolutionPercentages: [
      5, 13, 21, 25, 33, 42, 47, 53, 59, 64, 67, 74,  // jan-dez/26
      85, 89, 93, 94, 96, 100, 106, 109, 113, 115, 115, 115, // jan-dez/27
    ],
  },
  {
    id: 'prime-caxias',
    name: 'Prime Caxias',
    constructionMonths: 18, // Until 100% at jun/27 (slightly above)
    startDate: '2026-01-01',
    monthlyEvolutionPercentages: [
      4, 12, 20, 28, 34, 39, 45, 51, 59, 65, 69, 73,  // jan-dez/26
      80, 86, 97, 99, 104, 106, 110, 113, 114, 115, 115, 115, // jan-dez/27
    ],
  },
];

export function getEmpreendimentoById(id: string): EmpreendimentoData | undefined {
  return EMPREENDIMENTOS.find((e) => e.id === id);
}

export function getEmpreendimentoByName(name: string): EmpreendimentoData | undefined {
  return EMPREENDIMENTOS.find((e) => e.name === name);
}

/**
 * Get the evolution percentage for a specific month index
 * @param empreendimento - The selected development
 * @param monthIndex - Month index (0-based, starting from jan/26)
 * @returns The cumulative evolution percentage for that month
 */
export function getMonthlyEvolutionPercentage(
  empreendimento: EmpreendimentoData | undefined,
  monthIndex: number
): number {
  if (!empreendimento || monthIndex < 0) return 0;
  if (monthIndex >= empreendimento.monthlyEvolutionPercentages.length) {
    // Return the last known percentage if we're past the data range
    return empreendimento.monthlyEvolutionPercentages[empreendimento.monthlyEvolutionPercentages.length - 1] || 0;
  }
  return empreendimento.monthlyEvolutionPercentages[monthIndex] || 0;
}

/**
 * Get the month-over-month evolution delta (difference from previous month)
 * This is the incremental evolution percentage for calculating construction fees
 * @param empreendimento - The selected development
 * @param monthIndex - Month index (0-based, starting from jan/26)
 * @returns The evolution delta (percentage points) for that month
 */
export function getMonthlyEvolutionDelta(
  empreendimento: EmpreendimentoData | undefined,
  monthIndex: number
): number {
  if (!empreendimento || monthIndex < 0) return 0;
  
  const currentEvolution = getMonthlyEvolutionPercentage(empreendimento, monthIndex);
  const previousEvolution = monthIndex > 0 
    ? getMonthlyEvolutionPercentage(empreendimento, monthIndex - 1) 
    : 0;
  
  return Math.max(0, currentEvolution - previousEvolution);
}

/**
 * Calculate the construction fee for a specific month based on evolution percentage
 * Formula: Taxa_Obra = Valor_Financiamento * (Percentual_Evolução_Mês / 100) * Taxa_Juros_Mensal
 * 
 * Simplified formula used: Taxa_Obra = Valor_Financiamento * (Percentual_Acumulado / 100) * 0.009 (0.9% monthly)
 * 
 * @param empreendimento - The selected development
 * @param monthIndex - Month index (0-based)
 * @param financedValue - Total financed value
 * @param monthlyRate - Monthly interest rate (default 0.9% = 0.009)
 * @returns The construction fee amount in currency
 */
export function calculateMonthlyConstructionFee(
  empreendimento: EmpreendimentoData | undefined,
  monthIndex: number,
  financedValue: number,
  monthlyRate: number = 0.009
): number {
  const evolutionPercentage = getMonthlyEvolutionPercentage(empreendimento, monthIndex);
  // Taxa de Obra = Valor Financiado * (% Evolução Acumulada / 100) * Taxa Mensal
  return (financedValue * (evolutionPercentage / 100) * monthlyRate);
}

/**
 * Get the month index based on a date relative to the empreendimento start date
 * @param empreendimento - The selected development  
 * @param date - The target date
 * @returns Month index (0-based) or -1 if before start
 */
export function getMonthIndexFromDate(
  empreendimento: EmpreendimentoData | undefined,
  date: Date
): number {
  if (!empreendimento) return -1;
  
  const startDate = new Date(empreendimento.startDate);
  const yearDiff = date.getFullYear() - startDate.getFullYear();
  const monthDiff = date.getMonth() - startDate.getMonth();
  
  return yearDiff * 12 + monthDiff;
}
