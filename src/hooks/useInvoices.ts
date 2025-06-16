import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import supabase from '../lib/supabaseClient';
import { Invoice } from '../types';
import { getInvoices, getInvoiceById, saveInvoice } from '../utils/storage';
import { useOfflineSync } from './useOfflineSync';

const parseInvoice = (inv: Record<string, unknown>): Invoice => {
  const i = inv as any; // casting to allow access to properties

  return {
    ...i,
    date: new Date(i.date),
    dueDate: i.dueDate ? new Date(i.dueDate) : undefined,
    expiryDate: i.expiryDate ? new Date(i.expiryDate) : undefined,
    createdAt: new Date(i.createdAt),
    updatedAt: new Date(i.updatedAt),
    client: {
      ...i.client,
      createdAt: new Date(i.client?.createdAt)
    },
    payments: i.payments || [],
    changeOrders: i.changeOrders || [],
    progressBilling: i.progressBilling || []
  };
};

const fetchInvoices = async () => {
  const { data, error } = await supabase.from('invoices').select('*');
  if (error || !data) {
    return getInvoices();
  }
  return data.map(parseInvoice);
};

const fetchInvoice = async (id: string) => {
  const { data, error } = await supabase.from('invoices').select('*').eq('id', id).single();
  if (error || !data) {
    const local = getInvoiceById(id);
    if (local) return local;
    throw error || new Error('Invoice not found');
  }
  return parseInvoice(data);
};

export const useInvoices = () => useQuery({ queryKey: ['invoices'], queryFn: fetchInvoices });

export const useInvoice = (id: string) =>
  useQuery({ queryKey: ['invoice', id], queryFn: () => fetchInvoice(id) });

export const useCreateInvoice = () => {
  const queryClient = useQueryClient();
  const { saveOfflineData } = useOfflineSync();

  return useMutation({
    mutationFn: async (invoice: Invoice) => {
      const { data, error } = await supabase.from('invoices').insert(invoice).single();
      if (error || !data) throw error || new Error('Insert failed');
      return parseInvoice(data);
    },
    onMutate: async (invoice) => {
      await queryClient.cancelQueries({ queryKey: ['invoices'] });
      const previous = queryClient.getQueryData<Invoice[]>(['invoices']) || [];
      queryClient.setQueryData<Invoice[]>(['invoices'], [...previous, invoice]);
      return { previous };
    },
    onError: (_err, invoice) => {
      saveInvoice(invoice);
      saveOfflineData('invoice', invoice);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};

export const useUpdateInvoice = () => {
  const queryClient = useQueryClient();
  const { saveOfflineData } = useOfflineSync();

  return useMutation({
    mutationFn: async (invoice: Invoice) => {
      const { data, error } = await supabase
        .from('invoices')
        .update(invoice)
        .eq('id', invoice.id)
        .single();
      if (error || !data) throw error || new Error('Update failed');
      return parseInvoice(data);
    },
    onMutate: async (invoice) => {
      await queryClient.cancelQueries({ queryKey: ['invoices'] });
      const previous = queryClient.getQueryData<Invoice[]>(['invoices']) || [];
      queryClient.setQueryData<Invoice[]>(['invoices'], previous.map(i => (i.id === invoice.id ? invoice : i)));
      return { previous };
    },
    onError: (_err, invoice) => {
      saveInvoice(invoice);
      saveOfflineData('update', invoice);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};

