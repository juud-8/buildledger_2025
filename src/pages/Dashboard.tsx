import React, { useState, useEffect } from 'react';
import { Building2, FileText, Users, Settings, Package, Wrench, Calendar, UserCheck, BarChart3, Cloud, TrendingUp, FileCheck } from 'lucide-react';
import InvoiceForm from '../components/InvoiceForm';
import InvoiceList from '../components/InvoiceList';
import ClientManagement from '../components/ClientManagement';
import MaterialDatabase from '../components/MaterialDatabase';
import LaborRateCalculator from '../components/LaborRateCalculator';
import PermitTracker from '../components/PermitTracker';
import SubcontractorManagement from '../components/SubcontractorManagement';
import ProjectTimeline from '../components/ProjectTimeline';
import WeatherTracker from '../components/WeatherTracker';
import BusinessIntelligence from '../components/BusinessIntelligence';
import DocumentEnhancements from '../components/DocumentEnhancements';
import MobileNavigation from '../components/MobileNavigation';
import OfflineIndicator from '../components/OfflineIndicator';
import { Invoice } from '../types';

type Page = 'invoices' | 'invoice-list' | 'clients' | 'materials' | 'labor' | 'permits' | 'subcontractors' | 'timeline' | 'weather' | 'analytics' | 'documents' | 'settings';

function Dashboard() {
  const [currentPage, setCurrentPage] = useState<Page>('invoices');
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

  // Register service worker for offline functionality
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('SW registered: ', registration);
          })
          .catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }
  }, []);

  const handleEditInvoice = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setCurrentPage('invoices');
  };

  const handleCreateNew = () => {
    setEditingInvoice(null);
    setCurrentPage('invoices');
  };

  const handleInvoiceUpdated = () => {
    // Refresh the invoice list if we're on that page
    if (currentPage === 'invoice-list') {
      // The InvoiceList component will handle its own refresh
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'invoices':
        return (
          <InvoiceForm 
            editingInvoice={editingInvoice} 
            onInvoiceUpdated={handleInvoiceUpdated}
          />
        );
      case 'invoice-list':
        return (
          <InvoiceList 
            onEditInvoice={handleEditInvoice}
            onCreateNew={handleCreateNew}
          />
        );
      case 'clients':
        return <ClientManagement />;
      case 'materials':
        return <MaterialDatabase />;
      case 'labor':
        return <LaborRateCalculator />;
      case 'permits':
        return <PermitTracker />;
      case 'subcontractors':
        return <SubcontractorManagement />;
      case 'timeline':
        return <ProjectTimeline />;
      case 'weather':
        return <WeatherTracker />;
      case 'analytics':
        return <BusinessIntelligence />;
      case 'documents':
        return <DocumentEnhancements />;
      case 'settings':
        return (
          <div className="max-w-6xl mx-auto p-4 md:p-6">
            <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
              <Settings className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Settings</h2>
              <p className="text-gray-600">Settings and configuration options coming soon</p>
            </div>
          </div>
        );
      default:
        return (
          <InvoiceForm 
            editingInvoice={editingInvoice} 
            onInvoiceUpdated={handleInvoiceUpdated}
          />
        );
    }
  };

  const navigationItems = [
    { id: 'invoices', name: 'Create Document', icon: FileText, category: 'core' },
    { id: 'invoice-list', name: 'Manage Documents', icon: FileText, category: 'core' },
    { id: 'clients', name: 'Clients', icon: Users, category: 'core' },
    { id: 'documents', name: 'Document Suite', icon: FileCheck, category: 'core' },
    { id: 'analytics', name: 'Business Intelligence', icon: TrendingUp, category: 'analytics' },
    { id: 'materials', name: 'Material Database', icon: Package, category: 'construction' },
    { id: 'labor', name: 'Labor Rates', icon: Wrench, category: 'construction' },
    { id: 'permits', name: 'Permits & Inspections', icon: Calendar, category: 'construction' },
    { id: 'subcontractors', name: 'Subcontractors', icon: UserCheck, category: 'construction' },
    { id: 'timeline', name: 'Project Timeline', icon: BarChart3, category: 'construction' },
    { id: 'weather', name: 'Weather Delays', icon: Cloud, category: 'construction' },
    { id: 'settings', name: 'Settings', icon: Settings, category: 'core' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Offline Indicator */}
      <OfflineIndicator />

      {/* Desktop Sidebar - Hidden on Mobile */}
      <div className="hidden md:flex">
        <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
          <div className="flex items-center justify-between h-16 px-6 border-b">
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">BuildLedger</span>
            </div>
          </div>
          
          <nav className="mt-6 px-3">
            {/* Core Features */}
            <div className="mb-6">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Core Features
              </h3>
              <div className="space-y-1">
                {navigationItems.filter(item => item.category === 'core').map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentPage(item.id as Page);
                        if (item.id !== 'invoices') {
                          setEditingInvoice(null);
                        }
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors ${
                        currentPage === item.id
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {item.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Analytics */}
            <div className="mb-6">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Analytics & Reports
              </h3>
              <div className="space-y-1">
                {navigationItems.filter(item => item.category === 'analytics').map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentPage(item.id as Page);
                        if (item.id !== 'invoices') {
                          setEditingInvoice(null);
                        }
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors ${
                        currentPage === item.id
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {item.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Construction Features */}
            <div className="mb-6">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Construction Tools
              </h3>
              <div className="space-y-1">
                {navigationItems.filter(item => item.category === 'construction').map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentPage(item.id as Page);
                        if (item.id !== 'invoices') {
                          setEditingInvoice(null);
                        }
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors ${
                        currentPage === item.id
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {item.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </nav>
          
          <div className="absolute bottom-6 left-6 right-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
              <p className="text-sm font-medium text-blue-900">Professional Construction Suite</p>
              <p className="text-xs text-blue-700 mt-1">Complete invoicing, project management, and document suite for construction professionals</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 md:ml-64">
        {/* Mobile-optimized content area */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0 pt-16 md:pt-0">
          {renderPage()}
        </main>
      </div>

      {/* Mobile Navigation */}
      <MobileNavigation
        currentPage={currentPage}
        onPageChange={(page) => {
          setCurrentPage(page as Page);
          if (page !== 'invoices') {
            setEditingInvoice(null);
          }
        }}
        onCreateNew={handleCreateNew}
      />
    </div>
  );
}

export default Dashboard;
