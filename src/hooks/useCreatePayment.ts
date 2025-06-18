import supabase from '../../lib/supabase';

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
