import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "./input";

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: number;
  onChange: (value: number) => void;
}

export function CurrencyInput({ 
  value, 
  onChange, 
  className,
  ...props 
}: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = React.useState(() => 
    formatCurrencyDisplay(value)
  );

  React.useEffect(() => {
    setDisplayValue(formatCurrencyDisplay(value));
  }, [value]);

  function formatCurrencyDisplay(val: number): string {
    if (val === 0) return '';
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);
  }

  function parseCurrencyValue(val: string): number {
    const cleaned = val.replace(/[^\d]/g, '');
    if (!cleaned) return 0;
    return parseInt(cleaned, 10) / 100;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const rawValue = e.target.value;
    const numericValue = parseCurrencyValue(rawValue);
    setDisplayValue(formatCurrencyDisplay(numericValue));
    onChange(numericValue);
  }

  function handleFocus(e: React.FocusEvent<HTMLInputElement>) {
    e.target.select();
  }

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
        R$
      </span>
      <Input
        {...props}
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        className={cn("pl-10 text-right font-mono tabular-nums", className)}
      />
    </div>
  );
}
