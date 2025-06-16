import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY as string;

const supabase = createClient(supabaseUrl, supabaseKey);

export interface CreatePaymentInput {
  invoice_id: string;
  amount: number;
  date: string;
  method: string;
  reference?: string | null;
  notes?: string | null;
}

export const useCreatePayment = () => {
  const createPayment = async (payment: CreatePaymentInput) => {
    const { error } = await supabase.from('payments').insert(payment);
    if (error) throw error;
  };

  return createPayment;
};
