import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  MapPin, 
  Search,
  Phone,
  Mail,
  Calendar,
  User
} from 'lucide-react';
import { apiService } from '../services/api';
import { useAuthContext } from '../contexts/AuthContext';
import { LocationDashboard } from './LocationDashboard';

interface Location {
  id: number;
  name: string;
  address: string;
  description: string;
  created_by_username: string;
  created_at: string;
  is_active: boolean;
  tank_count?: number;
  permit_count?: number;
}

interface NewLocationData {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  email: string;
  manager: string;
  description: string;
  facility_type: string;
}

export function LocationManager() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [view, setView] = useState<'list' | 'dashboard'>('list');
  const [formLoading, setFormLoading] = useState(false);
  
  const [newLocation, setNewLocation] = useState<NewLocationData>({
    name: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'United States',
    phone: '',
    email: '',
    manager: '',
    description: '',
    facility_type: 'gas_station'
  });
  
  const { hasPermission, user: currentUser } = useAuthContext();

  useEffect(() => {
    if (currentUser) {
      loadLocations();
    }
  }, [currentUser]);

  const loadLocations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getLocations();
      setLocations(Array.isArray(data) ? data : []);
    } catch (error) {
      setError('Failed to load locations');
      console.error('Locations load error:', error);
      setLocations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLocation = async () => {
    try {
      setFormLoading(true);
      setError(null);
      
      if (!newLocation.name.trim()) {
        setError('Location name is required');
        return;
      }

      // Combine address fields for backend
      const fullAddress = [
        newLocation.address,
        newLocation.city,
        newLocation.state,
        newLocation.zip,
        newLocation.country
      ].filter(Boolean).join(', ');

      const locationData = {
        name: newLocation.name.trim(),
        address: fullAddress,
        description: [
          newLocation.description,
          newLocation.manager ? `Manager: ${newLocation.manager}` : '',
          newLocation.phone ? `Phone: ${newLocation.phone}` : '',
          newLocation.email ? `Email: ${newLocation.email}` : '',
          `Type: ${newLocation.facility_type.replace('_', ' ')}`
        ].filter(Boolean).join('\n')
      };
      
      const createdLocation = await apiService.createLocation(locationData);
      setLocations(prev => Array.isArray(prev) ? [createdLocation, ...prev] : [createdLocation]);
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      console.error('Create location error:', error);
      setError('Failed to create location');
    } finally {
      setFormLoading(false);
    }
  };

  const resetForm = () => {
    setNewLocation({
      name: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      country: 'United States',
      phone: '',
      email: '',
      manager: '',
      description: '',
      facility_type: 'gas_station'
    });
    setError(null);
  };

  const handleUpdateLocation = async (location: Location) => {
    try {
      const updatedLocation = await apiService.updateLocation(location.id, {
        name: location.name,
        address: location.address,
        description: location.description
      });
      
      setLocations(prev => Array.isArray(prev) ? prev.map(l => l.id === location.id ? updatedLocation : l) : []);
      setEditingLocation(null);
      setError(null);
    } catch (error) {
      console.error('Update location error:', error);
      setError('Failed to update location');
    }
  };

  const handleDeleteLocation = async (locationId: number) => {
    if (window.confirm('Are you sure you want to delete this location?')) {
      try {
        await apiService.deleteLocation(locationId);
        setLocations(prev => Array.isArray(prev) ? prev.filter(l => l.id !== locationId) : []);
        if (selectedLocation?.id === locationId) {
          setSelectedLocation(null);
          setView('list');
        }
        setError(null);
      } catch (error) {
        console.error('Delete location error:', error);
        setError('Failed to delete location');
      }
    }
  };

  const handleViewDashboard = (location: Location) => {
    setSelectedLocation(location);
    setView('dashboard');
  };

  const updateNewLocationField = (field: keyof NewLocationData, value: string) => {
    setNewLocation(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const filteredLocations = Array.isArray(locations) ? locations.filter(location =>
    location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.description.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const facilityTypes = [
    { value: 'gas_station', label: 'Gas Station' },
    { value: 'truck_stop', label: 'Truck Stop' },
    { value: 'storage_facility', label: 'Storage Facility' },
    { value: 'distribution_center', label: 'Distribution Center' },
    { value: 'terminal', label: 'Terminal' },
    { value: 'convenience_store', label: 'Convenience Store' }
  ];

  const usStates = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
    'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
    'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
    'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
    'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
    'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
    'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
  ];

  if (!currentUser) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <Building2 className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-red-900 mb-2">Authentication Required</h3>
        <p className="text-red-700">Please log in to view locations.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading locations...</span>
      </div>
    );
  }

  if (view === 'dashboard' && selectedLocation) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setView('list')}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Building2 className="h-4 w-4" />
            <span>Back to Locations</span>
          </button>
        </div>
        
        <LocationDashboard 
          locationId={selectedLocation.id} 
          locationName={selectedLocation.name}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Building2 className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Facilities</h2>
        </div>
      </div>

      {/* Search Bar with Add Location Button */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search locations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        {(currentUser?.is_superuser || hasPermission('create_locations')) && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            title="Add New Location"
          >
            <Plus className="h-5 w-5" />
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <X className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Locations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLocations.map((location) => (
          <div key={location.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            {editingLocation?.id === location.id ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={editingLocation.name}
                  onChange={(e) => setEditingLocation({...editingLocation, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Location name"
                />
                <textarea
                  value={editingLocation.address}
                  onChange={(e) => setEditingLocation({...editingLocation, address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="Address"
                />
                <textarea
                  value={editingLocation.description}
                  onChange={(e) => setEditingLocation({...editingLocation, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Description"
                />
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleUpdateLocation(editingLocation)}
                    className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={() => setEditingLocation(null)}
                    className="flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Building2 className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{location.name}</h3>
                      <p className="text-sm text-gray-500">Created by {location.created_by_username}</p>
                    </div>
                  </div>
                </div>

                {location.address && (
                  <div className="flex items-start space-x-2 mb-3">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                    <p className="text-sm text-gray-600">{location.address}</p>
                  </div>
                )}

                {location.description && (
                  <p className="text-sm text-gray-600 mb-4">{location.description}</p>
                )}

                {/* Statistics */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-lg font-bold text-blue-600">{location.tank_count || 0}</p>
                    <p className="text-xs text-gray-600">Tanks</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-lg font-bold text-green-600">{location.permit_count || 0}</p>
                    <p className="text-xs text-gray-600">Permits</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Created {new Date(location.created_at).toLocaleDateString()}
                  </span>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleViewDashboard(location)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View Dashboard
                    </button>
                    
                    {(currentUser?.is_superuser || hasPermission('edit_locations')) && (
                      <button
                        onClick={() => setEditingLocation(location)}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    )}
                    
                    {(currentUser?.is_superuser || hasPermission('delete_locations')) && (
                      <button
                        onClick={() => handleDeleteLocation(location.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {filteredLocations.length === 0 && !loading && (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No locations found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm ? `No locations match "${searchTerm}"` : 'Get started by creating your first location.'}
          </p>
          {(currentUser?.is_superuser || hasPermission('create_locations')) && !searchTerm && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mx-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Create First Location</span>
            </button>
          )}
        </div>
      )}

      {/* Create Location Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Building2 className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Add New Location</h3>
              </div>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <X className="h-5 w-5 text-red-600 mr-2" />
                    <span className="text-red-800">{error}</span>
                  </div>
                </div>
              )}

              {/* Basic Information */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location Name *
                    </label>
                    <input
                      type="text"
                      value={newLocation.name}
                      onChange={(e) => updateNewLocationField('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Downtown Station A"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Facility Type
                    </label>
                    <select
                      value={newLocation.facility_type}
                      onChange={(e) => updateNewLocationField('facility_type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {facilityTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Address Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address
                    </label>
                    <input
                      type="text"
                      value={newLocation.address}
                      onChange={(e) => updateNewLocationField('address', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 123 Main Street"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      value={newLocation.city}
                      onChange={(e) => updateNewLocationField('city', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Los Angeles"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State
                    </label>
                    <select
                      value={newLocation.state}
                      onChange={(e) => updateNewLocationField('state', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select State</option>
                      {usStates.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      value={newLocation.zip}
                      onChange={(e) => updateNewLocationField('zip', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 90210"
                      pattern="[0-9]{5}(-[0-9]{4})?"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    <select
                      value={newLocation.country}
                      onChange={(e) => updateNewLocationField('country', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="United States">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="Mexico">Mexico</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="h-4 w-4 inline mr-1" />
                      Manager Name
                    </label>
                    <input
                      type="text"
                      value={newLocation.manager}
                      onChange={(e) => updateNewLocationField('manager', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., John Smith"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="h-4 w-4 inline mr-1" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={newLocation.phone}
                      onChange={(e) => updateNewLocationField('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., (555) 123-4567"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="h-4 w-4 inline mr-1" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={newLocation.email}
                      onChange={(e) => updateNewLocationField('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., manager@facility.com"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Additional Details</h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newLocation.description}
                    onChange={(e) => updateNewLocationField('description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    placeholder="Enter additional details about this location..."
                  />
                </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="flex space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                disabled={formLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateLocation}
                disabled={formLoading || !newLocation.name.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {formLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creating...</span>
                  </div>
                ) : (
                  'Create Location'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}