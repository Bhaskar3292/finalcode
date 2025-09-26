import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Menu, 
  Bell, 
  Search, 
  ChevronDown, 
  LogOut, 
  User, 
  Settings,
  Building2,
  Plus,
  MapPin
} from 'lucide-react';
import { useAuthContext } from '../contexts/AuthContext';

interface TopNavigationProps {
  selectedFacility: any;
  onFacilitySelect: (facility: any) => void;
  onViewChange: (view: string) => void;
  onShowAddLocation: () => void;
}

export function TopNavigation({ selectedFacility, onFacilitySelect, onViewChange, onShowAddLocation }: TopNavigationProps) {
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFacilityDropdown, setShowFacilityDropdown] = useState(false);
  const { user, logout, hasPermission } = useAuthContext();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  // Mock facilities data - in production this would come from an API
  const facilities = [
    {
      id: 1,
      name: 'Downtown Station A',
      address: '123 Main St, Downtown, CA 90210',
      type: 'Gas Station',
      status: 'Active'
    },
    {
      id: 2,
      name: 'Highway 101 Facility',
      address: '456 Highway 101, Midtown, CA 90211',
      type: 'Truck Stop',
      status: 'Active'
    },
    {
      id: 3,
      name: 'Industrial Park B',
      address: '789 Industrial Blvd, Industrial Area, CA 90212',
      type: 'Storage Facility',
      status: 'Maintenance'
    },
    {
      id: 4,
      name: 'Westside Complex',
      address: '321 West Ave, Westside, CA 90213',
      type: 'Gas Station',
      status: 'Active'
    },
    {
      id: 5,
      name: 'Eastside Terminal',
      address: '654 East Blvd, Eastside, CA 90214',
      type: 'Terminal',
      status: 'Active'
    }
  ];

  const filteredFacilities = facilities.filter(facility =>
    facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    facility.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFacilitySelect = (facility: any) => {
    onFacilitySelect(facility);
    setSearchTerm('');
    setShowFacilityDropdown(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowFacilityDropdown(true);
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left side - Current Facility Display */}
        <div className="flex items-center min-w-0 flex-1">
          {selectedFacility && (
            <div className="flex items-center space-x-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-200">
              <Building2 className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900 truncate">{selectedFacility.name}</span>
            </div>
          )}
        </div>

        {/* Center - Search Bar */}
        <div className="flex-1 max-w-2xl mx-8">
          <div className="relative w-full">
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
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs text-gray-400">{facility.type}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              facility.status === 'Active' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {facility.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  searchTerm.length > 0 ? (
                    <div className="px-4 py-3 text-sm text-gray-500">
          <div className="text-sm text-gray-600">
            <span className="font-medium truncate">{user?.organization}</span>
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
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
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
  );
}