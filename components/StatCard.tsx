import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatCard({ icon: Icon, title, value, trend, className = '' }: StatCardProps) {
  return (
    <div className={`rounded-2xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ${className}`}>
      <div className="flex items-center gap-3">
        <div className="rounded-full p-2 bg-slate-50 w-9 h-9 flex items-center justify-center text-blue-600">
          <Icon size={20} />
        </div>
        <div className="flex-1">
          <p className="text-sm text-slate-600">{title}</p>
          <p className="text-2xl font-semibold tabular-nums text-gray-900">{value}</p>
          {trend && (
            <p className={`text-sm ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </p>
          )}
        </div>
      </div>
    </div>
  );
}