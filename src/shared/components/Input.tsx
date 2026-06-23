import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className = '', id, ...rest }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-xs text-[var(--text-2)]">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`bg-[var(--bg-base)] border border-[var(--border)] focus:border-[var(--blue)] rounded-lg px-3 py-2 text-sm outline-none text-[var(--text-1)] ${className}`}
        {...rest}
      />
    </div>
  );
}
