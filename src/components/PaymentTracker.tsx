import React, { useState } from 'react';
import { CreditCard, Plus, Trash2, Calendar, DollarSign, CheckCircle, Clock } from 'lucide-react';
import { Payment } from '../types';
import { formatCurrency, formatDate } from '../utils/calculations';
import { v4 as uuidv4 } from 'uuid';

interface PaymentTrackerProps {
  payments: Payment[];
  onPaymentsChange: (payments: Payment[]) => void;
  totalAmount: number;
  balanceDue: number;
  depositAmount?: number;
  depositPaid?: boolean;
  onDepositPaidChange?: (paid: boolean) => void;
}

const PaymentTracker: React.FC<PaymentTrackerProps> = ({
  payments,
  onPaymentsChange,
  totalAmount,
  balanceDue,
  depositAmount,
  depositPaid,
  onDepositPaidChange
}) => {
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [newPayment, setNewPayment] = useState({
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    method: 'check' as Payment['method'],
    reference: '',
    notes: ''
  });

  const addPayment = () => {
    if (newPayment.amount <= 0) {
      alert('Please enter a valid payment amount');
      return;
    }

    const payment: Payment = {
      id: uuidv4(),
      amount: newPayment.amount,
      date: new Date(newPayment.date),
      method: newPayment.method,
      reference: newPayment.reference || undefined,
      notes: newPayment.notes || undefined
    };

    onPaymentsChange([...payments, payment]);
    setNewPayment({
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      method: 'check',
      reference: '',
      notes: ''
    });
    setShowAddPayment(false);
  };

  const removePayment = (id: string) => {
    onPaymentsChange(payments.filter(p => p.id !== id));
  };

  const getPaymentMethodIcon = (method: Payment['method']) => {
    switch (method) {
      case 'cash': return '💵';
      case 'check': return '📝';
      case 'credit_card': return '💳';
      case 'bank_transfer': return '🏦';
      default: return '💰';
    }
  };

  const getPaymentMethodLabel = (method: Payment['method']) => {
    switch (method) {
      case 'cash': return 'Cash';
      case 'check': return 'Check';
      case 'credit_card': return 'Credit Card';
      case 'bank_transfer': return 'Bank Transfer';
      default: return 'Other';
    }
  };

  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const paymentProgress = totalAmount > 0 ? (totalPaid / totalAmount) * 100 : 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-green-600" />
          Payment Tracking
        </h3>
        <p className="text-sm text-gray-600 mt-1">Track deposits and payments received</p>
      </div>

      <div className="p-4 space-y-6">
        {/* Payment Summary */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalPaid)}</div>
              <div className="text-sm text-gray-600">Total Paid</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{formatCurrency(balanceDue)}</div>
              <div className="text-sm text-gray-600">Balance Due</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{paymentProgress.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Paid</div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(paymentProgress, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Deposit Tracking */}
        {depositAmount && depositAmount > 0 && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-purple-900">Deposit Required</h4>
                <p className="text-sm text-purple-700">{formatCurrency(depositAmount)} deposit</p>
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={depositPaid || false}
                  onChange={(e) => onDepositPaidChange?.(e.target.checked)}
                  className="rounded border-purple-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm font-medium text-purple-700">
                  {depositPaid ? 'Deposit Paid' : 'Mark as Paid'}
                </span>
                {depositPaid && <CheckCircle className="h-4 w-4 text-green-600" />}
              </label>
            </div>
          </div>
        )}

        {/* Payment List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">Payment History</h4>
            <button
              onClick={() => setShowAddPayment(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Payment
            </button>
          </div>

          {payments.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <CreditCard className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No payments recorded</h4>
              <p className="text-gray-600">Add payments as they are received</p>
            </div>
          ) : (
            <div className="space-y-3">
              {payments.map((payment) => (
                <div key={payment.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{getPaymentMethodIcon(payment.method)}</div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900">{formatCurrency(payment.amount)}</span>
                          <span className="text-sm text-gray-600">via {getPaymentMethodLabel(payment.method)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          {formatDate(payment.date)}
                          {payment.reference && (
                            <>
                              <span>•</span>
                              <span>Ref: {payment.reference}</span>
                            </>
                          )}
                        </div>
                        {payment.notes && (
                          <p className="text-sm text-gray-600 mt-1">{payment.notes}</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => removePayment(payment.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Payment Form */}
        {showAddPayment && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-3">Record New Payment</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount ($)
                </label>
                <input
                  type="number"
                  value={newPayment.amount}
                  onChange={(e) => setNewPayment(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={newPayment.date}
                  onChange={(e) => setNewPayment(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method
                </label>
                <select
                  value={newPayment.method}
                  onChange={(e) => setNewPayment(prev => ({ ...prev, method: e.target.value as Payment['method'] }))}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reference
                </label>
                <input
                  type="text"
                  value={newPayment.reference}
                  onChange={(e) => setNewPayment(prev => ({ ...prev, reference: e.target.value }))}
                  placeholder="Check #, Transaction ID, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  value={newPayment.notes}
                  onChange={(e) => setNewPayment(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Optional notes about this payment"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowAddPayment(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addPayment}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Add Payment
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentTracker;