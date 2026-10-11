import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  fullWidth = false,
  disabled,
  className = '',
  ...props
}) => {
  const classes = [
    'btn',
    `btn-${size}`,
    disabled ? 'btn-disabled' : `btn-${variant}`,
    fullWidth ? 'btn-full' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button disabled={disabled} className={classes} {...props}>
      {icon}
      {children}
    </button>
  );
};
