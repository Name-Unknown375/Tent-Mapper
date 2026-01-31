import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  tooltip?: string;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  tooltip,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary:
      'bg-brand-green text-brand-cream hover:bg-brand-green-light focus:ring-brand-green',
    secondary:
      'bg-brand-pink text-brand-green hover:bg-brand-pink-dark focus:ring-brand-pink',
    outline:
      'border-2 border-brand-green text-brand-green hover:bg-brand-green hover:text-brand-cream focus:ring-brand-green',
    ghost:
      'text-brand-green hover:bg-brand-green/10 focus:ring-brand-green',
    danger:
      'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  const button = (
    <button className={classes} disabled={disabled} {...props}>
      {children}
    </button>
  );

  if (tooltip) {
    return (
      <div className="tooltip" data-tooltip={tooltip}>
        {button}
      </div>
    );
  }

  return button;
};
