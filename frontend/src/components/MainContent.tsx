import React, { useState } from 'react';
import { FacilityDashboard } from './FacilityDashboard';
import { LocationsPage } from './LocationsPage';
import { LocationManager } from './LocationManager';
import { TankManagement } from './TankManagement';
import { ReleaseDetection } from './ReleaseDetection';
import { PermitsLicenses } from './PermitsLicenses';
import { SettingsPanel } from './SettingsPanel';
import { ProfilePanel } from './ProfilePanel';

interface MainContentProps {
  activeView: string;
  selectedFacility?: any;
  showAddLocationModal?: boolean;
  onCloseAddLocationModal?: () => void;
}

export function MainContent({ activeView, selectedFacility, showAddLocationModal, onCloseAddLocationModal }: MainContentProps) {
  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <FacilityDashboard selectedFacility={selectedFacility} />;
      case 'locations':
        return <LocationsPage />;
      case 'facilities':
        return <LocationManager showAddLocationModal={showAddLocationModal} onCloseAddLocationModal={onCloseAddLocationModal} />;
      case 'tanks':
        return <TankManagement selectedFacility={selectedFacility} />;
      case 'releases':
        return <ReleaseDetection selectedFacility={selectedFacility} />;
      case 'permits':
        return <PermitsLicenses selectedFacility={selectedFacility} />;
      case 'settings':
        return <SettingsPanel />;
      case 'profile':
        return <ProfilePanel />;
      default:
        return <FacilityDashboard selectedFacility={selectedFacility} />;
    }
  };

  return (
    <div className="flex-1 p-6">
      {renderContent()}
    </div>
  );
}