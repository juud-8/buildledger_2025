import React, { useState, useEffect } from 'react';
import { Search, Plus, User, Check } from 'lucide-react';
import { Client } from '../types';
import { getClients } from '../utils/storage';

interface ClientSelectorProps {
  selectedClientId: string;
  onClientSelect: (clientId: string) => void;
  onAddClient: () => void;
}

const ClientSelector: React.FC<ClientSelectorProps> = ({ 
  selectedClientId, 
  onClientSelect, 
  onAddClient 
}) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const loadedClients = getClients();
    setClients(loadedClients);
    setFilteredClients(loadedClients);
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredClients(clients);
      return;
    }

    const filtered = clients.filter(client =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.contactPerson && client.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredClients(filtered);
  }, [clients, searchTerm]);

  const selectedClient = clients.find(c => c.id === selectedClientId);

  const handleClientSelect = (clientId: string) => {
    onClientSelect(clientId);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleAddClient = () => {
    onAddClient();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Select Client *
      </label>
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left bg-white hover:bg-gray-50 transition-colors"
      >
        {selectedClient ? (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-400" />
            <span className="font-medium">{selectedClient.name}</span>
            {selectedClient.contactPerson && (
              <span className="text-gray-500">• {selectedClient.contactPerson}</span>
            )}
          </div>
        ) : (
          <span className="text-gray-500">Choose a client...</span>
        )}
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
            </div>
          </div>
          
          <div className="max-h-60 overflow-y-auto">
            {filteredClients.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {searchTerm ? 'No clients found' : 'No clients available'}
              </div>
            ) : (
              filteredClients.map((client) => (
                <button
                  key={client.id}
                  type="button"
                  onClick={() => handleClientSelect(client.id)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{client.name}</p>
                        {client.contactPerson && (
                          <p className="text-sm text-gray-600">{client.contactPerson}</p>
                        )}
                        <p className="text-sm text-gray-500">{client.email}</p>
                      </div>
                    </div>
                    {selectedClientId === client.id && (
                      <Check className="h-4 w-4 text-blue-600" />
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
          
          <div className="p-3 border-t bg-gray-50">
            <button
              type="button"
              onClick={handleAddClient}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add New Client
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientSelector;