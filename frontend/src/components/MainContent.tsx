import React, { useState } from 'react';
import { FacilityDashboard } from './FacilityDashboard';
import { LocationManager } from './LocationManager';
import { TankManagement } from './TankManagement';
import { ReleaseDetection } from './ReleaseDetection';
import { PermitsLicenses } from './PermitsLicenses';
import { SettingsPanel } from './SettingsPanel';
import { ProfilePanel } from './ProfilePanel';

interface MainContentProps {
  activeView: string;
  selectedFacility?: any;
}

export function MainContent({ activeView, selectedFacility }: MainContentProps) {
  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <FacilityDashboard selectedFacility={selectedFacility} />;
      case 'facilities':
        return <LocationManager />;
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