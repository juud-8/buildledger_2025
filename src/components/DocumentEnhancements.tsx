import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  PenTool, 
  Shield, 
  FileCheck, 
  Camera, 
  Truck, 
  Award,
  Plus,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { 
  DigitalSignature, 
  LienWaiver, 
  EquipmentRental, 
  WarrantyDocument, 
  DocumentTemplate,
  DocumentAttachment,
  ChangeOrder,
  ApprovalStep
} from '../types';
import { formatCurrency, formatDate } from '../utils/calculations';

interface DocumentEnhancementsProps {
  projectId?: string;
  invoiceId?: string;
  onDocumentUpdate?: () => void;
}

const DocumentEnhancements: React.FC<DocumentEnhancementsProps> = ({
  projectId,
  invoiceId,
  onDocumentUpdate
}) => {
  const [activeTab, setActiveTab] = useState<'signatures' | 'templates' | 'liens' | 'change_orders' | 'photos' | 'equipment' | 'warranties'>('signatures');
  const [signatures, setSignatures] = useState<DigitalSignature[]>([]);
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [lienWaivers, setLienWaivers] = useState<LienWaiver[]>([]);
  const [changeOrders, setChangeOrders] = useState<ChangeOrder[]>([]);
  const [equipmentRentals, setEquipmentRentals] = useState<EquipmentRental[]>([]);
  const [warranties, setWarranties] = useState<WarrantyDocument[]>([]);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showLienWaiverModal, setShowLienWaiverModal] = useState(false);
  const [showChangeOrderModal, setShowChangeOrderModal] = useState(false);
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [showWarrantyModal, setShowWarrantyModal] = useState(false);

  const tabs = [
    { id: 'signatures', label: 'Digital Signatures', icon: PenTool, color: 'text-blue-600' },
    { id: 'templates', label: 'Document Templates', icon: FileText, color: 'text-green-600' },
    { id: 'liens', label: 'Lien Waivers', icon: Shield, color: 'text-purple-600' },
    { id: 'change_orders', label: 'Change Orders', icon: FileCheck, color: 'text-orange-600' },
    { id: 'photos', label: 'Photo Documentation', icon: Camera, color: 'text-pink-600' },
    { id: 'equipment', label: 'Equipment Rentals', icon: Truck, color: 'text-indigo-600' },
    { id: 'warranties', label: 'Warranties', icon: Award, color: 'text-emerald-600' }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex items-center gap-3">
          <FileText className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Enhanced Document Management</h1>
            <p className="text-gray-600">Digital signatures, templates, lien waivers, and comprehensive documentation</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm border mb-6">
        <div className="border-b">
          <nav className="flex space-x-8 px-6 overflow-x-auto">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() =>
                    setActiveTab(
                      tab.id as
                        | 'signatures'
                        | 'templates'
                        | 'liens'
                        | 'change_orders'
                        | 'photos'
                        | 'equipment'
                        | 'warranties'
                    )
                  }
                  className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center gap-2 whitespace-nowrap ${
                    activeTab === tab.id
                      ? `border-blue-500 ${tab.color}`
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
          {/* Digital Signatures Tab */}
          {activeTab === 'signatures' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Digital Signature Management</h3>
                  <p className="text-gray-600">Secure digital signatures for quotes, contracts, and change orders</p>
                </div>
                <button
                  onClick={() => setShowSignatureModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <PenTool className="h-4 w-4" />
                  Request Signature
                </button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <PenTool className="h-6 w-6 text-blue-600 mt-1" />
                  <div>
                    <h4 className="font-medium text-blue-900 mb-2">Digital Signature Features</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Legally binding electronic signatures</li>
                      <li>• Automatic timestamp and IP tracking</li>
                      <li>• Email notifications for signature requests</li>
                      <li>• Secure signature verification</li>
                      <li>• Integration with quotes and change orders</li>
                    </ul>
                  </div>
                </div>
              </div>

              {signatures.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <PenTool className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No signatures yet</h4>
                  <p className="text-gray-600 mb-6">Start collecting digital signatures for your documents</p>
                  <button
                    onClick={() => setShowSignatureModal(true)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
                  >
                    <PenTool className="h-5 w-5" />
                    Request First Signature
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {signatures.map((signature) => (
                    <div key={signature.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{signature.signerName}</h4>
                          <p className="text-sm text-gray-600">{signature.signerEmail}</p>
                          <p className="text-sm text-gray-500">Signed: {formatDate(signature.signatureDate)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <span className="text-sm font-medium text-green-600">Verified</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Document Templates Tab */}
          {activeTab === 'templates' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Document Templates</h3>
                  <p className="text-gray-600">Pre-built templates for terms, conditions, and contracts by project type</p>
                </div>
                <button
                  onClick={() => setShowTemplateModal(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Create Template
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Default Templates */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Kitchen Renovation Terms</h4>
                      <p className="text-sm text-gray-600">Standard terms for kitchen projects</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 bg-blue-50 text-blue-700 px-3 py-2 rounded text-sm hover:bg-blue-100 transition-colors">
                      Use Template
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded">
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Shield className="h-8 w-8 text-purple-600" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Roofing Warranty</h4>
                      <p className="text-sm text-gray-600">5-year roofing warranty template</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 bg-purple-50 text-purple-700 px-3 py-2 rounded text-sm hover:bg-purple-100 transition-colors">
                      Use Template
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded">
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <FileCheck className="h-8 w-8 text-orange-600" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Change Order Template</h4>
                      <p className="text-sm text-gray-600">Standard change order format</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 bg-orange-50 text-orange-700 px-3 py-2 rounded text-sm hover:bg-orange-100 transition-colors">
                      Use Template
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded">
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Lien Waivers Tab */}
          {activeTab === 'liens' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Lien Waiver Management</h3>
                  <p className="text-gray-600">Generate and track lien waivers for payment protection</p>
                </div>
                <button
                  onClick={() => setShowLienWaiverModal(true)}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                  <Shield className="h-4 w-4" />
                  Generate Lien Waiver
                </button>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <Shield className="h-6 w-6 text-purple-600 mt-1" />
                  <div>
                    <h4 className="font-medium text-purple-900 mb-2">Lien Waiver Types</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-purple-800">
                      <div>
                        <p className="font-medium">Conditional Waivers:</p>
                        <ul className="ml-4 space-y-1">
                          <li>• Conditional Partial Waiver</li>
                          <li>• Conditional Final Waiver</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium">Unconditional Waivers:</p>
                        <ul className="ml-4 space-y-1">
                          <li>• Unconditional Partial Waiver</li>
                          <li>• Unconditional Final Waiver</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {lienWaivers.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <Shield className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No lien waivers generated</h4>
                  <p className="text-gray-600 mb-6">Protect your payments with proper lien waiver documentation</p>
                  <button
                    onClick={() => setShowLienWaiverModal(true)}
                    className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 mx-auto"
                  >
                    <Shield className="h-5 w-5" />
                    Generate First Lien Waiver
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {lienWaivers.map((waiver) => (
                    <div key={waiver.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900 capitalize">
                            {waiver.type.replace(/_/g, ' ')} Waiver
                          </h4>
                          <p className="text-sm text-gray-600">{waiver.propertyOwner}</p>
                          <p className="text-sm text-gray-500">
                            Through: {formatDate(waiver.throughDate)} • Amount: {formatCurrency(waiver.amountPaid)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {waiver.signature ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <Clock className="h-5 w-5 text-yellow-600" />
                          )}
                          <span className="text-sm font-medium">
                            {waiver.signature ? 'Signed' : 'Pending'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Change Orders Tab */}
          {activeTab === 'change_orders' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Change Order Management</h3>
                  <p className="text-gray-600">Document scope changes with approval workflow</p>
                </div>
                <button
                  onClick={() => setShowChangeOrderModal(true)}
                  className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
                >
                  <FileCheck className="h-4 w-4" />
                  Create Change Order
                </button>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <FileCheck className="h-6 w-6 text-orange-600 mt-1" />
                  <div>
                    <h4 className="font-medium text-orange-900 mb-2">Change Order Workflow</h4>
                    <div className="flex items-center gap-4 text-sm text-orange-800">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-orange-200 rounded-full flex items-center justify-center text-xs font-medium">1</div>
                        <span>Create</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-orange-200 rounded-full flex items-center justify-center text-xs font-medium">2</div>
                        <span>Client Review</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-orange-200 rounded-full flex items-center justify-center text-xs font-medium">3</div>
                        <span>Approval</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-orange-200 rounded-full flex items-center justify-center text-xs font-medium">4</div>
                        <span>Implementation</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {changeOrders.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <FileCheck className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No change orders created</h4>
                  <p className="text-gray-600 mb-6">Document project scope changes with proper approval workflow</p>
                  <button
                    onClick={() => setShowChangeOrderModal(true)}
                    className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2 mx-auto"
                  >
                    <FileCheck className="h-5 w-5" />
                    Create First Change Order
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {changeOrders.map((order) => (
                    <div key={order.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900">{order.number}</h4>
                          <p className="text-sm text-gray-600">{order.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">{formatCurrency(order.total)}</p>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            order.status === 'approved' ? 'bg-green-100 text-green-800' :
                            order.status === 'pending_approval' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </div>
                      
                      {order.approvalWorkflow && (
                        <div className="border-t pt-3">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Approval Progress:</h5>
                          <div className="flex items-center gap-4">
                            {order.approvalWorkflow.map((step, index) => (
                              <div key={step.id} className="flex items-center gap-2">
                                {step.status === 'approved' ? (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                ) : step.status === 'rejected' ? (
                                  <AlertCircle className="h-4 w-4 text-red-600" />
                                ) : (
                                  <Clock className="h-4 w-4 text-yellow-600" />
                                )}
                                <span className="text-sm text-gray-600">{step.stepName}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Photo Documentation Tab */}
          {activeTab === 'photos' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Photo Documentation</h3>
                  <p className="text-gray-600">Comprehensive project photo management with GPS and timestamps</p>
                </div>
                <button className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  Add Photos
                </button>
              </div>

              <div className="bg-pink-50 border border-pink-200 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <Camera className="h-6 w-6 text-pink-600 mt-1" />
                  <div>
                    <h4 className="font-medium text-pink-900 mb-2">Enhanced Photo Features</h4>
                    <ul className="text-sm text-pink-800 space-y-1">
                      <li>• Automatic GPS location tagging</li>
                      <li>• Timestamp verification</li>
                      <li>• Before/during/after categorization</li>
                      <li>• High-resolution storage</li>
                      <li>• Integration with invoices and reports</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <Camera className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">Photo documentation coming soon</h4>
                <p className="text-gray-600">Enhanced photo management with GPS and timestamp features</p>
              </div>
            </div>
          )}

          {/* Equipment Rentals Tab */}
          {activeTab === 'equipment' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Equipment Rental Agreements</h3>
                  <p className="text-gray-600">Track equipment rentals with automated agreements</p>
                </div>
                <button
                  onClick={() => setShowEquipmentModal(true)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                >
                  <Truck className="h-4 w-4" />
                  Add Equipment Rental
                </button>
              </div>

              {equipmentRentals.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <Truck className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No equipment rentals tracked</h4>
                  <p className="text-gray-600 mb-6">Manage equipment rentals with automated agreements and tracking</p>
                  <button
                    onClick={() => setShowEquipmentModal(true)}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 mx-auto"
                  >
                    <Truck className="h-5 w-5" />
                    Add First Equipment Rental
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {equipmentRentals.map((rental) => (
                    <div key={rental.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{rental.equipmentName}</h4>
                          <p className="text-sm text-gray-600">{rental.supplier}</p>
                          <p className="text-sm text-gray-500">
                            {formatDate(rental.startDate)} - {formatDate(rental.endDate)} ({rental.totalDays} days)
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">{formatCurrency(rental.totalCost)}</p>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            rental.status === 'returned' ? 'bg-green-100 text-green-800' :
                            rental.status === 'in_use' ? 'bg-blue-100 text-blue-800' :
                            rental.status === 'delivered' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {rental.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Warranties Tab */}
          {activeTab === 'warranties' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Warranty Documentation</h3>
                  <p className="text-gray-600">Generate and manage warranty documents for completed work</p>
                </div>
                <button
                  onClick={() => setShowWarrantyModal(true)}
                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
                >
                  <Award className="h-4 w-4" />
                  Create Warranty
                </button>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <Award className="h-6 w-6 text-emerald-600 mt-1" />
                  <div>
                    <h4 className="font-medium text-emerald-900 mb-2">Warranty Features</h4>
                    <ul className="text-sm text-emerald-800 space-y-1">
                      <li>• Customizable warranty periods by work type</li>
                      <li>• Automatic expiration tracking</li>
                      <li>• Digital signature collection</li>
                      <li>• Warranty claim management</li>
                      <li>• Professional warranty certificates</li>
                    </ul>
                  </div>
                </div>
              </div>

              {warranties.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <Award className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No warranties created</h4>
                  <p className="text-gray-600 mb-6">Provide professional warranty documentation for your completed work</p>
                  <button
                    onClick={() => setShowWarrantyModal(true)}
                    className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2 mx-auto"
                  >
                    <Award className="h-5 w-5" />
                    Create First Warranty
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {warranties.map((warranty) => (
                    <div key={warranty.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{warranty.workType}</h4>
                          <p className="text-sm text-gray-600">{warranty.warrantyPeriod} month warranty</p>
                          <p className="text-sm text-gray-500">
                            Valid until: {formatDate(warranty.warrantyEndDate)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            warranty.status === 'active' ? 'bg-green-100 text-green-800' :
                            warranty.status === 'expired' ? 'bg-red-100 text-red-800' :
                            warranty.status === 'claimed' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {warranty.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals would be implemented here */}
      {/* For brevity, showing placeholder modals */}
      {showSignatureModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Digital Signature Request</h3>
            <p className="text-gray-600 mb-4">Digital signature functionality will be implemented here.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowSignatureModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Additional modals for other features would follow the same pattern */}
    </div>
  );
};

export default DocumentEnhancements;