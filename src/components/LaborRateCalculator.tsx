import React, { useState, useEffect } from 'react';
import { Wrench, Plus, Search, Edit, Trash2, Calculator, Users, DollarSign, MapPin } from 'lucide-react';
import { LaborRate } from '../types';
import { getLaborRates, saveLaborRate, deleteLaborRate } from '../utils/constructionStorage';
import { formatCurrency, formatDate } from '../utils/calculations';

const LaborRateCalculator: React.FC = () => {
  const [laborRates, setLaborRates] = useState<LaborRate[]>([]);
  const [filteredRates, setFilteredRates] = useState<LaborRate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [tradeFilter, setTradeFilter] = useState<string>('all');
  const [skillFilter, setSkillFilter] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRate, setEditingRate] = useState<LaborRate | null>(null);
  const [calculator, setCalculator] = useState({
    hours: 8,
    selectedRateId: '',
    overtime: false,
    overtimeHours: 0
  });

  const trades = [
    { value: 'general', label: 'General Labor', icon: '👷' },
    { value: 'carpenter', label: 'Carpenter', icon: '🔨' },
    { value: 'electrician', label: 'Electrician', icon: '⚡' },
    { value: 'plumber', label: 'Plumber', icon: '🔧' },
    { value: 'hvac', label: 'HVAC Technician', icon: '❄️' },
    { value: 'roofer', label: 'Roofer', icon: '🏠' },
    { value: 'painter', label: 'Painter', icon: '🎨' },
    { value: 'flooring', label: 'Flooring Specialist', icon: '🪜' },
    { value: 'drywall', label: 'Drywall Installer', icon: '🧱' },
    { value: 'concrete', label: 'Concrete Worker', icon: '🏗️' },
    { value: 'landscaping', label: 'Landscaper', icon: '🌱' },
    { value: 'other', label: 'Other', icon: '🔧' }
  ];

  const skillLevels = [
    { value: 'apprentice', label: 'Apprentice', multiplier: 0.7 },
    { value: 'journeyman', label: 'Journeyman', multiplier: 1.0 },
    { value: 'master', label: 'Master', multiplier: 1.3 },
    { value: 'foreman', label: 'Foreman', multiplier: 1.5 }
  ];

  useEffect(() => {
    loadLaborRates();
  }, []);

  useEffect(() => {
    filterRates();
  }, [laborRates, searchTerm, tradeFilter, skillFilter]);

  const loadLaborRates = () => {
    const loadedRates = getLaborRates();
    setLaborRates(loadedRates);
  };

  const filterRates = () => {
    let filtered = laborRates;

    if (searchTerm.trim()) {
      filtered = filtered.filter(rate =>
        rate.region.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (tradeFilter !== 'all') {
      filtered = filtered.filter(rate => rate.trade === tradeFilter);
    }

    if (skillFilter !== 'all') {
      filtered = filtered.filter(rate => rate.skillLevel === skillFilter);
    }

    setFilteredRates(filtered);
  };

  const handleSaveRate = (rate: LaborRate) => {
    saveLaborRate(rate);
    loadLaborRates();
    setShowAddForm(false);
    setEditingRate(null);
  };

  const handleDeleteRate = (rateId: string) => {
    if (confirm('Are you sure you want to delete this labor rate?')) {
      deleteLaborRate(rateId);
      loadLaborRates();
    }
  };

  const getTradeIcon = (trade: string) => {
    return trades.find(t => t.value === trade)?.icon || '🔧';
  };

  const calculateLabor = () => {
    const selectedRate = laborRates.find(r => r.id === calculator.selectedRateId);
    if (!selectedRate) return { regular: 0, overtime: 0, total: 0, benefits: 0 };

    const regularHours = Math.min(calculator.hours, 8);
    const overtimeHours = calculator.overtime ? Math.max(calculator.hours - 8, 0) + calculator.overtimeHours : 0;
    
    const regularPay = regularHours * selectedRate.hourlyRate;
    const overtimePay = overtimeHours * selectedRate.hourlyRate * 1.5;
    const benefits = (selectedRate.benefits || 0) * calculator.hours;
    
    return {
      regular: regularPay,
      overtime: overtimePay,
      total: regularPay + overtimePay + benefits,
      benefits
    };
  };

  const laborCalculation = calculateLabor();

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Wrench className="h-8 w-8 text-orange-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Labor Rate Calculator</h1>
              <p className="text-gray-600">Manage labor rates by trade and calculate project costs</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2 shadow-sm"
          >
            <Plus className="h-5 w-5" />
            Add Labor Rate
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Labor Calculator */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calculator className="h-5 w-5 text-orange-600" />
              Labor Cost Calculator
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Labor Rate
                </label>
                <select
                  value={calculator.selectedRateId}
                  onChange={(e) => setCalculator(prev => ({ ...prev, selectedRateId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Select a rate...</option>
                  {laborRates.map(rate => (
                    <option key={rate.id} value={rate.id}>
                      {getTradeIcon(rate.trade)} {trades.find(t => t.value === rate.trade)?.label} - {rate.skillLevel} ({rate.region})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hours Worked
                </label>
                <input
                  type="number"
                  value={calculator.hours}
                  onChange={(e) => setCalculator(prev => ({ ...prev, hours: parseFloat(e.target.value) || 0 }))}
                  min="0"
                  step="0.5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="overtime"
                  checked={calculator.overtime}
                  onChange={(e) => setCalculator(prev => ({ ...prev, overtime: e.target.checked }))}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <label htmlFor="overtime" className="text-sm font-medium text-gray-700">
                  Include overtime calculation
                </label>
              </div>
              
              {calculator.overtime && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Overtime Hours
                  </label>
                  <input
                    type="number"
                    value={calculator.overtimeHours}
                    onChange={(e) => setCalculator(prev => ({ ...prev, overtimeHours: parseFloat(e.target.value) || 0 }))}
                    min="0"
                    step="0.5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              )}
            </div>
            
            {calculator.selectedRateId && (
              <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
                <h4 className="font-medium text-orange-900 mb-3">Labor Cost Breakdown</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Regular Hours:</span>
                    <span>{formatCurrency(laborCalculation.regular)}</span>
                  </div>
                  {laborCalculation.overtime > 0 && (
                    <div className="flex justify-between">
                      <span>Overtime (1.5x):</span>
                      <span>{formatCurrency(laborCalculation.overtime)}</span>
                    </div>
                  )}
                  {laborCalculation.benefits > 0 && (
                    <div className="flex justify-between">
                      <span>Benefits:</span>
                      <span>{formatCurrency(laborCalculation.benefits)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-medium text-orange-900 pt-2 border-t border-orange-200">
                    <span>Total Cost:</span>
                    <span>{formatCurrency(laborCalculation.total)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Labor Rates List */}
        <div className="lg:col-span-2">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by region..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              
              <select
                value={tradeFilter}
                onChange={(e) => setTradeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All Trades</option>
                {trades.map(trade => (
                  <option key={trade.value} value={trade.value}>
                    {trade.icon} {trade.label}
                  </option>
                ))}
              </select>
              
              <select
                value={skillFilter}
                onChange={(e) => setSkillFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All Skill Levels</option>
                {skillLevels.map(skill => (
                  <option key={skill.value} value={skill.value}>
                    {skill.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Labor Rates Grid */}
          {filteredRates.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
              <Wrench className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No labor rates found</h3>
              <p className="text-gray-600 mb-6">
                {laborRates.length === 0 
                  ? 'Start building your labor rate database by adding rates for different trades'
                  : 'Try adjusting your search terms or filters'
                }
              </p>
              {laborRates.length === 0 && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2 mx-auto"
                >
                  <Plus className="h-5 w-5" />
                  Add Your First Labor Rate
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRates.map((rate) => (
                <div key={rate.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">{getTradeIcon(rate.trade)}</div>
                      <div>
                        <h3 className="font-semibold text-gray-900 capitalize">
                          {trades.find(t => t.value === rate.trade)?.label} - {rate.skillLevel}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {rate.region}
                          </div>
                          {rate.union && (
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                              Union
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                          {formatCurrency(rate.hourlyRate)}/hr
                        </div>
                        {rate.benefits && (
                          <div className="text-sm text-gray-600">
                            +{formatCurrency(rate.benefits)}/hr benefits
                          </div>
                        )}
                        <div className="text-xs text-gray-500 mt-1">
                          Updated {formatDate(rate.lastUpdated)}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditingRate(rate)}
                          className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRate(rate.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Labor Rate Form */}
      {(showAddForm || editingRate) && (
        <LaborRateForm
          isOpen={true}
          onClose={() => {
            setShowAddForm(false);
            setEditingRate(null);
          }}
          onSave={handleSaveRate}
          editingRate={editingRate}
          trades={trades}
          skillLevels={skillLevels}
        />
      )}
    </div>
  );
};

// Labor Rate Form Component
interface LaborRateFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (rate: LaborRate) => void;
  editingRate?: LaborRate | null;
  trades: { value: string; label: string; icon: string }[];
  skillLevels: { value: string; label: string; multiplier: number }[];
}

const LaborRateForm: React.FC<LaborRateFormProps> = ({
  isOpen,
  onClose,
  onSave,
  editingRate,
  trades,
  skillLevels
}) => {
  const [formData, setFormData] = useState({
    trade: 'general' as LaborRate['trade'],
    skillLevel: 'journeyman' as LaborRate['skillLevel'],
    hourlyRate: 0,
    region: '',
    union: false,
    benefits: 0
  });

  useEffect(() => {
    if (editingRate) {
      setFormData({
        trade: editingRate.trade,
        skillLevel: editingRate.skillLevel,
        hourlyRate: editingRate.hourlyRate,
        region: editingRate.region,
        union: editingRate.union,
        benefits: editingRate.benefits || 0
      });
    }
  }, [editingRate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const rate: LaborRate = {
      id: editingRate?.id || Date.now().toString(),
      trade: formData.trade,
      skillLevel: formData.skillLevel,
      hourlyRate: formData.hourlyRate,
      region: formData.region,
      union: formData.union,
      benefits: formData.benefits || undefined,
      lastUpdated: new Date()
    };

    onSave(rate);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {editingRate ? 'Edit Labor Rate' : 'Add New Labor Rate'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trade *
              </label>
              <select
                value={formData.trade}
                onChange={(e) => setFormData(prev => ({ ...prev, trade: e.target.value as LaborRate['trade'] }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {trades.map(trade => (
                  <option key={trade.value} value={trade.value}>
                    {trade.icon} {trade.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Skill Level *
              </label>
              <select
                value={formData.skillLevel}
                onChange={(e) => setFormData(prev => ({ ...prev, skillLevel: e.target.value as LaborRate['skillLevel'] }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {skillLevels.map(skill => (
                  <option key={skill.value} value={skill.value}>
                    {skill.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hourly Rate *
              </label>
              <input
                type="number"
                value={formData.hourlyRate}
                onChange={(e) => setFormData(prev => ({ ...prev, hourlyRate: parseFloat(e.target.value) || 0 }))}
                step="0.01"
                min="0"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Region *
              </label>
              <input
                type="text"
                value={formData.region}
                onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
                placeholder="e.g., Los Angeles, CA"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Benefits (per hour)
              </label>
              <input
                type="number"
                value={formData.benefits}
                onChange={(e) => setFormData(prev => ({ ...prev, benefits: parseFloat(e.target.value) || 0 }))}
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="union"
                checked={formData.union}
                onChange={(e) => setFormData(prev => ({ ...prev, union: e.target.checked }))}
                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
              />
              <label htmlFor="union" className="text-sm font-medium text-gray-700">
                Union Labor
              </label>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              {editingRate ? 'Update' : 'Add'} Labor Rate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LaborRateCalculator;