// Supabase Fatura Sistemi TypeScript Tipleri

export interface FisItem {
  name: string;
  quantity: number;
  unit_price: number;
  kdv: number;
  total: number;
}

export interface Fis {
  id: string;
  fis_no: string;
  tarih_saat: string; // ISO timestamp
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
  total: number;
  total_kdv: number;
  items: FisItem[];
}

// API Response tipleri
export interface FisListResponse {
  data: Fis[];
  count: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface FisStatsResponse {
  total_records: number;
  total_amount: number;
  total_kdv: number;
  today_records: number;
  average_amount: number;
}

// Form ve Filter tipleri
export interface FisFilters {
  fis_no?: string;
  date_from?: string;
  date_to?: string;
  min_amount?: number;
  max_amount?: number;
}

export interface FisPagination {
  page: number;
  per_page: number;
  sort_by?: 'tarih_saat' | 'total' | 'fis_no';
  sort_order?: 'asc' | 'desc';
}

// API Request tipleri
export interface CreateFisRequest {
  fis_no: string;
  tarih_saat: string;
  total: number;
  total_kdv: number;
  items: FisItem[];
}

export interface UpdateFisRequest extends Partial<CreateFisRequest> {
  id: string;
}

// Webhook response tipi (n8n'den gelecek)
export interface N8nWebhookResponse {
  upload: 'success' | 'error';
  message?: string;
  data?: CreateFisRequest;
}