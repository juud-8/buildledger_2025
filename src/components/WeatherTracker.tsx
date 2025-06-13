import React, { useState, useEffect } from 'react';
import { Cloud, Plus, Calendar, DollarSign, Clock, AlertTriangle, CloudRain, Snowflake, Wind, Sun } from 'lucide-react';
import { WeatherDelay } from '../types';
import { getWeatherDelays, saveWeatherDelay } from '../utils/constructionStorage';
import { formatDate, formatCurrency } from '../utils/calculations';

const WeatherTracker: React.FC = () => {
  const [delays, setDelays] = useState<WeatherDelay[]>([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadDelays();
  }, []);

  const loadDelays = () => {
    const loaded = getWeatherDelays();
    setDelays(loaded);
  };

  const getWeatherIcon = (type: WeatherDelay['weatherType']) => {
    switch (type) {
      case 'rain': return <CloudRain className="h-5 w-5 text-blue-600" />;
      case 'snow': return <Snowflake className="h-5 w-5 text-blue-300" />;
      case 'wind': return <Wind className="h-5 w-5 text-gray-600" />;
      case 'extreme_heat': return <Sun className="h-5 w-5 text-orange-600" />;
      case 'extreme_cold': return <Snowflake className="h-5 w-5 text-blue-600" />;
      default: return <Cloud className="h-5 w-5 text-gray-500" />;
    }
  };

  const getImpactColor = (impact: WeatherDelay['impact']) => {
    switch (impact) {
      case 'minor': return 'bg-yellow-100 text-yellow-800';
      case 'moderate': return 'bg-orange-100 text-orange-800';
      case 'major': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalCost = delays.reduce((sum, delay) => sum + (delay.additionalCost || 0), 0);
  const totalDays = delays.reduce((sum, delay) => sum + delay.daysDelayed, 0);

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Cloud className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Weather Delay Tracker</h1>
              <p className="text-gray-600">Document weather-related project delays and costs</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
          >
            <Plus className="h-5 w-5" />
            Record Delay
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-3">
            <Clock className="h-8 w-8 text-orange-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Total Days Delayed</p>
              <p className="text-2xl font-bold text-gray-900">{totalDays}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-red-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Additional Costs</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalCost)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Weather Events</p>
              <p className="text-2xl font-bold text-gray-900">{delays.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Delay List */}
      {delays.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <Cloud className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No weather delays recorded</h3>
          <p className="text-gray-600 mb-6">Track weather-related delays to document project impacts</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
          >
            <Plus className="h-5 w-5" />
            Record Your First Delay
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Weather Delay History</h3>
            <div className="space-y-4">
              {delays.map((delay) => (
                <div key={delay.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getWeatherIcon(delay.weatherType)}
                      <div>
                        <h4 className="font-medium text-gray-900 capitalize">
                          {delay.weatherType.replace('_', ' ')} Event
                        </h4>
                        <p className="text-sm text-gray-600">{formatDate(delay.date)}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getImpactColor(delay.impact)}`}>
                      {delay.impact} impact
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>{delay.daysDelayed} day{delay.daysDelayed !== 1 ? 's' : ''} delayed</span>
                    </div>
                    {delay.additionalCost && delay.additionalCost > 0 && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <DollarSign className="h-4 w-4" />
                        <span>{formatCurrency(delay.additionalCost)} additional cost</span>
                      </div>
                    )}
                    {delay.affectedMilestones && delay.affectedMilestones.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>{delay.affectedMilestones.length} milestone{delay.affectedMilestones.length !== 1 ? 's' : ''} affected</span>
                      </div>
                    )}
                  </div>
                  
                  {delay.description && (
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                      {delay.description}
                    </p>
                  )}
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
            <h3 className="text-lg font-semibold mb-4">Record Weather Delay</h3>
            <p className="text-gray-600 mb-4">Weather delay form will be implemented here.</p>
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

export default WeatherTracker;