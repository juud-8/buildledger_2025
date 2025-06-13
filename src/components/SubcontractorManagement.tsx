import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Edit, Trash2, Star, Phone, Mail, Calendar, Shield, Award, MapPin } from 'lucide-react';
import { Subcontractor } from '../types';
import { getSubcontractors, saveSubcontractor, deleteSubcontractor } from '../utils/constructionStorage';
import { formatDate } from '../utils/calculations';

const SubcontractorManagement: React.FC = () => {
  const [subcontractors, setSubcontractors] = useState<Subcontractor[]>([]);
  const [filteredSubcontractors, setFilteredSubcontractors] = useState<Subcontractor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTrade, setFilterTrade] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingSubcontractor, setEditingSubcontractor] = useState<Subcontractor | null>(null);

  useEffect(() => {
    loadSubcontractors();
  }, []);

  useEffect(() => {
    filterSubcontractors();
  }, [subcontractors, searchTerm, filterTrade]);

  const loadSubcontractors = () => {
    const loaded = getSubcontractors();
    setSubcontractors(loaded);
  };

  const filterSubcontractors = () => {
    let filtered = subcontractors;

    if (searchTerm.trim()) {
      filtered = filtered.filter(sub =>
        sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (filterTrade !== 'all') {
      filtered = filtered.filter(sub => sub.trade === filterTrade);
    }

    setFilteredSubcontractors(filtered);
  };

  const handleSave = (subcontractor: Subcontractor) => {
    saveSubcontractor(subcontractor);
    loadSubcontractors();
    setShowForm(false);
    setEditingSubcontractor(null);
  };

  const handleEdit = (subcontractor: Subcontractor) => {
    setEditingSubcontractor(subcontractor);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this subcontractor?')) {
      deleteSubcontractor(id);
      loadSubcontractors();
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'busy': return 'bg-yellow-100 text-yellow-800';
      case 'unavailable': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const trades = [
    'electrical', 'plumbing', 'hvac', 'carpentry', 'roofing', 'flooring',
    'painting', 'drywall', 'concrete', 'landscaping', 'masonry', 'other'
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Subcontractor Management</h1>
              <p className="text-gray-600">Manage your network of trusted subcontractors</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
          >
            <Plus className="h-5 w-5" />
            Add Subcontractor
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
              placeholder="Search by name, company, or specialty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterTrade}
            onChange={(e) => setFilterTrade(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Trades</option>
            {trades.map(trade => (
              <option key={trade} value={trade}>
                {trade.charAt(0).toUpperCase() + trade.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Subcontractor List */}
      {filteredSubcontractors.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No subcontractors found</h3>
          <p className="text-gray-600 mb-6">Start building your network of trusted subcontractors</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
          >
            <Plus className="h-5 w-5" />
            Add Your First Subcontractor
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubcontractors.map((subcontractor) => (
            <div key={subcontractor.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{subcontractor.name}</h3>
                    <p className="text-sm text-gray-600">{subcontractor.company}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {renderStars(subcontractor.rating)}
                      <span className="text-sm text-gray-500 ml-1">({subcontractor.rating}/5)</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(subcontractor)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(subcontractor.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600 capitalize">{subcontractor.trade}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(subcontractor.status)}`}>
                      {subcontractor.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <a href={`tel:${subcontractor.phone}`} className="hover:text-blue-600">
                      {subcontractor.phone}
                    </a>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <a href={`mailto:${subcontractor.email}`} className="hover:text-blue-600">
                      {subcontractor.email}
                    </a>
                  </div>
                  
                  {subcontractor.location && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>{subcontractor.location}</span>
                    </div>
                  )}
                  
                  <div className="pt-2 border-t">
                    <p className="text-xs text-gray-500">Specialties:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {subcontractor.specialties.slice(0, 3).map((specialty, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          {specialty}
                        </span>
                      ))}
                      {subcontractor.specialties.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          +{subcontractor.specialties.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal - Placeholder for now */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
            <h3 className="text-lg font-semibold mb-4">
              {editingSubcontractor ? 'Edit Subcontractor' : 'Add New Subcontractor'}
            </h3>
            <p className="text-gray-600 mb-4">Subcontractor form will be implemented here.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingSubcontractor(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubcontractorManagement;