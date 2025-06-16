import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import supabase from '../lib/supabaseClient';
import { Invoice } from '../types';
import { getInvoices, getInvoiceById, saveInvoice } from '../utils/storage';
import { useOfflineSync } from './useOfflineSync';

const parseInvoice = (inv: any): Invoice => ({
  ...inv,
  date: new Date(inv.date),
  dueDate: inv.dueDate ? new Date(inv.dueDate) : undefined,
  expiryDate: inv.expiryDate ? new Date(inv.expiryDate) : undefined,
  createdAt: new Date(inv.createdAt),
  updatedAt: new Date(inv.updatedAt),
  client: { ...inv.client, createdAt: new Date(inv.client.createdAt) },
  payments: inv.payments ? inv.payments.map((p: any) => ({ ...p, date: new Date(p.date) })) : [],
  changeOrders: inv.changeOrders ? inv.changeOrders.map((c: any) => ({
    ...c,
    date: new Date(c.date),
    approvedDate: c.approvedDate ? new Date(c.approvedDate) : undefined,
  })) : [],
  progressBilling: inv.progressBilling ? inv.progressBilling.map((p: any) => ({
    ...p,
    dueDate: p.dueDate ? new Date(p.dueDate) : undefined,
    billedDate: p.billedDate ? new Date(p.billedDate) : undefined,
    paidDate: p.paidDate ? new Date(p.paidDate) : undefined,
  })) : [],
});

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

