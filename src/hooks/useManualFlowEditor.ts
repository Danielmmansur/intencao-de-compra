import { useState, useCallback, useMemo } from 'react';
import type { ProSolutoFlowRow } from '@/lib/proSolutoCalculations';

export interface ManualFlowRow extends ProSolutoFlowRow {
  manualProSoluto?: number;
  manualConstructionFee?: number;
  manualNotes?: string;
}

interface UseManualFlowEditorProps {
  originalFlow: ProSolutoFlowRow[];
  proSolutoTotal: number;
  monthlyIncomeCeiling: number;
}

interface UseManualFlowEditorReturn {
  isManualMode: boolean;
  setIsManualMode: (value: boolean) => void;
  manualFlow: ManualFlowRow[];
  updateRow: (month: number, field: 'proSoluto' | 'constructionFee' | 'notes', value: number | string) => void;
  resetToAutomatic: () => void;
  balanceSummary: {
    totalProSolutoToPay: number;
    sumOfManualPayments: number;
    remainingBalance: number;
    isBalanced: boolean;
  };
  hasUnsavedChanges: boolean;
  getDisplayFlow: () => ManualFlowRow[];
}

export function useManualFlowEditor({
  originalFlow,
  proSolutoTotal,
  monthlyIncomeCeiling,
}: UseManualFlowEditorProps): UseManualFlowEditorReturn {
  const [isManualMode, setIsManualModeInternal] = useState(false);
  const [manualFlow, setManualFlow] = useState<ManualFlowRow[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Initialize manual flow from original when switching to manual mode
  const setIsManualMode = useCallback((value: boolean) => {
    if (value && !isManualMode) {
      // Switching TO manual mode - copy original flow
      setManualFlow(originalFlow.map(row => ({
        ...row,
        manualProSoluto: row.proSolutoPayment,
        manualConstructionFee: row.constructionFee,
        manualNotes: row.notes || '',
      })));
      setHasUnsavedChanges(false);
    }
    setIsManualModeInternal(value);
  }, [isManualMode, originalFlow]);

  const updateRow = useCallback((
    month: number,
    field: 'proSoluto' | 'constructionFee' | 'notes',
    value: number | string
  ) => {
    setManualFlow(prev => prev.map(row => {
      if (row.month !== month) return row;
      
      const updated = { ...row };
      if (field === 'proSoluto') {
        updated.manualProSoluto = typeof value === 'number' ? value : parseFloat(value as string) || 0;
      } else if (field === 'constructionFee') {
        updated.manualConstructionFee = typeof value === 'number' ? value : parseFloat(value as string) || 0;
      } else if (field === 'notes') {
        updated.manualNotes = value as string;
      }
      
      // Recalculate total for this row
      const proSoluto = updated.manualProSoluto ?? updated.proSolutoPayment;
      const constructionFee = updated.manualConstructionFee ?? updated.constructionFee;
      updated.total = proSoluto + constructionFee;
      
      // Check if this row exceeds income ceiling
      updated.incomeCommitmentPercentage = monthlyIncomeCeiling > 0 
        ? (updated.total / (monthlyIncomeCeiling / 0.3)) * 100 
        : 0;
      
      return updated;
    }));
    setHasUnsavedChanges(true);
  }, [monthlyIncomeCeiling]);

  const resetToAutomatic = useCallback(() => {
    setManualFlow([]);
    setHasUnsavedChanges(false);
    setIsManualModeInternal(false);
  }, []);

  const balanceSummary = useMemo(() => {
    const sumOfManualPayments = manualFlow.reduce(
      (sum, row) => sum + (row.manualProSoluto ?? row.proSolutoPayment), 
      0
    );
    const remainingBalance = proSolutoTotal - sumOfManualPayments;
    
    return {
      totalProSolutoToPay: proSolutoTotal,
      sumOfManualPayments,
      remainingBalance,
      isBalanced: Math.abs(remainingBalance) < 0.01, // Allow tiny floating point differences
    };
  }, [manualFlow, proSolutoTotal]);

  const getDisplayFlow = useCallback((): ManualFlowRow[] => {
    if (!isManualMode) {
      return originalFlow.map(row => ({
        ...row,
        manualProSoluto: undefined,
        manualConstructionFee: undefined,
        manualNotes: undefined,
      }));
    }
    return manualFlow;
  }, [isManualMode, originalFlow, manualFlow]);

  return {
    isManualMode,
    setIsManualMode,
    manualFlow,
    updateRow,
    resetToAutomatic,
    balanceSummary,
    hasUnsavedChanges,
    getDisplayFlow,
  };
}
