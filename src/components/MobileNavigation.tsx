import React, { useState } from 'react';
import { FileText, Users, Settings, Plus, Menu, X, Home, Search, TrendingUp, Package, FileCheck, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { handleLogout } from '../utils/auth';

interface MobileNavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  onCreateNew: () => void;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({
  currentPage,
  onPageChange,
  onCreateNew
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navigation = [
    { id: 'invoices', name: 'Create', icon: Plus, color: 'text-blue-600' },
    { id: 'invoice-list', name: 'Documents', icon: FileText, color: 'text-green-600' },
    { id: 'analytics', name: 'Analytics', icon: TrendingUp, color: 'text-purple-600' },
    { id: 'documents', name: 'Suite', icon: FileCheck, color: 'text-orange-600' },
  ];

  const allNavigationItems = [
    { id: 'invoices', name: 'Create Document', icon: Plus, category: 'core' },
    { id: 'invoice-list', name: 'Manage Documents', icon: FileText, category: 'core' },
    { id: 'clients', name: 'Clients', icon: Users, category: 'core' },
    { id: 'documents', name: 'Document Suite', icon: FileCheck, category: 'core' },
    { id: 'analytics', name: 'Business Intelligence', icon: TrendingUp, category: 'analytics' },
    { id: 'materials', name: 'Material Database', icon: Package, category: 'construction' },
    { id: 'labor', name: 'Labor Rates', icon: Settings, category: 'construction' },
    { id: 'permits', name: 'Permits & Inspections', icon: FileText, category: 'construction' },
    { id: 'subcontractors', name: 'Subcontractors', icon: Users, category: 'construction' },
    { id: 'timeline', name: 'Project Timeline', icon: FileText, category: 'construction' },
    { id: 'weather', name: 'Weather Delays', icon: FileText, category: 'construction' },
    { id: 'settings', name: 'Settings', icon: Settings, category: 'core' },
  ];

  const handleNavigation = (pageId: string) => {
    onPageChange(pageId);
    setIsMenuOpen(false);
  };

  const onLogout = async () => {
    await handleLogout(navigate);
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Bottom Navigation Bar - Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="grid grid-cols-4 h-16">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
                  isActive 
                    ? `${item.color} bg-gray-50` 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{item.name}</span>
                {isActive && (
                  <div className={`absolute top-0 left-0 right-0 h-0.5 ${item.color.replace('text-', 'bg-')}`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={onCreateNew}
        className="md:hidden fixed bottom-20 right-4 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center z-50 hover:bg-blue-700 transition-colors active:scale-95"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-600" />
            <span className="font-bold text-gray-900">BuildLedger</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="fixed top-0 right-0 w-80 max-w-full h-full bg-white shadow-xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-4 space-y-6">
              {/* Core Features */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Core Features
                </h3>
                <div className="space-y-2">
                  {allNavigationItems.filter(item => item.category === 'core').map((item) => {
                    const Icon = item.icon;
                    const isActive = currentPage === item.id;
                    
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavigation(item.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                          isActive
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{item.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Analytics */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Analytics & Reports
                </h3>
                <div className="space-y-2">
                  {allNavigationItems.filter(item => item.category === 'analytics').map((item) => {
                    const Icon = item.icon;
                    const isActive = currentPage === item.id;
                    
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavigation(item.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                          isActive
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{item.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Construction Tools */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Construction Tools
                </h3>
                <div className="space-y-2">
                  {allNavigationItems.filter(item => item.category === 'construction').map((item) => {
                    const Icon = item.icon;
                    const isActive = currentPage === item.id;
                    
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavigation(item.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                          isActive
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{item.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            
            <div className="absolute bottom-4 left-4 right-4 space-y-2">
              <button
                onClick={() => {
                  onCreateNew();
                  setIsMenuOpen(false);
                }}
                className="w-full bg-blue-600 text-white p-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-5 w-5" />
                Create New Document
              </button>
              <button
                onClick={onLogout}
                className="w-full bg-red-600 text-white p-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-red-700 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileNavigation;