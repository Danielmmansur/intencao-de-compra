import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "./input";

interface PhoneInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: string;
  onChange: (value: string) => void;
}

export function PhoneInput({ 
  value, 
  onChange, 
  className,
  ...props 
}: PhoneInputProps) {
  function formatPhone(val: string): string {
    const cleaned = val.replace(/\D/g, '').slice(0, 11);
    
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 7) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
    if (cleaned.length <= 10) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const formatted = formatPhone(e.target.value);
    onChange(formatted);
  }

  return (
    <Input
      {...props}
      type="tel"
      value={value}
      onChange={handleChange}
      placeholder="(00) 00000-0000"
      maxLength={15}
      className={cn(className)}
    />
  );
}
