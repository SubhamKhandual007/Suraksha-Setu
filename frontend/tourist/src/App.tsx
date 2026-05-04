import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth, refreshAuthStatus } from './hooks/useAuth';
import Sidebar from './components/Sidebar';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import DashboardScreen from './screens/DashboardScreen';
import DigitalIDScreen from './screens/DigitalIDScreen';
import EmergencyAlertScreen from './screens/EmergencyAlertScreen';
import LandingScreen from './screens/LandingScreen';
import AdminDashboardScreen from './screens/AdminDashboardScreen';
import AdminTouristsScreen from './screens/admin/AdminTouristsScreen';
import AdminSOSScreen from './screens/admin/AdminSOSScreen';
import AdminTrackingScreen from './screens/admin/AdminTrackingScreen';
import AdminZoneManagementScreen from './screens/admin/AdminZoneManagementScreen';
import AdminQRScannerScreen from './screens/admin/AdminQRScannerScreen';
import AdminNotificationsScreen from './screens/admin/AdminNotificationsScreen';
import AdminReportsScreen from './screens/admin/AdminReportsScreen';
import AdminAnalyticsScreen from './screens/admin/AdminAnalyticsScreen';
import AdminSettingsScreen from './screens/admin/AdminSettingsScreen';
import AdminIncidentReportsScreen from './screens/admin/AdminIncidentReportsScreen';
import ActivityLogScreen from './screens/ActivityLogScreen';

import BottomNavigation from './components/BottomNavigation';
import MapScreen from './screens/MapScreen';
import ProfileScreen from './screens/ProfileScreen';
import VerificationScreen from './screens/VerificationScreen';
import ChatScreen from './screens/ChatScreen';
import HotelListingScreen from './screens/HotelListingScreen';
import PaymentHistoryScreen from './screens/PaymentHistoryScreen';
import AmbulanceBookingScreen from './screens/AmbulanceBookingScreen';
import VerificationProfileScreen from './screens/VerificationProfileScreen';
import ReportIncidentScreen from './screens/ReportIncidentScreen';
import EmergencyServicesScreen from './screens/EmergencyServicesScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import ResetPasswordScreen from './screens/ResetPasswordScreen';

const MainLayout = () => {
  return (
    <div className="web-layout">
      <Sidebar />
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading || isAuthenticated === null) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/welcome" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  useEffect(() => {
    refreshAuthStatus();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/welcome" element={<LandingScreen />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/register" element={<RegisterScreen />} />
        <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
        <Route path="/reset-password/:token" element={<ResetPasswordScreen />} />
        <Route path="/verify/:digitalId" element={<VerificationProfileScreen />} />
        
        {/* Admin Routes with Sidebar */}

        <Route path="/admin" element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<AdminDashboardScreen />} />
          <Route path="tourists" element={<AdminTouristsScreen />} />
          <Route path="tracking" element={<AdminTrackingScreen />} />
          <Route path="sos" element={<AdminSOSScreen />} />
          <Route path="scanner" element={<AdminQRScannerScreen />} />
          <Route path="zones" element={<AdminZoneManagementScreen />} />
          <Route path="activities" element={<ActivityLogScreen />} />
          <Route path="incidents" element={<AdminIncidentReportsScreen />} />
          <Route path="notifications" element={<AdminNotificationsScreen />} />
          <Route path="reports" element={<AdminReportsScreen />} />
          <Route path="analytics" element={<AdminAnalyticsScreen />} />
          <Route path="settings" element={<AdminSettingsScreen />} />
        </Route>

        <Route path="/" element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardScreen />} />
          <Route path="dashboard/detailed" element={<DashboardScreen mode="detailed" />} />
          <Route path="map" element={<MapScreen />} />
          <Route path="chat" element={<ChatScreen />} />
          <Route path="id" element={<DigitalIDScreen />} />

          <Route path="emergency" element={<EmergencyAlertScreen />} />
          <Route path="profile" element={<ProfileScreen />} />
          <Route path="hotels" element={<HotelListingScreen />} />
          <Route path="payments" element={<PaymentHistoryScreen />} />
          <Route path="ambulance" element={<AmbulanceBookingScreen />} />
          <Route path="report-incident" element={<ReportIncidentScreen />} />
          <Route path="emergency-directory" element={<EmergencyServicesScreen />} />
          <Route path="location" element={<Navigate to="/map" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}


export default App;
