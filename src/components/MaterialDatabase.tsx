import React, { useState, useEffect } from 'react';
import Modal from './ui/Modal';
import { useToast } from './ui/Toast';
import { Package, Plus, Search, Edit, Trash2, TrendingUp, DollarSign, Calendar, Building2 } from 'lucide-react';
import { MaterialItem, PriceHistory } from '../types';
import { getMaterialDatabase, saveMaterialItem, deleteMaterialItem } from '../utils/constructionStorage';
import { formatCurrency, formatDate } from '../utils/calculations';

const MaterialDatabase: React.FC = () => {
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<MaterialItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<MaterialItem | null>(null);
  const [showPriceHistory, setShowPriceHistory] = useState<MaterialItem | null>(null);
  const [materialToDelete, setMaterialToDelete] = useState<string | null>(null);
  const toast = useToast();

  const categories = [
    { value: 'lumber', label: 'Lumber', icon: '🪵' },
    { value: 'concrete', label: 'Concrete', icon: '🏗️' },
    { value: 'drywall', label: 'Drywall', icon: '🧱' },
    { value: 'roofing', label: 'Roofing', icon: '🏠' },
    { value: 'electrical', label: 'Electrical', icon: '⚡' },
    { value: 'plumbing', label: 'Plumbing', icon: '🔧' },
    { value: 'hardware', label: 'Hardware', icon: '🔩' },
    { value: 'insulation', label: 'Insulation', icon: '🧊' },
    { value: 'flooring', label: 'Flooring', icon: '🪜' },
    { value: 'paint', label: 'Paint', icon: '🎨' },
    { value: 'other', label: 'Other', icon: '📦' }
  ];

  useEffect(() => {
    loadMaterials();
  }, []);

  useEffect(() => {
    filterMaterials();
  }, [materials, searchTerm, categoryFilter]);

  const loadMaterials = () => {
    const loadedMaterials = getMaterialDatabase();
    setMaterials(loadedMaterials);
  };

  const filterMaterials = () => {
    let filtered = materials;

    if (searchTerm.trim()) {
      filtered = filtered.filter(material =>
        material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.supplier?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(material => material.category === categoryFilter);
    }

    setFilteredMaterials(filtered);
  };

  const handleSaveMaterial = (material: MaterialItem) => {
    saveMaterialItem(material);
    loadMaterials();
    setShowAddForm(false);
    setEditingMaterial(null);
  };

  const handleDeleteMaterial = (materialId: string) => {
    setMaterialToDelete(materialId);
  };

  const confirmDeleteMaterial = () => {
    if (materialToDelete) {
      deleteMaterialItem(materialToDelete);
      loadMaterials();
      toast({ message: 'Material deleted', variant: 'success' });
    }
    setMaterialToDelete(null);
  };

  const getCategoryIcon = (category: string) => {
    return categories.find(cat => cat.value === category)?.icon || '📦';
  };

  const getPriceChange = (material: MaterialItem) => {
    if (material.priceHistory.length < 2) return null;
    
    const current = material.currentPrice;
    const previous = material.priceHistory[material.priceHistory.length - 2].price;
    const change = ((current - previous) / previous) * 100;
    
    return {
      percentage: change,
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'same'
    };
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Package className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Material Cost Database</h1>
              <p className="text-gray-600">Track current pricing for construction materials</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
          >
            <Plus className="h-5 w-5" />
            Add Material
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search materials..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category.value} value={category.value}>
                {category.icon} {category.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Materials Grid */}
      {filteredMaterials.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No materials found</h3>
          <p className="text-gray-600 mb-6">
            {materials.length === 0 
              ? 'Start building your material database by adding common construction items'
              : 'Try adjusting your search terms or filters'
            }
          </p>
          {materials.length === 0 && (
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
            >
              <Plus className="h-5 w-5" />
              Add Your First Material
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.map((material) => {
            const priceChange = getPriceChange(material);
            return (
              <div key={material.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{getCategoryIcon(material.category)}</div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{material.name}</h3>
                        <p className="text-sm text-gray-600 capitalize">{material.category}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setShowPriceHistory(material)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Price History"
                      >
                        <TrendingUp className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setEditingMaterial(material)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteMaterial(material.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Current Price:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold text-gray-900">
                          {formatCurrency(material.currentPrice)} / {material.unit}
                        </span>
                        {priceChange && (
                          <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                            priceChange.direction === 'up' ? 'bg-red-100 text-red-800' :
                            priceChange.direction === 'down' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {priceChange.direction === 'up' ? '↗' : priceChange.direction === 'down' ? '↘' : '→'}
                            {Math.abs(priceChange.percentage).toFixed(1)}%
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {material.supplier && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Supplier:</span>
                        <span className="font-medium">{material.supplier}</span>
                      </div>
                    )}
                    
                    {material.sku && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">SKU:</span>
                        <span className="font-mono text-xs">{material.sku}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Last Updated:</span>
                      <span>{formatDate(material.lastUpdated)}</span>
                    </div>
                    
                    {material.description && (
                      <p className="text-sm text-gray-600 mt-3 pt-3 border-t">
                        {material.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Material Form */}
      {(showAddForm || editingMaterial) && (
        <MaterialForm
          isOpen={true}
          onClose={() => {
            setShowAddForm(false);
            setEditingMaterial(null);
          }}
          onSave={handleSaveMaterial}
          editingMaterial={editingMaterial}
          categories={categories}
        />
      )}

      {/* Price History Modal */}
      {showPriceHistory && (
        <PriceHistoryModal
          material={showPriceHistory}
          onClose={() => setShowPriceHistory(null)}
        />
      )}

      {materialToDelete && (
        <Modal
          isOpen={true}
          title="Delete Material"
          body="Are you sure you want to delete this material?"
          confirmLabel="Delete"
          cancelLabel="Cancel"
          onConfirm={confirmDeleteMaterial}
          onCancel={() => setMaterialToDelete(null)}
        />
      )}
    </div>
  );
};

// Material Form Component
interface MaterialFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (material: MaterialItem) => void;
  editingMaterial?: MaterialItem | null;
  categories: { value: string; label: string; icon: string }[];
}

const MaterialForm: React.FC<MaterialFormProps> = ({
  isOpen,
  onClose,
  onSave,
  editingMaterial,
  categories
}) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'lumber' as MaterialItem['category'],
    unit: 'ea',
    currentPrice: 0,
    supplier: '',
    sku: '',
    description: ''
  });

  useEffect(() => {
    if (editingMaterial) {
      setFormData({
        name: editingMaterial.name,
        category: editingMaterial.category,
        unit: editingMaterial.unit,
        currentPrice: editingMaterial.currentPrice,
        supplier: editingMaterial.supplier || '',
        sku: editingMaterial.sku || '',
        description: editingMaterial.description || ''
      });
    }
  }, [editingMaterial]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const material: MaterialItem = {
      id: editingMaterial?.id || Date.now().toString(),
      name: formData.name,
      category: formData.category,
      unit: formData.unit,
      currentPrice: formData.currentPrice,
      supplier: formData.supplier || undefined,
      sku: formData.sku || undefined,
      description: formData.description || undefined,
      lastUpdated: new Date(),
      priceHistory: editingMaterial?.priceHistory || []
    };

    // Add to price history if price changed
    if (editingMaterial && editingMaterial.currentPrice !== formData.currentPrice) {
      material.priceHistory.push({
        date: new Date(),
        price: formData.currentPrice,
        supplier: formData.supplier || undefined
      });
    } else if (!editingMaterial) {
      material.priceHistory = [{
        date: new Date(),
        price: formData.currentPrice,
        supplier: formData.supplier || undefined
      }];
    }

    onSave(material);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {editingMaterial ? 'Edit Material' : 'Add New Material'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Material Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as MaterialItem['category'] }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.icon} {category.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit *
              </label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                placeholder="ea, sq ft, board ft, etc."
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Price *
              </label>
              <input
                type="number"
                value={formData.currentPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, currentPrice: parseFloat(e.target.value) || 0 }))}
                step="0.01"
                min="0"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supplier
              </label>
              <input
                type="text"
                value={formData.supplier}
                onChange={(e) => setFormData(prev => ({ ...prev, supplier: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SKU
              </label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {editingMaterial ? 'Update' : 'Add'} Material
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Price History Modal Component
interface PriceHistoryModalProps {
  material: MaterialItem;
  onClose: () => void;
}

const PriceHistoryModal: React.FC<PriceHistoryModalProps> = ({ material, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Price History</h2>
            <p className="text-gray-600">{material.name}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ×
          </button>
        </div>
        
        <div className="p-6">
          {material.priceHistory.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No price history available</p>
          ) : (
            <div className="space-y-4">
              {material.priceHistory
                .sort((a, b) => b.date.getTime() - a.date.getTime())
                .map((entry, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{formatCurrency(entry.price)} / {material.unit}</p>
                      <p className="text-sm text-gray-600">{formatDate(entry.date)}</p>
                      {entry.supplier && (
                        <p className="text-sm text-gray-500">Supplier: {entry.supplier}</p>
                      )}
                    </div>
                    {index < material.priceHistory.length - 1 && (
                      <div className="text-sm">
                        {entry.price > material.priceHistory[index + 1].price ? (
                          <span className="text-red-600">↗ Increase</span>
                        ) : entry.price < material.priceHistory[index + 1].price ? (
                          <span className="text-green-600">↘ Decrease</span>
                        ) : (
                          <span className="text-gray-600">→ No change</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MaterialDatabase;