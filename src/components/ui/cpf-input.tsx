import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "./input";
import { validateCPF } from "@/lib/calculations";

interface CPFInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: string;
  onChange: (value: string) => void;
  showValidation?: boolean;
}

export function CPFInput({ 
  value, 
  onChange, 
  showValidation = true,
  className,
  ...props 
}: CPFInputProps) {
  const [isValid, setIsValid] = React.useState(true);

  function formatCPF(val: string): string {
    const cleaned = val.replace(/\D/g, '').slice(0, 11);
    
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`;
    if (cleaned.length <= 9) return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`;
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const formatted = formatCPF(e.target.value);
    onChange(formatted);
    
    const cleaned = formatted.replace(/\D/g, '');
    if (cleaned.length === 11) {
      setIsValid(validateCPF(cleaned));
    } else {
      setIsValid(true);
    }
  }

  const cleaned = value.replace(/\D/g, '');
  const showError = showValidation && cleaned.length === 11 && !isValid;

  return (
    <div className="space-y-1">
      <Input
        {...props}
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="000.000.000-00"
        maxLength={14}
        className={cn(
          showError && "border-destructive focus-visible:ring-destructive",
          className
        )}
      />
      {showError && (
        <p className="text-xs text-destructive">CPF inválido</p>
      )}
    </div>
  );
}
