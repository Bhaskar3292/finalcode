import React, { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { Dashboard } from './components/Dashboard';
import { LoginForm } from './components/LoginForm';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuthContext } from './contexts/AuthContext';
import { ApiStatus } from './components/ApiStatus';

function AppContent() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <AppContent />
        <ApiStatus />
      </div>
    </AuthProvider>
  );
}

export default App;