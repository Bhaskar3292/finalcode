import React, { useState } from 'react';
import { 
  Users, 
  Shield, 
  Activity, 
  Database, 
  Plus,
  UserPlus,
  Search
} from 'lucide-react';
import { TabNavigation } from './TabNavigation';
import { UserManagement } from './UserManagement';
import { PermissionsManager } from './PermissionsManager';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Inactive';
  lastLogin: string;
  facilities: string[];
}

interface Role {
  id: number;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
}

/**
 * AdminDashboard Component
 * Main admin interface with user management and role configuration
 * Modular design with reusable components for scalability
 */
export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('users');

  const tabs = [
    { id: 'users', label: 'User Management' },
    { id: 'permissions', label: 'Permissions Management' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'users':
        return (
          <UserManagement />
        );

      case 'permissions':
        return (
          <PermissionsManager />
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage users, roles, and system settings</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <TabNavigation 
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {renderTabContent()}
      </div>
    </div>
  );
}