import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Save, X } from 'lucide-react';
import { Client } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface ClientFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (client: Client) => void;
  editingClient?: Client | null;
}

const clientSchema = z.object({
  name: z.string().nonempty('Name is required'),
  contactPerson: z.string().optional(),
  address: z.string().nonempty('Address is required'),
  city: z.string().nonempty('City is required'),
  state: z.string().nonempty('State is required'),
  zipCode: z.string().nonempty('ZIP Code is required'),
  phone: z.string().nonempty('Phone is required'),
  email: z.string().email('Invalid email')
});
type ClientFormFields = z.infer<typeof clientSchema>;

const ClientForm: React.FC<ClientFormProps> = ({ isOpen, onClose, onSave, editingClient }) => {
  const {
    register,
    handleSubmit,
    reset,
    setFocus,
    formState: { errors }
  } = useForm<ClientFormFields>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: '',
      contactPerson: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      phone: '',
      email: ''
    }
  });

  useEffect(() => {
    if (isOpen) {
      if (editingClient) {
        reset({
          name: editingClient.name,
          contactPerson: editingClient.contactPerson || '',
          address: editingClient.address,
          city: editingClient.city,
          state: editingClient.state,
          zipCode: editingClient.zipCode,
          phone: editingClient.phone,
          email: editingClient.email
        });
      } else {
        reset({
          name: '',
          contactPerson: '',
          address: '',
          city: '',
          state: '',
          zipCode: '',
          phone: '',
          email: ''
        });
      }
    }
  }, [isOpen, editingClient, reset]);

  const handleError = () => {
    const firstError = Object.keys(errors)[0] as keyof ClientFormFields;
    if (firstError) setFocus(firstError);
  };

  const onSubmit = (data: ClientFormFields) => {
    const client: Client = {
      id: editingClient?.id || uuidv4(),
      ...data,
      createdAt: editingClient?.createdAt || new Date()
    };

    onSave(client);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <User className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              {editingClient ? 'Edit Client' : 'Add New Client'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit, handleError)} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company/Client Name *
              </label>
              <input
                type="text"
                {...register('name')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.name && (
                <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Person
              </label>
              <input
                type="text"
                {...register('contactPerson')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address *
              </label>
              <input
                type="text"
                {...register('address')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.address && (
                <p className="text-red-600 text-sm mt-1">{errors.address.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City *
              </label>
              <input
                type="text"
                {...register('city')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.city && (
                <p className="text-red-600 text-sm mt-1">{errors.city.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State *
              </label>
              <input
                type="text"
                {...register('state')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.state && (
                <p className="text-red-600 text-sm mt-1">{errors.state.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ZIP Code *
              </label>
              <input
                type="text"
                {...register('zipCode')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.zipCode && (
                <p className="text-red-600 text-sm mt-1">{errors.zipCode.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone *
              </label>
              <input
                type="tel"
                {...register('phone')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.phone && (
                <p className="text-red-600 text-sm mt-1">{errors.phone.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                {...register('email')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {editingClient ? 'Update Client' : 'Add Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientForm;