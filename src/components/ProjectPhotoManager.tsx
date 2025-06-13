import React, { useState } from 'react';
import { Camera, Upload, Trash2, Eye, Plus, X, Image as ImageIcon } from 'lucide-react';
import { ProjectPhoto } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface ProjectPhotoManagerProps {
  photos: ProjectPhoto[];
  onPhotosChange: (photos: ProjectPhoto[]) => void;
  isEnabled: boolean;
}

const ProjectPhotoManager: React.FC<ProjectPhotoManagerProps> = ({
  photos,
  onPhotosChange,
  isEnabled
}) => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<ProjectPhoto | null>(null);
  const [newPhoto, setNewPhoto] = useState({
    caption: '',
    category: 'progress' as ProjectPhoto['category']
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const photo: ProjectPhoto = {
            id: uuidv4(),
            url: event.target?.result as string,
            caption: newPhoto.caption || file.name,
            category: newPhoto.category
          };
          onPhotosChange([...photos, photo]);
        };
        reader.readAsDataURL(file);
      }
    });

    setShowUploadModal(false);
    setNewPhoto({ caption: '', category: 'progress' });
  };

  const removePhoto = (photoId: string) => {
    onPhotosChange(photos.filter(p => p.id !== photoId));
  };

  const updatePhoto = (photoId: string, updates: Partial<ProjectPhoto>) => {
    onPhotosChange(photos.map(p => p.id === photoId ? { ...p, ...updates } : p));
  };

  const getCategoryIcon = (category: ProjectPhoto['category']) => {
    switch (category) {
      case 'before': return '📷';
      case 'progress': return '🔨';
      case 'after': return '✅';
      case 'materials': return '📦';
      default: return '🖼️';
    }
  };

  const getCategoryColor = (category: ProjectPhoto['category']) => {
    switch (category) {
      case 'before': return 'bg-red-100 text-red-800';
      case 'progress': return 'bg-yellow-100 text-yellow-800';
      case 'after': return 'bg-green-100 text-green-800';
      case 'materials': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isEnabled) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Camera className="h-5 w-5 text-orange-600" />
              Project Photos
            </h3>
            <p className="text-sm text-gray-600 mt-1">Add photos to showcase your work</p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Photos
          </button>
        </div>
      </div>

      <div className="p-4">
        {photos.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <Camera className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No photos added</h4>
            <p className="text-gray-600 mb-4">Add before, progress, and after photos to showcase your work</p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2 mx-auto"
            >
              <Upload className="h-4 w-4" />
              Upload Your First Photo
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {photos.map((photo) => (
              <div key={photo.id} className="bg-gray-50 rounded-lg overflow-hidden border">
                <div className="relative">
                  <img
                    src={photo.url}
                    alt={photo.caption}
                    className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setPreviewPhoto(photo)}
                  />
                  <div className="absolute top-2 left-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(photo.category)}`}>
                      <span>{getCategoryIcon(photo.category)}</span>
                      {photo.category.charAt(0).toUpperCase() + photo.category.slice(1)}
                    </span>
                  </div>
                  <div className="absolute top-2 right-2 flex gap-1">
                    <button
                      onClick={() => setPreviewPhoto(photo)}
                      className="p-1 bg-black bg-opacity-50 text-white rounded hover:bg-opacity-70 transition-colors"
                    >
                      <Eye className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => removePhoto(photo.id)}
                      className="p-1 bg-black bg-opacity-50 text-white rounded hover:bg-opacity-70 transition-colors"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                <div className="p-3">
                  <input
                    type="text"
                    value={photo.caption}
                    onChange={(e) => updatePhoto(photo.id, { caption: e.target.value })}
                    placeholder="Photo caption..."
                    className="w-full text-sm border-none bg-transparent focus:outline-none focus:ring-0 p-0 font-medium text-gray-900"
                  />
                  <select
                    value={photo.category}
                    onChange={(e) => updatePhoto(photo.id, { category: e.target.value as ProjectPhoto['category'] })}
                    className="w-full mt-2 text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  >
                    <option value="before">Before</option>
                    <option value="progress">Progress</option>
                    <option value="after">After</option>
                    <option value="materials">Materials</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Add Project Photos</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Caption
                </label>
                <input
                  type="text"
                  value={newPhoto.caption}
                  onChange={(e) => setNewPhoto(prev => ({ ...prev, caption: e.target.value }))}
                  placeholder="Optional default caption..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Category
                </label>
                <select
                  value={newPhoto.category}
                  onChange={(e) => setNewPhoto(prev => ({ ...prev, category: e.target.value as ProjectPhoto['category'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="before">Before</option>
                  <option value="progress">Progress</option>
                  <option value="after">After</option>
                  <option value="materials">Materials</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-sm text-gray-600 mb-4">
                  Select photos to upload (JPG, PNG, GIF up to 5MB each)
                </p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 p-4 border-t">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(previewPhoto.category)}`}>
                  <span>{getCategoryIcon(previewPhoto.category)}</span>
                  {previewPhoto.category.charAt(0).toUpperCase() + previewPhoto.category.slice(1)}
                </span>
                <h3 className="text-lg font-semibold text-gray-900">{previewPhoto.caption}</h3>
              </div>
              <button
                onClick={() => setPreviewPhoto(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-4">
              <img
                src={previewPhoto.url}
                alt={previewPhoto.caption}
                className="w-full max-h-[70vh] object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectPhotoManager;