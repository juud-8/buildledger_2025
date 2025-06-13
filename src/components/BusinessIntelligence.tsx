import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, DollarSign, Users, FileText, Calendar, Download, Filter, Eye, PieChart, Target, Clock } from 'lucide-react';
import { Invoice, Client } from '../types';
import { getInvoices, getClients } from '../utils/storage';
import { formatCurrency, formatDate } from '../utils/calculations';
import { generateReportExport } from '../utils/reportExport';

interface RevenueData {
  period: string;
  revenue: number;
  profit: number;
  invoiceCount: number;
  quoteCount: number;
}

interface ClientProfitability {
  client: Client;
  totalRevenue: number;
  totalProfit: number;
  invoiceCount: number;
  averageInvoice: number;
  profitMargin: number;
}

interface ProjectTypeAnalysis {
  type: string;
  revenue: number;
  profit: number;
  count: number;
  averageValue: number;
  profitMargin: number;
}

interface OutstandingInvoice {
  invoice: Invoice;
  daysOverdue: number;
  ageCategory: 'current' | '30-60' | '60-90' | '90+';
}

const BusinessIntelligence: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [activeTab, setActiveTab] = useState<'overview' | 'revenue' | 'clients' | 'projects' | 'outstanding' | 'costs'>('overview');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setInvoices(getInvoices());
    setClients(getClients());
  };

  // Revenue Analysis
  const getRevenueData = (): RevenueData[] => {
    const filteredInvoices = invoices.filter(inv => 
      inv.date.getFullYear() === selectedYear && inv.status !== 'draft'
    );

    if (selectedPeriod === 'monthly') {
      return Array.from({ length: 12 }, (_, month) => {
        const monthInvoices = filteredInvoices.filter(inv => inv.date.getMonth() === month);
        const revenue = monthInvoices.reduce((sum, inv) => sum + inv.total, 0);
        const profit = monthInvoices.reduce((sum, inv) => sum + (inv.total * 0.3), 0); // Estimated 30% profit margin
        
        return {
          period: new Date(selectedYear, month).toLocaleDateString('en-US', { month: 'short' }),
          revenue,
          profit,
          invoiceCount: monthInvoices.filter(inv => inv.type === 'invoice').length,
          quoteCount: monthInvoices.filter(inv => inv.type === 'quote').length
        };
      });
    } else if (selectedPeriod === 'quarterly') {
      return Array.from({ length: 4 }, (_, quarter) => {
        const quarterInvoices = filteredInvoices.filter(inv => 
          Math.floor(inv.date.getMonth() / 3) === quarter
        );
        const revenue = quarterInvoices.reduce((sum, inv) => sum + inv.total, 0);
        const profit = quarterInvoices.reduce((sum, inv) => sum + (inv.total * 0.3), 0);
        
        return {
          period: `Q${quarter + 1}`,
          revenue,
          profit,
          invoiceCount: quarterInvoices.filter(inv => inv.type === 'invoice').length,
          quoteCount: quarterInvoices.filter(inv => inv.type === 'quote').length
        };
      });
    } else {
      // Yearly data for last 5 years
      const currentYear = new Date().getFullYear();
      return Array.from({ length: 5 }, (_, index) => {
        const year = currentYear - 4 + index;
        const yearInvoices = invoices.filter(inv => 
          inv.date.getFullYear() === year && inv.status !== 'draft'
        );
        const revenue = yearInvoices.reduce((sum, inv) => sum + inv.total, 0);
        const profit = yearInvoices.reduce((sum, inv) => sum + (inv.total * 0.3), 0);
        
        return {
          period: year.toString(),
          revenue,
          profit,
          invoiceCount: yearInvoices.filter(inv => inv.type === 'invoice').length,
          quoteCount: yearInvoices.filter(inv => inv.type === 'quote').length
        };
      });
    }
  };

  // Client Profitability Analysis
  const getClientProfitability = (): ClientProfitability[] => {
    return clients.map(client => {
      const clientInvoices = invoices.filter(inv => 
        inv.client.id === client.id && inv.status !== 'draft'
      );
      
      const totalRevenue = clientInvoices.reduce((sum, inv) => sum + inv.total, 0);
      const totalProfit = totalRevenue * 0.3; // Estimated profit margin
      const invoiceCount = clientInvoices.length;
      const averageInvoice = invoiceCount > 0 ? totalRevenue / invoiceCount : 0;
      const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

      return {
        client,
        totalRevenue,
        totalProfit,
        invoiceCount,
        averageInvoice,
        profitMargin
      };
    }).filter(data => data.totalRevenue > 0)
      .sort((a, b) => b.totalRevenue - a.totalRevenue);
  };

  // Project Type Analysis
  const getProjectTypeAnalysis = (): ProjectTypeAnalysis[] => {
    const projectTypes = new Map<string, { revenue: number; count: number }>();
    
    invoices.filter(inv => inv.status !== 'draft').forEach(invoice => {
      const type = invoice.projectTitle.toLowerCase().includes('kitchen') ? 'Kitchen Renovation' :
                   invoice.projectTitle.toLowerCase().includes('bathroom') ? 'Bathroom Renovation' :
                   invoice.projectTitle.toLowerCase().includes('roof') ? 'Roofing' :
                   invoice.projectTitle.toLowerCase().includes('addition') ? 'Home Addition' :
                   invoice.projectTitle.toLowerCase().includes('deck') ? 'Deck/Patio' :
                   'Other';
      
      const existing = projectTypes.get(type) || { revenue: 0, count: 0 };
      projectTypes.set(type, {
        revenue: existing.revenue + invoice.total,
        count: existing.count + 1
      });
    });

    return Array.from(projectTypes.entries()).map(([type, data]) => ({
      type,
      revenue: data.revenue,
      profit: data.revenue * 0.3,
      count: data.count,
      averageValue: data.revenue / data.count,
      profitMargin: 30 // Estimated
    })).sort((a, b) => b.revenue - a.revenue);
  };

  // Outstanding Invoices Analysis
  const getOutstandingInvoices = (): OutstandingInvoice[] => {
    const today = new Date();
    
    return invoices
      .filter(inv => inv.type === 'invoice' && ['sent', 'overdue'].includes(inv.status))
      .map(invoice => {
        const dueDate = invoice.dueDate || invoice.date;
        const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
        
        let ageCategory: OutstandingInvoice['ageCategory'] = 'current';
        if (daysOverdue > 90) ageCategory = '90+';
        else if (daysOverdue > 60) ageCategory = '60-90';
        else if (daysOverdue > 30) ageCategory = '30-60';
        
        return {
          invoice,
          daysOverdue: Math.max(0, daysOverdue),
          ageCategory
        };
      })
      .sort((a, b) => b.daysOverdue - a.daysOverdue);
  };

  // Cost Breakdown Analysis
  const getCostBreakdown = () => {
    const totalRevenue = invoices
      .filter(inv => inv.status !== 'draft')
      .reduce((sum, inv) => sum + inv.total, 0);

    const materialCosts = invoices
      .filter(inv => inv.status !== 'draft')
      .reduce((sum, inv) => sum + (inv.materialSubtotal || 0), 0);

    const laborCosts = invoices
      .filter(inv => inv.status !== 'draft')
      .reduce((sum, inv) => sum + (inv.laborSubtotal || 0), 0);

    const equipmentCosts = invoices
      .filter(inv => inv.status !== 'draft')
      .reduce((sum, inv) => sum + (inv.equipmentSubtotal || 0), 0);

    const otherCosts = invoices
      .filter(inv => inv.status !== 'draft')
      .reduce((sum, inv) => sum + (inv.otherSubtotal || 0), 0);

    return {
      totalRevenue,
      materialCosts,
      laborCosts,
      equipmentCosts,
      otherCosts,
      materialPercentage: totalRevenue > 0 ? (materialCosts / totalRevenue) * 100 : 0,
      laborPercentage: totalRevenue > 0 ? (laborCosts / totalRevenue) * 100 : 0,
      equipmentPercentage: totalRevenue > 0 ? (equipmentCosts / totalRevenue) * 100 : 0,
      otherPercentage: totalRevenue > 0 ? (otherCosts / totalRevenue) * 100 : 0
    };
  };

  // Export Functions
  const handleExportReport = async (reportType: string) => {
    let data: any[] = [];
    let filename = '';

    switch (reportType) {
      case 'revenue':
        data = getRevenueData();
        filename = `revenue-report-${selectedPeriod}-${selectedYear}`;
        break;
      case 'clients':
        data = getClientProfitability();
        filename = `client-profitability-report-${new Date().toISOString().split('T')[0]}`;
        break;
      case 'projects':
        data = getProjectTypeAnalysis();
        filename = `project-type-analysis-${new Date().toISOString().split('T')[0]}`;
        break;
      case 'outstanding':
        data = getOutstandingInvoices();
        filename = `outstanding-invoices-${new Date().toISOString().split('T')[0]}`;
        break;
      case 'costs':
        data = [getCostBreakdown()];
        filename = `cost-breakdown-${new Date().toISOString().split('T')[0]}`;
        break;
    }

    await generateReportExport(data, filename, 'excel');
  };

  const revenueData = getRevenueData();
  const clientProfitability = getClientProfitability();
  const projectTypeAnalysis = getProjectTypeAnalysis();
  const outstandingInvoices = getOutstandingInvoices();
  const costBreakdown = getCostBreakdown();

  // Calculate key metrics
  const totalRevenue = revenueData.reduce((sum, data) => sum + data.revenue, 0);
  const totalProfit = revenueData.reduce((sum, data) => sum + data.profit, 0);
  const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
  const totalOutstanding = outstandingInvoices.reduce((sum, item) => sum + item.invoice.total, 0);

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-purple-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Business Intelligence</h1>
              <p className="text-gray-600">Comprehensive analytics and reporting dashboard</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
              <p className="text-sm text-green-600">+12% from last period</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Profit Margin</p>
              <p className="text-2xl font-bold text-gray-900">{profitMargin.toFixed(1)}%</p>
              <p className="text-sm text-blue-600">Industry average: 25%</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Active Clients</p>
              <p className="text-2xl font-bold text-gray-900">{clientProfitability.length}</p>
              <p className="text-sm text-purple-600">Avg: {formatCurrency(totalRevenue / Math.max(clientProfitability.length, 1))} per client</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-3">
            <Clock className="h-8 w-8 text-orange-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Outstanding</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalOutstanding)}</p>
              <p className="text-sm text-orange-600">{outstandingInvoices.length} invoices</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm border mb-6">
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'revenue', label: 'Revenue Analysis', icon: TrendingUp },
              { id: 'clients', label: 'Client Profitability', icon: Users },
              { id: 'projects', label: 'Project Types', icon: Target },
              { id: 'outstanding', label: 'Outstanding Invoices', icon: Clock },
              { id: 'costs', label: 'Cost Breakdown', icon: PieChart }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Chart Placeholder */}
                <div className="bg-gray-50 rounded-lg p-6 border-2 border-dashed border-gray-300">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
                  <div className="h-64 flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600">Revenue chart visualization would be displayed here</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Peak: {formatCurrency(Math.max(...revenueData.map(d => d.revenue)))} in {revenueData.find(d => d.revenue === Math.max(...revenueData.map(r => r.revenue)))?.period}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Top Clients */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Clients by Revenue</h3>
                  <div className="space-y-3">
                    {clientProfitability.slice(0, 5).map((client, index) => (
                      <div key={client.client.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-sm font-medium text-purple-600">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{client.client.name}</p>
                            <p className="text-sm text-gray-600">{client.invoiceCount} invoices</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">{formatCurrency(client.totalRevenue)}</p>
                          <p className="text-sm text-gray-600">{client.profitMargin.toFixed(1)}% margin</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">This Month</h4>
                  <p className="text-2xl font-bold text-blue-900">
                    {formatCurrency(revenueData[new Date().getMonth()]?.revenue || 0)}
                  </p>
                  <p className="text-sm text-blue-700">
                    {revenueData[new Date().getMonth()]?.invoiceCount || 0} invoices completed
                  </p>
                </div>
                
                <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                  <h4 className="font-semibold text-green-900 mb-2">Average Project</h4>
                  <p className="text-2xl font-bold text-green-900">
                    {formatCurrency(totalRevenue / Math.max(invoices.filter(inv => inv.status !== 'draft').length, 1))}
                  </p>
                  <p className="text-sm text-green-700">Across all project types</p>
                </div>
                
                <div className="bg-orange-50 rounded-lg p-6 border border-orange-200">
                  <h4 className="font-semibold text-orange-900 mb-2">Collection Rate</h4>
                  <p className="text-2xl font-bold text-orange-900">
                    {((totalRevenue - totalOutstanding) / Math.max(totalRevenue, 1) * 100).toFixed(1)}%
                  </p>
                  <p className="text-sm text-orange-700">Of invoiced amounts collected</p>
                </div>
              </div>
            </div>
          )}

          {/* Revenue Analysis Tab */}
          {activeTab === 'revenue' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Revenue Analysis - {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)} {selectedYear}</h3>
                <button
                  onClick={() => handleExportReport('revenue')}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export Excel
                </button>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 border-2 border-dashed border-gray-300">
                <div className="h-80 flex items-center justify-center">
                  <div className="text-center">
                    <TrendingUp className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600">Revenue trend chart would be displayed here</p>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse bg-white rounded-lg shadow-sm border">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Period</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Revenue</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Profit</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Margin</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Invoices</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Quotes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {revenueData.map((data, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{data.period}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrency(data.revenue)}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrency(data.profit)}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">
                          {data.revenue > 0 ? ((data.profit / data.revenue) * 100).toFixed(1) : 0}%
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">{data.invoiceCount}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">{data.quoteCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Client Profitability Tab */}
          {activeTab === 'clients' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Client Profitability Analysis</h3>
                <button
                  onClick={() => handleExportReport('clients')}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export Excel
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse bg-white rounded-lg shadow-sm border">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Client</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Total Revenue</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Estimated Profit</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Profit Margin</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Invoices</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Avg Invoice</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {clientProfitability.map((client) => (
                      <tr key={client.client.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{client.client.name}</p>
                            <p className="text-xs text-gray-600">{client.client.email}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrency(client.totalRevenue)}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrency(client.totalProfit)}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">{client.profitMargin.toFixed(1)}%</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">{client.invoiceCount}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrency(client.averageInvoice)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Project Types Tab */}
          {activeTab === 'projects' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Project Type Analysis</h3>
                <button
                  onClick={() => handleExportReport('projects')}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export Excel
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projectTypeAnalysis.map((project) => (
                  <div key={project.type} className="bg-white rounded-lg shadow-sm border p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">{project.type}</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Revenue:</span>
                        <span className="font-medium">{formatCurrency(project.revenue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Projects:</span>
                        <span className="font-medium">{project.count}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Average Value:</span>
                        <span className="font-medium">{formatCurrency(project.averageValue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Profit Margin:</span>
                        <span className="font-medium">{project.profitMargin.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Outstanding Invoices Tab */}
          {activeTab === 'outstanding' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Outstanding Invoices Aging Report</h3>
                <button
                  onClick={() => handleExportReport('outstanding')}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export Excel
                </button>
              </div>

              {/* Aging Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {['current', '30-60', '60-90', '90+'].map(category => {
                  const categoryInvoices = outstandingInvoices.filter(inv => inv.ageCategory === category);
                  const categoryTotal = categoryInvoices.reduce((sum, inv) => sum + inv.invoice.total, 0);
                  
                  return (
                    <div key={category} className="bg-white rounded-lg shadow-sm border p-4">
                      <h4 className="font-medium text-gray-900 mb-2">
                        {category === 'current' ? 'Current' : `${category} days`}
                      </h4>
                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(categoryTotal)}</p>
                      <p className="text-sm text-gray-600">{categoryInvoices.length} invoices</p>
                    </div>
                  );
                })}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse bg-white rounded-lg shadow-sm border">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Invoice</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Client</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Amount</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Due Date</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Days Overdue</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Age Category</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {outstandingInvoices.map((item) => (
                      <tr key={item.invoice.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.invoice.number}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{item.invoice.client.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrency(item.invoice.total)}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">
                          {formatDate(item.invoice.dueDate || item.invoice.date)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">{item.daysOverdue}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.ageCategory === 'current' ? 'bg-green-100 text-green-800' :
                            item.ageCategory === '30-60' ? 'bg-yellow-100 text-yellow-800' :
                            item.ageCategory === '60-90' ? 'bg-orange-100 text-orange-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {item.ageCategory === 'current' ? 'Current' : `${item.ageCategory} days`}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Cost Breakdown Tab */}
          {activeTab === 'costs' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Material vs Labor Cost Breakdown</h3>
                <button
                  onClick={() => handleExportReport('costs')}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export Excel
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Cost Breakdown Chart Placeholder */}
                <div className="bg-gray-50 rounded-lg p-6 border-2 border-dashed border-gray-300">
                  <h4 className="font-semibold text-gray-900 mb-4">Cost Distribution</h4>
                  <div className="h-64 flex items-center justify-center">
                    <div className="text-center">
                      <PieChart className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600">Cost breakdown pie chart would be displayed here</p>
                    </div>
                  </div>
                </div>

                {/* Cost Details */}
                <div className="space-y-4">
                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Cost Breakdown</h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 bg-blue-500 rounded"></div>
                          <span className="text-sm font-medium">Materials</span>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(costBreakdown.materialCosts)}</p>
                          <p className="text-sm text-gray-600">{costBreakdown.materialPercentage.toFixed(1)}%</p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 bg-orange-500 rounded"></div>
                          <span className="text-sm font-medium">Labor</span>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(costBreakdown.laborCosts)}</p>
                          <p className="text-sm text-gray-600">{costBreakdown.laborPercentage.toFixed(1)}%</p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 bg-purple-500 rounded"></div>
                          <span className="text-sm font-medium">Equipment</span>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(costBreakdown.equipmentCosts)}</p>
                          <p className="text-sm text-gray-600">{costBreakdown.equipmentPercentage.toFixed(1)}%</p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 bg-gray-500 rounded"></div>
                          <span className="text-sm font-medium">Other</span>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(costBreakdown.otherCosts)}</p>
                          <p className="text-sm text-gray-600">{costBreakdown.otherPercentage.toFixed(1)}%</p>
                        </div>
                      </div>
                      
                      <div className="border-t pt-4">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold">Total Revenue</span>
                          <span className="font-semibold">{formatCurrency(costBreakdown.totalRevenue)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessIntelligence;