import React, { useState, useEffect } from 'react';
import { Building2, Plus, CreditCard as Edit, Trash2, Save, X, MapPin, Search } from 'lucide-react';
import { apiService } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { LocationDashboard } from './LocationDashboard';

interface Location {
  id: number;
  name: string;
  address: string;
  description: string;
  created_by_username: string;
  created_at: string;
  is_active: boolean;
}

export function LocationManager() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [newLocation, setNewLocation] = useState({
    name: '',
    address: '',
    description: ''
  });
  const [view, setView] = useState<'list' | 'dashboard'>('list');
  
  const { hasPermission } = useAuth();
  const { user: currentUser } = useAuth();

  useEffect(() => {
    if (currentUser?.is_superuser || hasPermission('view_locations')) {
      loadLocations();
    }
  }, [currentUser]);

  const loadLocations = async () => {
    try {
      setLoading(true);
      const data = await apiService.getLocations();
      setLocations(data);
    } catch (error) {
      setError('Failed to load locations');
      console.error('Locations load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLocation = async () => {
    try {
      const createdLocation = await apiService.createLocation(newLocation);
      setLocations(prev => [createdLocation, ...prev]);
      setShowCreateModal(false);
      setNewLocation({
        name: '',
        address: '',
        description: ''
      });
    } catch (error) {
      console.error('Create location error:', error);
      setError('Failed to create location');
    }
  };

  const handleUpdateLocation = async (location: Location) => {
    try {
      const updatedLocation = await apiService.updateLocation(location.id, {
        name: location.name,
        address: location.address,
        description: location.description
      });
      
      setLocations(prev => prev.map(l => l.id === location.id ? updatedLocation : l));
      setEditingLocation(null);
    } catch (error) {
      console.error('Update location error:', error);
      setError('Failed to update location');
    }
  };

  const handleDeleteLocation = async (locationId: number) => {
    if (window.confirm('Are you sure you want to delete this location?')) {
      try {
        await apiService.deleteLocation(locationId);
        setLocations(prev => prev.filter(l => l.id !== locationId));
        if (selectedLocation?.id === locationId) {
          setSelectedLocation(null);
          setView('list');
        }
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

  const filteredLocations = locations.filter(location =>
    location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user?.is_superuser && !hasPermission('view_locations')) {
  if (!currentUser?.is_superuser && !hasPermission('view_locations')) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <Building2 className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-red-900 mb-2">Access Denied</h3>
        <p className="text-red-700">You don't have permission to view locations.</p>
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
          <h2 className="text-2xl font-bold text-gray-900">Location Management</h2>
        </div>
        
        {(currentUser?.is_superuser || hasPermission('create_locations')) && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            <span>Create Location</span>
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search locations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
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
          <div key={location.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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

      {filteredLocations.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No locations found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm ? `No locations match "${searchTerm}"` : 'Get started by creating your first location.'}
          </p>
          {(user?.is_superuser || hasPermission('create_locations')) && !searchTerm && (
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Create New Location</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location Name</label>
                <input
                  type="text"
                  value={newLocation.name}
                  onChange={(e) => setNewLocation({...newLocation, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter location name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={newLocation.address}
                  onChange={(e) => setNewLocation({...newLocation, address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="Enter address"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newLocation.description}
                  onChange={(e) => setNewLocation({...newLocation, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Enter description"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateLocation}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Create Location
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}