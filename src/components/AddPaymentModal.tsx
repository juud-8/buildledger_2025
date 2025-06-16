import React, { useState } from 'react';
import { CreditCard, X, Save } from 'lucide-react';
import { Invoice, Payment } from '../types';
import { useCreatePayment } from '../hooks/useCreatePayment';
import { saveInvoice } from '../utils/storage';
import { v4 as uuidv4 } from 'uuid';

interface AddPaymentModalProps {
  invoice: Invoice;
  isOpen: boolean;
  onClose: () => void;
  onPaymentAdded?: () => void;
}

const AddPaymentModal: React.FC<AddPaymentModalProps> = ({ invoice, isOpen, onClose, onPaymentAdded }) => {
  const createPayment = useCreatePayment();
  const [form, setForm] = useState({
    amount: invoice.balanceDue,
    date: new Date().toISOString().split('T')[0],
    method: 'check' as Payment['method'],
    reference: '',
    notes: ''
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (form.amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    setSaving(true);
    try {
      await createPayment({
        invoice_id: invoice.id,
        amount: form.amount,
        date: new Date(form.date).toISOString(),
        method: form.method,
        reference: form.reference || null,
        notes: form.notes || null
      });

      const newPayment: Payment = {
        id: uuidv4(),
        amount: form.amount,
        date: new Date(form.date),
        method: form.method,
        reference: form.reference || undefined,
        notes: form.notes || undefined
      };

      const updated = { ...invoice };
      updated.payments = [...invoice.payments, newPayment];
      updated.balanceDue = Math.max(0, Math.round((invoice.balanceDue - newPayment.amount) * 100) / 100);
      updated.status = updated.balanceDue > 0 ? 'partial_paid' : 'paid';
      saveInvoice(updated);
      onPaymentAdded?.();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to record payment');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-lg">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            <h3 className="font-semibold">Add Payment</h3>
          </div>
          <button onClick={onClose} className="text-green-100 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <input
              type="number"
              value={form.amount}
              onChange={e => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={form.date}
              onChange={e => setForm({ ...form, date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
            <select
              value={form.method}
              onChange={e => setForm({ ...form, method: e.target.value as Payment['method'] })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="check">Check</option>
              <option value="cash">Cash</option>
              <option value="credit_card">Credit Card</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reference</label>
            <input
              type="text"
              value={form.reference}
              onChange={e => setForm({ ...form, reference: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <input
              type="text"
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div className="flex justify-end gap-3 mt-2">
            <button onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Add Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPaymentModal;
