import { FileText, Home, BarChart3, Settings, Bell, User } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo ve Başlık */}
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <FileText size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Fatura Sistemi</h1>
              <p className="text-xs text-gray-500">Yönetim Paneli</p>
            </div>
          </div>

          {/* Navigasyon Menüsü */}
          <nav className="hidden md:flex items-center gap-1">
            <a 
              href="/" 
              className="flex items-center gap-2 px-4 py-2 text-blue-600 bg-blue-50 rounded-lg font-medium transition-colors"
            >
              <Home size={18} />
              Ana Sayfa
            </a>
            <a 
              href="/raporlar" 
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <BarChart3 size={18} />
              Raporlar
            </a>
            <a 
              href="/ayarlar" 
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Settings size={18} />
              Ayarlar
            </a>
          </nav>

          {/* Kullanıcı Bölümü */}
          <div className="flex items-center gap-3">
            {/* Bildirimler */}
            <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                3
              </span>
            </button>

            {/* Kullanıcı Profili */}
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
              <div className="bg-blue-600 p-1.5 rounded-full">
                <User size={16} className="text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700 hidden sm:block">Admin</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}