export interface FisItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Fis {
  id: string;
  fis_no: string;
  tarih_saat: string;
  created_at: string;
  updated_at: string;
  total: number;
  total_kdv: number;
  items: FisItem[];
}

// Export database types as well
export * from './database';