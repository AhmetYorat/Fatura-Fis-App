import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'stat' | 'list' | 'detail';
  title?: string;
  subtitle?: string;
  header?: ReactNode;
  footer?: ReactNode;
}

export function Card({ 
  children, 
  className = '', 
  variant = 'default',
  title,
  subtitle,
  header,
  footer
}: CardProps) {
  const baseClasses = 'bg-white rounded-lg shadow-sm border border-gray-200';
  
  const variantClasses = {
    default: 'p-4',
    stat: 'p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200',
    list: 'p-0 overflow-hidden',
    detail: 'p-6',
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {(header || title || subtitle) && (
        <div className={`${variant === 'list' ? 'p-4 border-b border-gray-200' : 'mb-4'}`}>
          {header || (
            <div>
              {title && (
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              )}
              {subtitle && (
                <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
              )}
            </div>
          )}
        </div>
      )}
      
      <div className={variant === 'list' ? 'p-4' : ''}>
        {children}
      </div>
      
      {footer && (
        <div className={`${variant === 'list' ? 'p-4 border-t border-gray-200' : 'mt-4'}`}>
          {footer}
        </div>
      )}
    </div>
  );
}