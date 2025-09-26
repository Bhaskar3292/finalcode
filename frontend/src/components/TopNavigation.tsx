import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  Search, 
  ChevronDown, 
  LogOut, 
  User, 
  Settings,
  Building2,
  Plus,
  MapPin,
  X,
  Save
} from 'lucide-react';
import { useAuthContext } from '../contexts/AuthContext';
import { apiService } from '../services/api';

interface TopNavigationProps {
  selectedFacility: any;
  onFacilitySelect: (facility: any) => void;
  onViewChange: (view: string) => void;
  onLocationCreated?: () => void;
}

interface NewLocationData {
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  phone: string;
  email: string;
  manager: string;
  description: string;
  facility_type: string;
}

export function TopNavigation({ selectedFacility, onFacilitySelect, onViewChange, onLocationCreated }: TopNavigationProps) {
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFacilityDropdown, setShowFacilityDropdown] = useState(false);
  const [showAddLocationModal, setShowAddLocationModal] = useState(false);
  const [locations, setLocations] = useState<any[]>([]);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [newLocation, setNewLocation] = useState<NewLocationData>({
    name: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'United States',
    phone: '',
    email: '',
    manager: '',
    description: '',
    facility_type: 'gas_station'
  });
  
  const { user, logout, hasPermission } = useAuthContext();

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      const data = await apiService.getLocations();
      setLocations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load locations:', error);
      setLocations([]);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const filteredFacilities = locations.filter(facility =>
    facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (facility.address && facility.address.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleFacilitySelect = (facility: any) => {
    onFacilitySelect(facility);
    setSearchTerm('');
    setShowFacilityDropdown(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setShowFacilityDropdown(true);
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
        newLocation.pincode,
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
      
      // Reload locations to update dropdown
      await loadLocations();
      
      setShowAddLocationModal(false);
      resetForm();
      
      // Notify parent component
      if (onLocationCreated) {
        onLocationCreated();
      }
      
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
      pincode: '',
      country: 'United States',
      phone: '',
      email: '',
      manager: '',
      description: '',
      facility_type: 'gas_station'
    });
    setError(null);
  };

  const updateNewLocationField = (field: keyof NewLocationData, value: string) => {
    setNewLocation(prev => ({
      ...prev,
      [field]: value
    }));
  };

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

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left - Current Facility Display */}
          <div className="flex items-center min-w-0 flex-1">
            {selectedFacility && (
              <div className="flex items-center space-x-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-200">
                <Building2 className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900 truncate">{selectedFacility.name}</span>
              </div>
            )}
          </div>

          {/* Center - Search Bar with Add Location Button */}
          <div className="flex-1 max-w-2xl mx-8 relative">
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search and select facility..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onFocus={() => setShowFacilityDropdown(true)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />

                {/* Facility Dropdown */}
                {showFacilityDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                    {filteredFacilities.length > 0 ? (
                      filteredFacilities.map((facility) => (
                        <button
                          key={facility.id}
                          onClick={() => handleFacilitySelect(facility)}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex items-center space-x-3">
                            <Building2 className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{facility.name}</p>
                              <p className="text-xs text-gray-500">{facility.address}</p>
                            </div>
                          </div>
                        </button>
                      ))
                    ) : searchTerm.length > 0 ? (
                      <div className="px-4 py-3 text-sm text-gray-500">No matching facilities found.</div>
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-500">Start typing to search facilities...</div>
                    )}
                  </div>
                )}
              </div>

              {/* Add Location Button */}
              {(user?.is_superuser || hasPermission('create_locations')) && (
                <button
                  onClick={() => setShowAddLocationModal(true)}
                  className="flex items-center justify-center p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  title="Add New Location"
                >
                  <div className="relative">
                    <MapPin className="h-5 w-5" />
                    <Plus className="h-3 w-3 absolute -top-1 -right-1 bg-white text-green-600 rounded-full" />
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Right - Notifications and User Menu */}
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              <span className="font-medium truncate">{user?.organization || 'Facility Management'}</span>
            </div>

            <button className="p-2 rounded-md hover:bg-gray-100 transition-colors relative">
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
            </button>

            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">{user?.username || 'User'}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                  <button
                    onClick={() => {
                      onViewChange('profile');
                      setShowUserMenu(false);
                    }}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    <User className="h-4 w-4 inline mr-2" />
                    Profile
                  </button>
                  <button
                    onClick={() => {
                      onViewChange('settings');
                      setShowUserMenu(false);
                    }}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    <Settings className="h-4 w-4 inline mr-2" />
                    Settings
                  </button>
                  <hr className="my-1" />
                  <button
                    onClick={handleLogout}
                    className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                  >
                    <LogOut className="h-4 w-4 inline mr-2" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Click outside to close dropdown */}
        {showFacilityDropdown && (
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowFacilityDropdown(false)}
          />
        )}
      </header>

      {/* Add Location Modal */}
      {showAddLocationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <MapPin className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Add New Location</h3>
              </div>
              <button
                onClick={() => {
                  setShowAddLocationModal(false);
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Select State</option>
                      {usStates.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      PIN Code / ZIP
                    </label>
                    <input
                      type="text"
                      value={newLocation.pincode}
                      onChange={(e) => updateNewLocationField('pincode', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
                      Manager Name
                    </label>
                    <input
                      type="text"
                      value={newLocation.manager}
                      onChange={(e) => updateNewLocationField('manager', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="e.g., John Smith"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={newLocation.phone}
                      onChange={(e) => updateNewLocationField('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="e.g., (555) 123-4567"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={newLocation.email}
                      onChange={(e) => updateNewLocationField('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
                  setShowAddLocationModal(false);
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
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {formLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creating...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <Save className="h-4 w-4" />
                    <span>Create Location</span>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}