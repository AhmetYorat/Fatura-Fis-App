'use client';

import { 
  Home as HomeIcon, 
  Database, 
  CheckCircle, 
  FileText,
  TrendingUp,
  DollarSign,
  Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useState } from 'react';

// Import new UI components
import { 
  Button,
  Input,
  Badge,
  Card,
  Alert,
  Skeleton,
  SkeletonCard,
  StatCard,
  DataTable
} from '@/components';

import { formatCurrency, formatDate } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [inputValue, setInputValue] = useState('');
  const [showSkeleton, setShowSkeleton] = useState(false);

  const handleTestToast = () => {
    toast.success('Toaster başarıyla çalışıyor! 🎉');
  };

  const testSupabaseConnection = async () => {
    setConnectionStatus('testing');
    
    try {
      const { data, error } = await supabase
        .from('fisler')
        .select('count')
        .limit(1);

      if (error) throw error;

      setConnectionStatus('success');
      toast.success('Supabase bağlantısı başarılı! ✅');
    } catch (error) {
      setConnectionStatus('error');
      toast.error('Supabase bağlantısı başarısız! ❌');
      console.error('Supabase error:', error);
    }
  };

  const mockTableData = [
    { id: '1', fisNo: 'FIS-001', tarih: '2025-01-03', total: 1234.56, status: 'active' },
    { id: '2', fisNo: 'FIS-002', tarih: '2025-01-02', total: 987.65, status: 'pending' },
    { id: '3', fisNo: 'FIS-003', tarih: '2025-01-01', total: 543.21, status: 'completed' },
  ];

  const tableColumns = [
    { key: 'fisNo' as const, title: 'Fiş No' },
    { key: 'tarih' as const, title: 'Tarih' },
    { 
      key: 'total' as const, 
      title: 'Toplam', 
      align: 'right' as const,
      render: (value: any) => formatCurrency(value)
    },
    { 
      key: 'status' as const, 
      title: 'Durum',
      render: (value: any) => (
        <Badge 
          variant={value === 'active' ? 'success' : value === 'pending' ? 'warning' : 'primary'}
        >
          {value === 'active' ? 'Aktif' : value === 'pending' ? 'Bekliyor' : 'Tamamlandı'}
        </Badge>
      )
    },
  ];

  return (
    <div className="space-y-8">
      {/* Ana Başlık */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-primary-600 mb-4">Fatura Dashboard</h1>
        <p className="text-gray-600 mb-8">Yeni UI bileşenleri test sayfası</p>
        
        <div className="flex items-center justify-center gap-2 bg-primary-100 text-primary-800 p-4 rounded-lg mb-6">
          <HomeIcon size={20} />
          <span>UI Bileşenleri başarıyla oluşturuldu!</span>
        </div>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={FileText}
          title="Toplam Fiş"
          value="156"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          icon={DollarSign}
          title="Toplam Tutar"
          value={formatCurrency(45678.90)}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          icon={TrendingUp}
          title="Bu Ay"
          value="23"
          trend={{ value: 5, isPositive: false }}
        />
        <StatCard
          icon={Calendar}
          title="Bugün"
          value="3"
        />
      </div>

      {/* Alert Örnekleri */}
      <Card title="Alert Bileşenleri">
        <div className="space-y-4">
          <Alert variant="success" title="Başarılı">
            İşlem başarıyla tamamlandı.
          </Alert>
          <Alert variant="warning" title="Uyarı">
            Bu işlem geri alınamaz.
          </Alert>
          <Alert variant="error" title="Hata">
            Bir hata oluştu, lütfen tekrar deneyin.
          </Alert>
          <Alert variant="info">
            Bilgi: Yeni özellikler yakında gelecek.
          </Alert>
        </div>
      </Card>

      {/* Input ve Badge Testleri */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card title="Input Bileşeni">
          <div className="space-y-4">
            <Input
              label="Test Input"
              placeholder="Bir şeyler yazın..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              helperText="Bu bir yardım metnidir"
            />
            <Input
              label="Hatalı Input"
              placeholder="Hata örneği"
              error="Bu alan gereklidir"
            />
            <Input
              type="number"
              label="Sayı Input"
              placeholder="0.00"
            />
          </div>
        </Card>

        <Card title="Badge Bileşenleri">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Varyantlar:</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="default">Default</Badge>
                <Badge variant="primary">Primary</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="danger">Danger</Badge>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2">Boyutlar:</h4>
              <div className="flex flex-wrap gap-2 items-center">
                <Badge size="sm">Small</Badge>
                <Badge size="md">Medium</Badge>
                <Badge size="lg">Large</Badge>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Skeleton Test */}
      <Card title="Skeleton Loading">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Button onClick={() => setShowSkeleton(!showSkeleton)}>
              {showSkeleton ? 'Skeleton Gizle' : 'Skeleton Göster'}
            </Button>
          </div>
          {showSkeleton && <SkeletonCard />}
        </div>
      </Card>

      {/* Data Table */}
      <Card title="Data Table">
        <DataTable
          data={mockTableData}
          columns={tableColumns}
          onRowClick={(row) => toast(`${row.fisNo} tıklandı!`)}
        />
      </Card>

      {/* Supabase Test */}
      <Card title="Supabase Bağlantı Testi">
        <div className="space-y-4">
          <p className="text-gray-600">
            Veritabanı bağlantınızı test edin.
          </p>
          
          <div className="flex items-center gap-4">
            <Button 
              onClick={testSupabaseConnection}
              isLoading={connectionStatus === 'testing'}
              className="flex items-center gap-2"
            >
              <Database size={16} />
              Test Et
            </Button>
            
            {connectionStatus === 'success' && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle size={16} />
                <span className="text-sm font-medium">Bağlantı Başarılı</span>
              </div>
            )}
            
            {connectionStatus === 'error' && (
              <div className="flex items-center gap-2 text-red-600">
                <span className="text-sm font-medium">Bağlantı Başarısız</span>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Button Tests */}
      <Card title="Button Testleri">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button variant="primary" onClick={() => toast('Primary tıklandı!')}>
              Primary
            </Button>
            <Button variant="secondary" onClick={() => toast('Secondary tıklandı!')}>
              Secondary
            </Button>
            <Button variant="outline" onClick={() => toast('Outline tıklandı!')}>
              Outline
            </Button>
            <Button variant="danger" onClick={() => toast('Danger tıklandı!')}>
              Danger
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}