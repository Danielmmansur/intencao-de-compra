// Empreendimentos data with monthly construction fee estimates
// Based on real estate development data for MCMV projects

export interface EmpreendimentoData {
  id: string;
  name: string;
  constructionMonths: number;
  // Monthly construction fee estimates as percentage of financed value released
  monthlyConstructionFees: number[];
}

// Construction fee data based on typical MCMV development progress
// These represent the estimated monthly "Taxa de Obra" as percentage
export const EMPREENDIMENTOS: EmpreendimentoData[] = [
  {
    id: 'reserva-equitativa',
    name: 'Reserva Equitativa',
    constructionMonths: 36,
    monthlyConstructionFees: [
      0.10, 0.15, 0.20, 0.25, 0.30, 0.35, 0.40, 0.45, 0.50, 0.55,
      0.60, 0.65, 0.70, 0.75, 0.80, 0.85, 0.90, 0.95, 1.00, 1.05,
      1.10, 1.15, 1.20, 1.25, 1.30, 1.35, 1.40, 1.45, 1.50, 1.50,
      1.50, 1.50, 1.45, 1.40, 1.35, 1.30,
    ],
  },
  {
    id: 'unic-primavera',
    name: 'Unic Primavera',
    constructionMonths: 30,
    monthlyConstructionFees: [
      0.12, 0.18, 0.24, 0.30, 0.36, 0.42, 0.48, 0.54, 0.60, 0.66,
      0.72, 0.78, 0.84, 0.90, 0.96, 1.02, 1.08, 1.14, 1.20, 1.26,
      1.32, 1.38, 1.44, 1.50, 1.50, 1.48, 1.44, 1.40, 1.36, 1.32,
    ],
  },
  {
    id: 'liv-primavera',
    name: 'LIV Primavera',
    constructionMonths: 28,
    monthlyConstructionFees: [
      0.15, 0.22, 0.29, 0.36, 0.43, 0.50, 0.57, 0.64, 0.71, 0.78,
      0.85, 0.92, 1.00, 1.07, 1.14, 1.21, 1.28, 1.35, 1.42, 1.50,
      1.50, 1.48, 1.45, 1.42, 1.38, 1.34, 1.30, 1.26,
    ],
  },
  {
    id: 'seleto-primavera',
    name: 'Seleto Primavera',
    constructionMonths: 32,
    monthlyConstructionFees: [
      0.11, 0.16, 0.22, 0.27, 0.33, 0.38, 0.44, 0.49, 0.55, 0.60,
      0.66, 0.71, 0.77, 0.82, 0.88, 0.93, 0.99, 1.04, 1.10, 1.15,
      1.21, 1.26, 1.32, 1.37, 1.43, 1.48, 1.50, 1.50, 1.48, 1.45,
      1.42, 1.38,
    ],
  },
  {
    id: 'unic-sao-goncalo',
    name: 'Unic São Gonçalo',
    constructionMonths: 34,
    monthlyConstructionFees: [
      0.10, 0.14, 0.19, 0.24, 0.29, 0.33, 0.38, 0.43, 0.48, 0.52,
      0.57, 0.62, 0.67, 0.71, 0.76, 0.81, 0.86, 0.90, 0.95, 1.00,
      1.05, 1.10, 1.14, 1.19, 1.24, 1.29, 1.33, 1.38, 1.43, 1.48,
      1.50, 1.50, 1.47, 1.43,
    ],
  },
  {
    id: 'prime-caxias',
    name: 'Prime Caxias',
    constructionMonths: 26,
    monthlyConstructionFees: [
      0.18, 0.26, 0.35, 0.43, 0.52, 0.60, 0.69, 0.77, 0.86, 0.94,
      1.03, 1.11, 1.20, 1.28, 1.37, 1.45, 1.50, 1.50, 1.50, 1.48,
      1.45, 1.42, 1.38, 1.34, 1.30, 1.26,
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
 * Get the construction fee percentage for a specific month
 * @param empreendimento - The selected development
 * @param month - Month number (1-indexed)
 * @returns The construction fee percentage for that month
 */
export function getMonthlyConstructionFeePercentage(
  empreendimento: EmpreendimentoData | undefined,
  month: number
): number {
  if (!empreendimento || month < 1) return 0;
  if (month > empreendimento.constructionMonths) return 0;
  return empreendimento.monthlyConstructionFees[month - 1] || 0;
}

/**
 * Calculate the actual construction fee amount for a month
 * @param empreendimento - The selected development
 * @param month - Month number (1-indexed)
 * @param financedValue - Total financed value
 * @returns The construction fee amount in currency
 */
export function calculateMonthlyConstructionFee(
  empreendimento: EmpreendimentoData | undefined,
  month: number,
  financedValue: number
): number {
  const percentage = getMonthlyConstructionFeePercentage(empreendimento, month);
  return (financedValue * percentage) / 100;
}
