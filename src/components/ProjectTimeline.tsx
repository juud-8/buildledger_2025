import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Clock, CheckCircle, AlertCircle, Users, DollarSign } from 'lucide-react';
import { ProjectMilestone } from '../types';
import { getProjectMilestones, saveProjectMilestone } from '../utils/constructionStorage';
import { formatDate, formatCurrency } from '../utils/calculations';

const ProjectTimeline: React.FC = () => {
  const [milestones, setMilestones] = useState<ProjectMilestone[]>([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadMilestones();
  }, []);

  const loadMilestones = () => {
    const loaded = getProjectMilestones();
    setMilestones(loaded);
  };

  const getStatusIcon = (status: ProjectMilestone['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'in_progress': return <Clock className="h-5 w-5 text-blue-600" />;
      case 'delayed': return <AlertCircle className="h-5 w-5 text-red-600" />;
      default: return <Calendar className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: ProjectMilestone['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'delayed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Calendar className="h-8 w-8 text-purple-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Project Timeline</h1>
              <p className="text-gray-600">Track project milestones and progress</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowForm(true)}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 shadow-sm"
          >
            <Plus className="h-5 w-5" />
            Add Milestone
          </button>
        </div>
      </div>

      {/* Timeline */}
      {milestones.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No milestones yet</h3>
          <p className="text-gray-600 mb-6">Start planning your project by adding milestones</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 mx-auto"
          >
            <Plus className="h-5 w-5" />
            Add Your First Milestone
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6">
            <div className="space-y-6">
              {milestones.map((milestone, index) => (
                <div key={milestone.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
                      {getStatusIcon(milestone.status)}
                    </div>
                    {index < milestones.length - 1 && (
                      <div className="w-0.5 h-16 bg-gray-200 mt-2"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 pb-8">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{milestone.name}</h3>
                        <p className="text-sm text-gray-600">{milestone.description}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(milestone.status)}`}>
                        {milestone.status.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>Planned: {formatDate(milestone.plannedDate)}</span>
                      </div>
                      {milestone.actualDate && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle className="h-4 w-4" />
                          <span>Actual: {formatDate(milestone.actualDate)}</span>
                        </div>
                      )}
                      {milestone.billingAmount && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <DollarSign className="h-4 w-4" />
                          <span>Billing: {formatCurrency(milestone.billingAmount)}</span>
                        </div>
                      )}
                    </div>
                    
                    {milestone.assignedSubcontractors && milestone.assignedSubcontractors.length > 0 && (
                      <div className="flex items-center gap-2 mt-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          Assigned: {milestone.assignedSubcontractors.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Form Modal - Placeholder */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Add New Milestone</h3>
            <p className="text-gray-600 mb-4">Milestone form will be implemented here.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowForm(false)}
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

export default ProjectTimeline;