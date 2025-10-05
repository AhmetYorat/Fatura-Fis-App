import { ReactNode } from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

interface AlertProps {
  children: ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  onClose?: () => void;
  className?: string;
}

export function Alert({ 
  children, 
  variant = 'info', 
  title, 
  onClose,
  className = '' 
}: AlertProps) {
  const variants = {
    info: {
      containerClass: 'bg-blue-50 border-blue-200 text-blue-800',
      iconClass: 'text-blue-400',
      icon: Info,
    },
    success: {
      containerClass: 'bg-green-50 border-green-200 text-green-800',
      iconClass: 'text-green-400',
      icon: CheckCircle,
    },
    warning: {
      containerClass: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      iconClass: 'text-yellow-400',
      icon: AlertTriangle,
    },
    error: {
      containerClass: 'bg-red-50 border-red-200 text-red-800',
      iconClass: 'text-red-400',
      icon: AlertCircle,
    },
  };

  const { containerClass, iconClass, icon: Icon } = variants[variant];

  return (
    <div className={`border rounded-md p-4 ${containerClass} ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon className={`h-5 w-5 ${iconClass}`} />
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className="text-sm font-medium mb-1">{title}</h3>
          )}
          <div className="text-sm">{children}</div>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <button
              onClick={onClose}
              className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${iconClass} hover:bg-white hover:bg-opacity-20`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}