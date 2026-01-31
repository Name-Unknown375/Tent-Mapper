import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helpText,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-brand-green mb-1">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-2 rounded-lg border-2 border-brand-green/30 bg-white text-brand-green placeholder:text-brand-green/50 focus:outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 transition-all ${
          error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
        } ${className}`}
        {...props}
      />
      {helpText && !error && (
        <p className="mt-1 text-sm text-brand-green/60">{helpText}</p>
      )}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  options,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-brand-green mb-1">
          {label}
        </label>
      )}
      <select
        className={`w-full px-4 py-2 rounded-lg border-2 border-brand-green/30 bg-white text-brand-green focus:outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 transition-all ${
          error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
        } ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};
