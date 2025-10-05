import Link from 'next/link';
import { FileX, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-16">
          <div className="flex justify-center mb-6">
            <div className="rounded-full bg-gray-100 p-6">
              <FileX className="h-16 w-16 text-gray-400" />
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-slate-900 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-slate-700 mb-6">Sayfa Bulunamadı</h2>
          <p className="text-slate-600 mb-8 max-w-md mx-auto">
            Aradığınız fiş bulunamadı veya kaldırılmış olabilir. 
            Fiş numarasını kontrol edip tekrar deneyin.
          </p>
          
          <div className="space-y-4">
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Ana Sayfaya Dön
            </Link>
            
            <div className="text-sm text-slate-500">
              veya fiş listesinden doğru bir fiş seçin
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}