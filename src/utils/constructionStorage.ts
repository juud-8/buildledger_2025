import { 
  MaterialItem, 
  LaborRate, 
  Permit, 
  Inspection,
  Subcontractor, 
  ProjectMilestone, 
  WeatherDelay 
} from '../types';

const CONSTRUCTION_STORAGE_KEYS = {
  MATERIALS: 'buildledger_materials',
  LABOR_RATES: 'buildledger_labor_rates',
  PERMITS: 'buildledger_permits',
  INSPECTIONS: 'buildledger_inspections',
  SUBCONTRACTORS: 'buildledger_subcontractors',
  PROJECT_MILESTONES: 'buildledger_project_milestones',
  WEATHER_DELAYS: 'buildledger_weather_delays'
};

// Material Database
export const getMaterialDatabase = (): MaterialItem[] => {
  const stored = localStorage.getItem(CONSTRUCTION_STORAGE_KEYS.MATERIALS);
  if (!stored) {
    // Return default materials if none exist
    return getDefaultMaterials();
  }
  
  try {
    const materials = JSON.parse(stored) as MaterialItem[];
    return materials.map(material => ({
      ...material,
      lastUpdated: new Date(material.lastUpdated),
      priceHistory: material.priceHistory
        ? material.priceHistory.map(entry => ({
          ...entry,
          date: new Date(entry.date)
        })
        : []
    }));
  } catch {
    return getDefaultMaterials();
  }
};

export const saveMaterialItem = (material: MaterialItem): void => {
  const materials = getMaterialDatabase();
  const existingIndex = materials.findIndex(m => m.id === material.id);
  
  if (existingIndex >= 0) {
    materials[existingIndex] = { ...material, lastUpdated: new Date() };
  } else {
    materials.push({ ...material, lastUpdated: new Date() });
  }
  
  localStorage.setItem(CONSTRUCTION_STORAGE_KEYS.MATERIALS, JSON.stringify(materials));
};

export const deleteMaterialItem = (materialId: string): void => {
  const materials = getMaterialDatabase().filter(m => m.id !== materialId);
  localStorage.setItem(CONSTRUCTION_STORAGE_KEYS.MATERIALS, JSON.stringify(materials));
};

// Legacy aliases for backward compatibility
export const getMaterials = getMaterialDatabase;
export const saveMaterial = saveMaterialItem;
export const deleteMaterial = deleteMaterialItem;

// Labor Rates
export const getLaborRates = (): LaborRate[] => {
  const stored = localStorage.getItem(CONSTRUCTION_STORAGE_KEYS.LABOR_RATES);
  if (!stored) {
    return getDefaultLaborRates();
  }
  
  try {
    const rates = JSON.parse(stored) as LaborRate[];
    return rates.map(rate => ({
      ...rate,
      lastUpdated: new Date(rate.lastUpdated)
    }));
  } catch {
    return getDefaultLaborRates();
  }
};

export const saveLaborRate = (rate: LaborRate): void => {
  const rates = getLaborRates();
  const existingIndex = rates.findIndex(r => r.id === rate.id);
  
  if (existingIndex >= 0) {
    rates[existingIndex] = { ...rate, lastUpdated: new Date() };
  } else {
    rates.push({ ...rate, lastUpdated: new Date() });
  }
  
  localStorage.setItem(CONSTRUCTION_STORAGE_KEYS.LABOR_RATES, JSON.stringify(rates));
};

export const deleteLaborRate = (rateId: string): void => {
  const rates = getLaborRates().filter(r => r.id !== rateId);
  localStorage.setItem(CONSTRUCTION_STORAGE_KEYS.LABOR_RATES, JSON.stringify(rates));
};

// Permits
export const getPermits = (): Permit[] => {
  const stored = localStorage.getItem(CONSTRUCTION_STORAGE_KEYS.PERMITS);
  if (!stored) return [];
  
  try {
    const permits = JSON.parse(stored) as Permit[];
    return permits.map(permit => ({
      ...permit,
      applicationDate: new Date(permit.applicationDate),
      approvalDate: permit.approvalDate ? new Date(permit.approvalDate) : undefined,
      expiryDate: permit.expiryDate ? new Date(permit.expiryDate) : undefined,
      documents: permit.documents ? permit.documents.map(doc => ({
        ...doc,
        uploadDate: new Date(doc.uploadDate)
      })) : []
    }));
  } catch {
    return [];
  }
};

export const savePermit = (permit: Permit): void => {
  const permits = getPermits();
  const existingIndex = permits.findIndex(p => p.id === permit.id);
  
  if (existingIndex >= 0) {
    permits[existingIndex] = permit;
  } else {
    permits.push(permit);
  }
  
  localStorage.setItem(CONSTRUCTION_STORAGE_KEYS.PERMITS, JSON.stringify(permits));
};

export const deletePermit = (permitId: string): void => {
  const permits = getPermits().filter(p => p.id !== permitId);
  localStorage.setItem(CONSTRUCTION_STORAGE_KEYS.PERMITS, JSON.stringify(permits));
};

// Inspections
export const getInspections = (): Inspection[] => {
  const stored = localStorage.getItem(CONSTRUCTION_STORAGE_KEYS.INSPECTIONS);
  if (!stored) return [];
  
  try {
    const inspections = JSON.parse(stored) as Inspection[];
    return inspections.map(inspection => ({
      ...inspection,
      scheduledDate: new Date(inspection.scheduledDate),
      completedDate: inspection.completedDate ? new Date(inspection.completedDate) : undefined
    }));
  } catch {
    return [];
  }
};

export const saveInspection = (inspection: Inspection): void => {
  const inspections = getInspections();
  const existingIndex = inspections.findIndex(i => i.id === inspection.id);
  
  if (existingIndex >= 0) {
    inspections[existingIndex] = inspection;
  } else {
    inspections.push(inspection);
  }
  
  localStorage.setItem(CONSTRUCTION_STORAGE_KEYS.INSPECTIONS, JSON.stringify(inspections));
};

export const deleteInspection = (inspectionId: string): void => {
  const inspections = getInspections().filter(i => i.id !== inspectionId);
  localStorage.setItem(CONSTRUCTION_STORAGE_KEYS.INSPECTIONS, JSON.stringify(inspections));
};

// Subcontractors
export const getSubcontractors = (): Subcontractor[] => {
  const stored = localStorage.getItem(CONSTRUCTION_STORAGE_KEYS.SUBCONTRACTORS);
  if (!stored) return [];
  
  try {
    const subcontractors = JSON.parse(stored) as Subcontractor[];
    return subcontractors.map(sub => ({
      ...sub,
      createdAt: new Date(sub.createdAt),
      insuranceExpiry: sub.insuranceExpiry ? new Date(sub.insuranceExpiry) : undefined,
      rates: sub.rates ? sub.rates.map(rate => ({
        ...rate,
        effectiveDate: new Date(rate.effectiveDate)
      })) : []
    }));
  } catch {
    return [];
  }
};

export const saveSubcontractor = (subcontractor: Subcontractor): void => {
  const subcontractors = getSubcontractors();
  const existingIndex = subcontractors.findIndex(s => s.id === subcontractor.id);
  
  if (existingIndex >= 0) {
    subcontractors[existingIndex] = subcontractor;
  } else {
    subcontractors.push(subcontractor);
  }
  
  localStorage.setItem(CONSTRUCTION_STORAGE_KEYS.SUBCONTRACTORS, JSON.stringify(subcontractors));
};

export const deleteSubcontractor = (subcontractorId: string): void => {
  const subcontractors = getSubcontractors().filter(s => s.id !== subcontractorId);
  localStorage.setItem(CONSTRUCTION_STORAGE_KEYS.SUBCONTRACTORS, JSON.stringify(subcontractors));
};

// Project Milestones
export const getProjectMilestones = (): ProjectMilestone[] => {
  const stored = localStorage.getItem(CONSTRUCTION_STORAGE_KEYS.PROJECT_MILESTONES);
  if (!stored) return [];
  
  try {
    const milestones = JSON.parse(stored) as ProjectMilestone[];
    return milestones.map(milestone => ({
      ...milestone,
      plannedStartDate: new Date(milestone.plannedStartDate),
      plannedEndDate: new Date(milestone.plannedEndDate),
      actualStartDate: milestone.actualStartDate ? new Date(milestone.actualStartDate) : undefined,
      actualEndDate: milestone.actualEndDate ? new Date(milestone.actualEndDate) : undefined
    }));
  } catch {
    return [];
  }
};

export const saveProjectMilestone = (milestone: ProjectMilestone): void => {
  const milestones = getProjectMilestones();
  const existingIndex = milestones.findIndex(m => m.id === milestone.id);
  
  if (existingIndex >= 0) {
    milestones[existingIndex] = milestone;
  } else {
    milestones.push(milestone);
  }
  
  localStorage.setItem(CONSTRUCTION_STORAGE_KEYS.PROJECT_MILESTONES, JSON.stringify(milestones));
};

export const deleteProjectMilestone = (milestoneId: string): void => {
  const milestones = getProjectMilestones().filter(m => m.id !== milestoneId);
  localStorage.setItem(CONSTRUCTION_STORAGE_KEYS.PROJECT_MILESTONES, JSON.stringify(milestones));
};

// Weather Delays
export const getWeatherDelays = (): WeatherDelay[] => {
  const stored = localStorage.getItem(CONSTRUCTION_STORAGE_KEYS.WEATHER_DELAYS);
  if (!stored) return [];
  
  try {
    const delays = JSON.parse(stored) as WeatherDelay[];
    return delays.map(delay => ({
      ...delay,
      date: new Date(delay.date)
    }));
  } catch {
    return [];
  }
};

export const saveWeatherDelay = (delay: WeatherDelay): void => {
  const delays = getWeatherDelays();
  const existingIndex = delays.findIndex(d => d.id === delay.id);
  
  if (existingIndex >= 0) {
    delays[existingIndex] = delay;
  } else {
    delays.push(delay);
  }
  
  localStorage.setItem(CONSTRUCTION_STORAGE_KEYS.WEATHER_DELAYS, JSON.stringify(delays));
};

export const deleteWeatherDelay = (delayId: string): void => {
  const delays = getWeatherDelays().filter(d => d.id !== delayId);
  localStorage.setItem(CONSTRUCTION_STORAGE_KEYS.WEATHER_DELAYS, JSON.stringify(delays));
};

// Default data functions
const getDefaultMaterials = (): MaterialItem[] => {
  return [
    {
      id: '1',
      name: 'Lumber - 2x4x8',
      category: 'lumber',
      unit: 'ea',
      currentPrice: 8.50,
      supplier: 'Home Depot',
      sku: 'HD-2X4X8',
      description: 'Standard construction grade lumber',
      lastUpdated: new Date(),
      priceHistory: [
        { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), price: 8.25, supplier: 'Home Depot' },
        { date: new Date(), price: 8.50, supplier: 'Home Depot' }
      ]
    },
    {
      id: '2',
      name: 'Drywall - 4x8 sheet',
      category: 'drywall',
      unit: 'sheet',
      currentPrice: 15.00,
      supplier: "Lowe's",
      sku: 'LW-DW48',
      description: '1/2 inch standard drywall sheet',
      lastUpdated: new Date(),
      priceHistory: [
        { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), price: 14.75, supplier: "Lowe's" },
        { date: new Date(), price: 15.00, supplier: "Lowe's" }
      ]
    },
    {
      id: '3',
      name: 'Concrete - Ready Mix',
      category: 'concrete',
      unit: 'cu yd',
      currentPrice: 120.00,
      supplier: 'Local Concrete Co',
      description: '3000 PSI ready mix concrete',
      lastUpdated: new Date(),
      priceHistory: [
        { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), price: 115.00, supplier: 'Local Concrete Co' },
        { date: new Date(), price: 120.00, supplier: 'Local Concrete Co' }
      ]
    },
    {
      id: '4',
      name: 'Paint - Interior Latex',
      category: 'paint',
      unit: 'gal',
      currentPrice: 45.00,
      supplier: 'Sherwin Williams',
      sku: 'SW-INT-LAT',
      description: 'Premium interior latex paint',
      lastUpdated: new Date(),
      priceHistory: [
        { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), price: 42.00, supplier: 'Sherwin Williams' },
        { date: new Date(), price: 45.00, supplier: 'Sherwin Williams' }
      ]
    }
  ];
};

const getDefaultLaborRates = (): LaborRate[] => {
  return [
    {
      id: '1',
      trade: 'general',
      skillLevel: 'journeyman',
      hourlyRate: 35.00,
      region: 'General Area',
      union: false,
      benefits: 8.40,
      lastUpdated: new Date()
    },
    {
      id: '2',
      trade: 'electrician',
      skillLevel: 'journeyman',
      hourlyRate: 65.00,
      region: 'General Area',
      union: false,
      benefits: 15.60,
      lastUpdated: new Date()
    },
    {
      id: '3',
      trade: 'plumber',
      skillLevel: 'journeyman',
      hourlyRate: 60.00,
      region: 'General Area',
      union: false,
      benefits: 14.40,
      lastUpdated: new Date()
    },
    {
      id: '4',
      trade: 'carpenter',
      skillLevel: 'journeyman',
      hourlyRate: 55.00,
      region: 'General Area',
      union: false,
      benefits: 13.20,
      lastUpdated: new Date()
    },
    {
      id: '5',
      trade: 'hvac',
      skillLevel: 'journeyman',
      hourlyRate: 58.00,
      region: 'General Area',
      union: false,
      benefits: 13.92,
      lastUpdated: new Date()
    }
  ];
};