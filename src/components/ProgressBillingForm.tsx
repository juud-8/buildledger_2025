import React, { useState, useEffect } from 'react';
import { Calendar, Percent, DollarSign, Plus, Trash2, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { ProgressBilling } from '../types';
import { formatCurrency, calculateProgressPhaseAmount } from '../utils/calculations';
import { v4 as uuidv4 } from 'uuid';

interface ProgressBillingFormProps {
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  phases: ProgressBilling[];
  onPhasesChange: (phases: ProgressBilling[]) => void;
  totalAmount: number;
}

const ProgressBillingForm: React.FC<ProgressBillingFormProps> = ({
  isEnabled,
  onToggle,
  phases,
  onPhasesChange,
  totalAmount
}) => {
  const [newPhase, setNewPhase] = useState({
    phase: '',
    description: '',
    percentage: 0,
    dueDate: ''
  });

  const addPhase = () => {
    if (!newPhase.phase.trim() || newPhase.percentage <= 0) {
      alert('Please enter a phase name and percentage');
      return;
    }

    const totalPercentage = phases.reduce((sum, p) => sum + p.percentage, 0) + newPhase.percentage;
    if (totalPercentage > 100) {
      alert('Total percentage cannot exceed 100%');
      return;
    }

    const phase: ProgressBilling = {
      id: uuidv4(),
      phase: newPhase.phase,
      description: newPhase.description,
      percentage: newPhase.percentage,
      amount: calculateProgressPhaseAmount(totalAmount, newPhase.percentage),
      dueDate: newPhase.dueDate ? new Date(newPhase.dueDate) : undefined,
      status: 'pending'
    };

    onPhasesChange([...phases, phase]);
    setNewPhase({ phase: '', description: '', percentage: 0, dueDate: '' });
  };

  const updatePhase = (id: string, field: keyof ProgressBilling, value: any) => {
    const updatedPhases = phases.map(phase => {
      if (phase.id === id) {
        const updatedPhase = { ...phase, [field]: value };
        
        // Recalculate amount when percentage changes
        if (field === 'percentage') {
          updatedPhase.amount = calculateProgressPhaseAmount(totalAmount, value);
        }
        
        return updatedPhase;
      }
      return phase;
    });
    onPhasesChange(updatedPhases);
  };

  const removePhase = (id: string) => {
    onPhasesChange(phases.filter(p => p.id !== id));
  };

  const getStatusIcon = (status: ProgressBilling['status']) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'billed': return <AlertCircle className="h-4 w-4 text-blue-600" />;
      case 'paid': return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
  };

  const getStatusColor = (status: ProgressBilling['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'billed': return 'bg-blue-100 text-blue-800';
      case 'paid': return 'bg-green-100 text-green-800';
    }
  };

  const totalPercentage = phases.reduce((sum, p) => sum + p.percentage, 0);
  const totalPhaseAmount = phases.reduce((sum, p) => sum + p.amount, 0);

  // Update phase amounts when total amount changes
  useEffect(() => {
    if (phases.length > 0) {
      const updatedPhases = phases.map(phase => ({
        ...phase,
        amount: calculateProgressPhaseAmount(totalAmount, phase.percentage)
      }));
      onPhasesChange(updatedPhases);
    }
  }, [totalAmount]);

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              Progress Billing
            </h3>
            <p className="text-sm text-gray-600 mt-1">Break project into phases for milestone-based billing</p>
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isEnabled}
              onChange={(e) => onToggle(e.target.checked)}
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm font-medium text-gray-700">Enable Progress Billing</span>
          </label>
        </div>
      </div>

      {isEnabled && (
        <div className="p-4 space-y-6">
          {/* Info Box */}
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-purple-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-purple-900 mb-1">Progress Billing Setup</h4>
                <p className="text-sm text-purple-800">
                  Create billing phases based on project milestones. Each phase represents a percentage of the total project value.
                </p>
              </div>
            </div>
          </div>

          {/* Add New Phase */}
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h4 className="font-medium text-gray-900 mb-3">Add Billing Phase</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phase Name
                </label>
                <input
                  type="text"
                  value={newPhase.phase}
                  onChange={(e) => setNewPhase(prev => ({ ...prev, phase: e.target.value }))}
                  placeholder="e.g., Foundation"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={newPhase.description}
                  onChange={(e) => setNewPhase(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Phase description"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Percentage (%)
                </label>
                <input
                  type="number"
                  value={newPhase.percentage}
                  onChange={(e) => setNewPhase(prev => ({ ...prev, percentage: parseFloat(e.target.value) || 0 }))}
                  min="0"
                  max={100 - totalPercentage}
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={newPhase.dueDate}
                  onChange={(e) => setNewPhase(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-3">
              <div className="text-sm text-gray-600">
                Amount: {formatCurrency(calculateProgressPhaseAmount(totalAmount, newPhase.percentage))} 
                {totalPercentage + newPhase.percentage > 100 && (
                  <span className="text-red-600 ml-2">• Exceeds 100%</span>
                )}
              </div>
              <button
                onClick={addPhase}
                disabled={totalPercentage + newPhase.percentage > 100}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="h-4 w-4" />
                Add Phase
              </button>
            </div>
          </div>

          {/* Existing Phases */}
          {phases.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Billing Phases</h4>
              
              {phases.map((phase, index) => (
                <div key={phase.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-sm font-medium text-purple-600">
                        {index + 1}
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900">{phase.phase}</h5>
                        {phase.description && (
                          <p className="text-sm text-gray-600">{phase.description}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(phase.status)}`}>
                        {getStatusIcon(phase.status)}
                        {phase.status.charAt(0).toUpperCase() + phase.status.slice(1)}
                      </div>
                      <button
                        onClick={() => removePhase(phase.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Percentage
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={phase.percentage}
                          onChange={(e) => updatePhase(phase.id, 'percentage', parseFloat(e.target.value) || 0)}
                          min="0"
                          max="100"
                          step="0.1"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        <Percent className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Amount
                      </label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-right font-medium">
                        {formatCurrency(phase.amount)}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Due Date
                      </label>
                      <input
                        type="date"
                        value={phase.dueDate ? phase.dueDate.toISOString().split('T')[0] : ''}
                        onChange={(e) => updatePhase(phase.id, 'dueDate', e.target.value ? new Date(e.target.value) : undefined)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        value={phase.status}
                        onChange={(e) => updatePhase(phase.id, 'status', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="pending">Pending</option>
                        <option value="billed">Billed</option>
                        <option value="paid">Paid</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Summary */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Percentage:</span>
                    <span className={`font-medium ${totalPercentage === 100 ? 'text-green-600' : totalPercentage > 100 ? 'text-red-600' : 'text-yellow-600'}`}>
                      {totalPercentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="font-medium">{formatCurrency(totalPhaseAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Remaining:</span>
                    <span className="font-medium">{formatCurrency(totalAmount - totalPhaseAmount)}</span>
                  </div>
                </div>
                
                {totalPercentage !== 100 && (
                  <div className="mt-3 p-2 bg-yellow-100 border border-yellow-300 rounded text-sm text-yellow-800">
                    {totalPercentage < 100 
                      ? `Warning: Total percentage is ${totalPercentage.toFixed(1)}%. Consider adding phases to reach 100%.`
                      : `Error: Total percentage exceeds 100%. Please adjust phase percentages.`
                    }
                  </div>
                )}
              </div>
            </div>
          )}
          
          {phases.length === 0 && (
            <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No billing phases defined</h4>
              <p className="text-gray-600">Add phases above to set up milestone-based billing</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProgressBillingForm;