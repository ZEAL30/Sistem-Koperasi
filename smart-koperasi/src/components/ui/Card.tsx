import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'subtle' | 'emerald' | 'glass' | 'admin';
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  noPadding = false,
  className = '',
  ...props
}) => {
  const variantClass = variant !== 'default' ? `card-${variant}` : '';
  const paddingClass = noPadding ? 'card-no-padding' : '';

  return (
    <div
      className={`card ${variantClass} ${paddingClass} ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
};
