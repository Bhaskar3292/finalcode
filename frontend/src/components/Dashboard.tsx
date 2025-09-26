import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopNavigation } from './TopNavigation';
import { MainContent } from './MainContent';
import { AdminDashboard } from './AdminDashboard';
import { useAuthContext } from '../contexts/AuthContext';

export function Dashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedFacility, setSelectedFacility] = useState<any>(null);
  const [showAddLocationModal, setShowAddLocationModal] = useState(false);
  const { hasPermission, user } = useAuthContext();

  const handleFacilitySelect = (facility: any) => {
    setSelectedFacility(facility);
    // Optionally switch to facilities view when a facility is selected
    if (activeView === 'dashboard') {
      setActiveView('facilities');
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        collapsed={sidebarCollapsed}
        activeView={activeView}
        onViewChange={setActiveView}
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavigation 
          selectedFacility={selectedFacility}
          onFacilitySelect={handleFacilitySelect}
          onViewChange={setActiveView}
          onShowAddLocation={() => setShowAddLocationModal(true)}
        />
        
        <main className="flex-1 overflow-auto">
          {activeView === 'admin' && (user?.is_superuser || hasPermission('manage_users')) ? (
            <AdminDashboard />
          ) : (
            <MainContent 
              activeView={activeView} 
              selectedFacility={selectedFacility}
              showAddLocationModal={showAddLocationModal}
              onCloseAddLocationModal={() => setShowAddLocationModal(false)}
            />
          )}
        </main>
      </div>
    </div>
  );
}