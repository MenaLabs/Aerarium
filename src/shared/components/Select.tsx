import type { SelectHTMLAttributes } from 'react';

interface Option {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Option[];
}

export function Select({ label, options, className = '', id, ...rest }: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-xs text-[var(--text-2)]">
          {label}
        </label>
      )}
      <select
        id={id}
        className={`bg-[var(--bg-base)] border border-[var(--border)] focus:border-[var(--blue)] rounded-lg px-3 py-2 text-sm outline-none text-[var(--text-1)] ${className}`}
        {...rest}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
