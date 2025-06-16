import React, { useState, useEffect } from 'react';
import Modal from './ui/Modal';
import { useToast } from './ui/Toast';
import { FileText, Plus, Search, Edit, Trash2, Calendar, AlertCircle, CheckCircle, Clock, Upload, Eye } from 'lucide-react';
import { Permit, Inspection, PermitDocument } from '../types';
import { getPermits, savePermit, deletePermit, getInspections, saveInspection } from '../utils/constructionStorage';
import { formatDate } from '../utils/calculations';

const PermitTracker: React.FC = () => {
  const [permits, setPermits] = useState<Permit[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [filteredPermits, setFilteredPermits] = useState<Permit[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddPermit, setShowAddPermit] = useState(false);
  const [showAddInspection, setShowAddInspection] = useState(false);
  const [editingPermit, setEditingPermit] = useState<Permit | null>(null);
  const [selectedPermit, setSelectedPermit] = useState<Permit | null>(null);
  const [permitToDelete, setPermitToDelete] = useState<string | null>(null);
  const toast = useToast();

  const permitTypes = [
    { value: 'building', label: 'Building Permit', icon: '🏗️' },
    { value: 'electrical', label: 'Electrical Permit', icon: '⚡' },
    { value: 'plumbing', label: 'Plumbing Permit', icon: '🔧' },
    { value: 'mechanical', label: 'Mechanical Permit', icon: '❄️' },
    { value: 'demolition', label: 'Demolition Permit', icon: '🔨' },
    { value: 'excavation', label: 'Excavation Permit', icon: '⛏️' },
    { value: 'other', label: 'Other', icon: '📋' }
  ];

  const inspectionTypes = [
    { value: 'foundation', label: 'Foundation Inspection' },
    { value: 'framing', label: 'Framing Inspection' },
    { value: 'electrical', label: 'Electrical Inspection' },
    { value: 'plumbing', label: 'Plumbing Inspection' },
    { value: 'insulation', label: 'Insulation Inspection' },
    { value: 'drywall', label: 'Drywall Inspection' },
    { value: 'final', label: 'Final Inspection' },
    { value: 'other', label: 'Other Inspection' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterPermits();
  }, [permits, searchTerm, statusFilter]);

  const loadData = () => {
    setPermits(getPermits());
    setInspections(getInspections());
  };

  const filterPermits = () => {
    let filtered = permits;

    if (searchTerm.trim()) {
      filtered = filtered.filter(permit =>
        permit.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        permit.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        permit.authority.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(permit => permit.status === statusFilter);
    }

    setFilteredPermits(filtered);
  };

  const handleSavePermit = (permit: Permit) => {
    savePermit(permit);
    loadData();
    setShowAddPermit(false);
    setEditingPermit(null);
  };

  const handleDeletePermit = (permitId: string) => {
    setPermitToDelete(permitId);
  };

  const confirmDeletePermit = () => {
    if (permitToDelete) {
      deletePermit(permitToDelete);
      loadData();
      toast({ message: 'Permit deleted', variant: 'success' });
    }
    setPermitToDelete(null);
  };

  const handleSaveInspection = (inspection: Inspection) => {
    saveInspection(inspection);
    loadData();
    setShowAddInspection(false);
  };

  const getStatusIcon = (status: Permit['status']) => {
    switch (status) {
      case 'applied': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'expired': return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'rejected': return <AlertCircle className="h-4 w-4 text-red-600" />;
    }
  };

  const getStatusColor = (status: Permit['status']) => {
    switch (status) {
      case 'applied': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'rejected': return 'bg-red-100 text-red-800';
    }
  };

  const getTypeIcon = (type: string) => {
    return permitTypes.find(t => t.value === type)?.icon || '📋';
  };

  const getUpcomingInspections = () => {
    const today = new Date();
    const upcoming = inspections.filter(inspection => 
      inspection.status === 'scheduled' && 
      inspection.scheduledDate >= today
    ).sort((a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime());
    
    return upcoming.slice(0, 5);
  };

  const getExpiringPermits = () => {
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    return permits.filter(permit => 
      permit.status === 'approved' &&
      permit.expiryDate &&
      permit.expiryDate <= thirtyDaysFromNow &&
      permit.expiryDate >= today
    );
  };

  const upcomingInspections = getUpcomingInspections();
  const expiringPermits = getExpiringPermits();

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-green-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Permit & Inspection Tracker</h1>
              <p className="text-gray-600">Manage permits and track inspection schedules</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => setShowAddInspection(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Schedule Inspection
            </button>
            <button
              onClick={() => setShowAddPermit(true)}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 shadow-sm"
            >
              <Plus className="h-5 w-5" />
              Add Permit
            </button>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {(upcomingInspections.length > 0 || expiringPermits.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {upcomingInspections.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Inspections
              </h3>
              <div className="space-y-3">
                {upcomingInspections.map(inspection => (
                  <div key={inspection.id} className="flex items-center justify-between bg-white p-3 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 capitalize">{inspection.type} Inspection</p>
                      <p className="text-sm text-gray-600">Inspector: {inspection.inspector}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-blue-900">{formatDate(inspection.scheduledDate)}</p>
                      <p className="text-sm text-gray-600">Permit #{permits.find(p => p.id === inspection.permitId)?.number}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {expiringPermits.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-orange-900 mb-4 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Expiring Permits
              </h3>
              <div className="space-y-3">
                {expiringPermits.map(permit => (
                  <div key={permit.id} className="flex items-center justify-between bg-white p-3 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{permit.number}</p>
                      <p className="text-sm text-gray-600 capitalize">{permit.type} Permit</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-orange-900">
                        Expires {formatDate(permit.expiryDate!)}
                      </p>
                      <p className="text-sm text-gray-600">{permit.authority}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search permits..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Status</option>
            <option value="applied">Applied</option>
            <option value="approved">Approved</option>
            <option value="expired">Expired</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Permits List */}
      {filteredPermits.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No permits found</h3>
          <p className="text-gray-600 mb-6">
            {permits.length === 0 
              ? 'Start tracking your project permits and inspections'
              : 'Try adjusting your search terms or filters'
            }
          </p>
          {permits.length === 0 && (
            <button
              onClick={() => setShowAddPermit(true)}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 mx-auto"
            >
              <Plus className="h-5 w-5" />
              Add Your First Permit
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPermits.map((permit) => {
            const permitInspections = inspections.filter(i => i.permitId === permit.id);
            return (
              <div key={permit.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">{getTypeIcon(permit.type)}</div>
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{permit.number}</h3>
                          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(permit.status)}`}>
                            {getStatusIcon(permit.status)}
                            {permit.status.charAt(0).toUpperCase() + permit.status.slice(1)}
                          </div>
                        </div>
                        <p className="font-medium text-gray-900 mb-1 capitalize">{permit.type} Permit</p>
                        <p className="text-gray-600 mb-2">{permit.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>Authority: {permit.authority}</span>
                          <span>Applied: {formatDate(permit.applicationDate)}</span>
                          {permit.approvalDate && (
                            <span>Approved: {formatDate(permit.approvalDate)}</span>
                          )}
                          {permit.expiryDate && (
                            <span>Expires: {formatDate(permit.expiryDate)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-lg font-semibold text-gray-900">
                          ${permit.cost.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-600">
                          {permitInspections.length} inspection{permitInspections.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setSelectedPermit(permit)}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setEditingPermit(permit)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePermit(permit.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {permitInspections.length > 0 && (
                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-900 mb-3">Recent Inspections</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {permitInspections.slice(0, 3).map(inspection => (
                          <div key={inspection.id} className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium capitalize">{inspection.type}</span>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                inspection.status === 'passed' ? 'bg-green-100 text-green-800' :
                                inspection.status === 'failed' ? 'bg-red-100 text-red-800' :
                                inspection.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {inspection.status}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600">
                              {inspection.status === 'scheduled' ? 'Scheduled' : 'Completed'}: {formatDate(
                                inspection.status === 'scheduled' ? inspection.scheduledDate : inspection.completedDate!
                              )}
                            </p>
                            <p className="text-xs text-gray-600">Inspector: {inspection.inspector}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Permit Form */}
      {(showAddPermit || editingPermit) && (
        <PermitForm
          isOpen={true}
          onClose={() => {
            setShowAddPermit(false);
            setEditingPermit(null);
          }}
          onSave={handleSavePermit}
          editingPermit={editingPermit}
          permitTypes={permitTypes}
        />
      )}

      {/* Add Inspection Form */}
      {showAddInspection && (
        <InspectionForm
          isOpen={true}
          onClose={() => setShowAddInspection(false)}
          onSave={handleSaveInspection}
          permits={permits}
          inspectionTypes={inspectionTypes}
        />
      )}

      {/* Permit Details Modal */}
      {selectedPermit && (
        <PermitDetailsModal
          permit={selectedPermit}
          inspections={inspections.filter(i => i.permitId === selectedPermit.id)}
          onClose={() => setSelectedPermit(null)}
        />
      )}

      {permitToDelete && (
        <Modal
          isOpen={true}
          title="Delete Permit"
          body="Are you sure you want to delete this permit?"
          confirmLabel="Delete"
          cancelLabel="Cancel"
          onConfirm={confirmDeletePermit}
          onCancel={() => setPermitToDelete(null)}
        />
      )}
    </div>
  );
};

// Additional components would be implemented here (PermitForm, InspectionForm, PermitDetailsModal)
// Due to length constraints, I'm showing the main component structure

export default PermitTracker;