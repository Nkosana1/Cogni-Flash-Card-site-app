import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  primary?: boolean;
  secondary?: boolean;
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export default function Button({
  primary = false,
  secondary = false,
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseStyles = 'font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95';
  
  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const variantStyles = primary
    ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg hover:shadow-xl'
    : secondary
    ? 'bg-white text-primary-600 border-2 border-primary-600 hover:bg-primary-50'
    : 'bg-gray-200 text-gray-800 hover:bg-gray-300';

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

