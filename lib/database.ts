import { supabase } from './supabase';
import { Fis } from '@/types/database';

export async function getFisler(): Promise<Fis[]> {
  const { data, error } = await supabase
    .from('fisler')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

export async function getFis(id: string): Promise<Fis | null> {
  const { data, error } = await supabase
    .from('fisler')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function createFis(fis: Omit<Fis, 'id' | 'created_at' | 'updated_at'>): Promise<Fis> {
  const { data, error } = await supabase
    .from('fisler')
    .insert([fis])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateFis(id: string, updates: Partial<Omit<Fis, 'id' | 'created_at'>>): Promise<Fis> {
  const { data, error } = await supabase
    .from('fisler')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function deleteFis(id: string): Promise<void> {
  const { error } = await supabase
    .from('fisler')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}