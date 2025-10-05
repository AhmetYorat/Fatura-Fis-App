import { FileText, DollarSign, TrendingUp, Calendar, Percent } from 'lucide-react';

export interface StatsData {
  total_records: number;
  total_amount: number;
  total_kdv: number;
  average_amount: number;
  today_records: number;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
  isLoading?: boolean;
}

export function StatCard({ title, value, icon: Icon, description, isLoading }: StatCardProps) {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
            <div className="h-8 bg-gray-200 rounded animate-pulse w-16"></div>
          </div>
          <div className="rounded-full p-2 bg-slate-50">
            <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        {description && (
          <div className="mt-2 h-3 bg-gray-200 rounded animate-pulse w-24"></div>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-[1px]">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold tabular-nums text-gray-900">
            {value}
          </p>
        </div>
        <div className="rounded-full p-2 bg-slate-50">
          <Icon size={20} className="text-gray-600" />
        </div>
      </div>
      {description && (
        <p className="mt-2 text-xs text-gray-500">{description}</p>
      )}
    </div>
  );
}

interface StatsGridProps {
  stats: StatsData | null;
  isLoading: boolean;
  error?: string | null;
}

export function StatsGrid({ stats, isLoading, error }: StatsGridProps) {
  // Para formatı
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2
    }).format(amount);
  };

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
        <p className="text-red-600 text-sm">İstatistik yüklenirken hata: {error}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <StatCard
        title="Toplam Kayıt"
        value={stats?.total_records || 0}
        icon={FileText}
        description="Sistemdeki toplam fiş sayısı"
        isLoading={isLoading}
      />
      
      <StatCard
        title="Toplam Tutar"
        value={stats ? formatCurrency(stats.total_amount) : '₺0,00'}
        icon={DollarSign}
        description="Tüm fişlerin toplam tutarı"
        isLoading={isLoading}
      />
      
      <StatCard
        title="Toplam KDV"
        value={stats ? formatCurrency(stats.total_kdv) : '₺0,00'}
        icon={Percent}
        description="Toplam KDV tutarı"
        isLoading={isLoading}
      />
      
      <StatCard
        title="Bugünkü Kayıtlar"
        value={stats?.today_records || 0}
        icon={Calendar}
        description="Bugün eklenen fiş sayısı"
        isLoading={isLoading}
      />
      
      <StatCard
        title="Ortalama Tutar"
        value={stats ? formatCurrency(stats.average_amount) : '₺0,00'}
        icon={TrendingUp}
        description="Fiş başına ortalama tutar"
        isLoading={isLoading}
      />
    </div>
  );
}