export interface ExportData {
  [key: string]: unknown;
}

export const generateReportExport = async (
  data: ExportData[],
  filename: string,
  format: 'excel' | 'csv' = 'excel'
): Promise<void> => {
  if (format === 'csv') {
    await exportToCSV(data, filename);
  } else {
    await exportToExcel(data, filename);
  }
};

const exportToCSV = async (data: ExportData[], filename: string): Promise<void> => {
  if (data.length === 0) {
    alert('No data to export');
    return;
  }

  // Get all unique keys from the data
  const headers = Array.from(new Set(data.flatMap(item => Object.keys(item))));
  
  // Create CSV content
  const csvContent = [
    // Header row
    headers.join(','),
    // Data rows
    ...data.map(item => 
      headers.map(header => {
        const value = item[header];
        if (value === null || value === undefined) return '';
        
        // Handle different data types
        if (typeof value === 'object' && value.name) {
          return `"${value.name}"`;
        }
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        if (typeof value === 'number') {
          return value.toString();
        }
        return value.toString();
      }).join(',')
    )
  ].join('\n');

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

const exportToExcel = async (data: ExportData[], filename: string): Promise<void> => {
  // For now, we'll export as CSV since we don't have xlsx library
  // In a real implementation, you would use a library like xlsx or exceljs
  await exportToCSV(data, filename);
  
  // Show a message that it's exported as CSV
  alert(`Report exported as CSV file: ${filename}.csv\n\nTo get Excel format, you can open the CSV file in Excel and save as .xlsx`);
};

// Utility functions for formatting data for export
export const formatDataForExport = (
  data: Record<string, unknown>[],
  type: string
): ExportData[] => {
  switch (type) {
    case 'revenue':
      return data.map(item => ({
        'Period': item.period,
        'Revenue': item.revenue,
        'Profit': item.profit,
        'Profit Margin %': item.revenue > 0 ? ((item.profit / item.revenue) * 100).toFixed(2) : '0.00',
        'Invoice Count': item.invoiceCount,
        'Quote Count': item.quoteCount
      }));
      
    case 'clients':
      return data.map(item => ({
        'Client Name': item.client.name,
        'Email': item.client.email,
        'Phone': item.client.phone,
        'Total Revenue': item.totalRevenue,
        'Estimated Profit': item.totalProfit,
        'Profit Margin %': item.profitMargin.toFixed(2),
        'Invoice Count': item.invoiceCount,
        'Average Invoice': item.averageInvoice,
        'Client Since': item.client.createdAt.toLocaleDateString()
      }));
      
    case 'projects':
      return data.map(item => ({
        'Project Type': item.type,
        'Total Revenue': item.revenue,
        'Estimated Profit': item.profit,
        'Profit Margin %': item.profitMargin.toFixed(2),
        'Project Count': item.count,
        'Average Project Value': item.averageValue
      }));
      
    case 'outstanding':
      return data.map(item => ({
        'Invoice Number': item.invoice.number,
        'Client Name': item.invoice.client.name,
        'Client Email': item.invoice.client.email,
        'Invoice Date': item.invoice.date.toLocaleDateString(),
        'Due Date': item.invoice.dueDate ? item.invoice.dueDate.toLocaleDateString() : 'N/A',
        'Amount': item.invoice.total,
        'Days Overdue': item.daysOverdue,
        'Age Category': item.ageCategory,
        'Project Title': item.invoice.projectTitle,
        'Status': item.invoice.status
      }));
      
    case 'costs':
      return data.map(item => ({
        'Category': 'Materials',
        'Amount': item.materialCosts,
        'Percentage': item.materialPercentage.toFixed(2) + '%'
      }).concat([
        {
          'Category': 'Labor',
          'Amount': item.laborCosts,
          'Percentage': item.laborPercentage.toFixed(2) + '%'
        },
        {
          'Category': 'Equipment',
          'Amount': item.equipmentCosts,
          'Percentage': item.equipmentPercentage.toFixed(2) + '%'
        },
        {
          'Category': 'Other',
          'Amount': item.otherCosts,
          'Percentage': item.otherPercentage.toFixed(2) + '%'
        },
        {
          'Category': 'TOTAL',
          'Amount': item.totalRevenue,
          'Percentage': '100.00%'
        }
      ]));
      
    default:
      return data;
  }
};

// Generate comprehensive business report
export const generateComprehensiveReport = async (
  revenueData: ExportData[],
  clientData: ExportData[],
  projectData: ExportData[],
  outstandingData: ExportData[],
  costData: ExportData[],
  filename: string = 'comprehensive-business-report'
): Promise<void> => {
  const reportData = [
    { section: 'REVENUE ANALYSIS', data: '' },
    ...formatDataForExport(revenueData, 'revenue'),
    { section: '', data: '' },
    { section: 'CLIENT PROFITABILITY', data: '' },
    ...formatDataForExport(clientData, 'clients'),
    { section: '', data: '' },
    { section: 'PROJECT TYPE ANALYSIS', data: '' },
    ...formatDataForExport(projectData, 'projects'),
    { section: '', data: '' },
    { section: 'OUTSTANDING INVOICES', data: '' },
    ...formatDataForExport(outstandingData, 'outstanding'),
    { section: '', data: '' },
    { section: 'COST BREAKDOWN', data: '' },
    ...formatDataForExport(costData, 'costs')
  ];

  await exportToCSV(reportData, filename);
};