import React, { useEffect, Suspense, lazy, memo } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth, refreshAuthStatus } from './hooks/useAuth';

// Eagerly import Sidebar since it's always shown for authenticated users
import Sidebar from './components/Sidebar';

// Lazy loaded screens — split into logical groups
// Auth screens (loaded first interaction)
const LoginScreen = lazy(() => import('./screens/LoginScreen'));
const RegisterScreen = lazy(() => import('./screens/RegisterScreen'));
const ForgotPasswordScreen = lazy(() => import('./screens/ForgotPasswordScreen'));
const ResetPasswordScreen = lazy(() => import('./screens/ResetPasswordScreen'));

// Core screens (most used — prefetched)
const DashboardScreen = lazy(() => import('./screens/DashboardScreen'));
const LandingScreen = lazy(() => import('./screens/LandingScreen'));

// Secondary screens
const DigitalIDScreen = lazy(() => import('./screens/DigitalIDScreen'));
const EmergencyAlertScreen = lazy(() => import('./screens/EmergencyAlertScreen'));
const MapScreen = lazy(() => import('./screens/MapScreen'));
const ProfileScreen = lazy(() => import('./screens/ProfileScreen'));
const VerificationScreen = lazy(() => import('./screens/VerificationScreen'));
const ChatScreen = lazy(() => import('./screens/ChatScreen'));
const HotelListingScreen = lazy(() => import('./screens/HotelListingScreen'));
const PaymentHistoryScreen = lazy(() => import('./screens/PaymentHistoryScreen'));
const AmbulanceBookingScreen = lazy(() => import('./screens/AmbulanceBookingScreen'));
const VerificationProfileScreen = lazy(() => import('./screens/VerificationProfileScreen'));
const ReportIncidentScreen = lazy(() => import('./screens/ReportIncidentScreen'));
const EmergencyServicesScreen = lazy(() => import('./screens/EmergencyServicesScreen'));
const CommunityChatScreen = lazy(() => import('./screens/CommunityChatScreen'));
const ActivityLogScreen = lazy(() => import('./screens/ActivityLogScreen'));

// Admin screens (loaded only when admin navigates)
const AdminDashboardScreen = lazy(() => import('./screens/AdminDashboardScreen'));
const AdminTouristsScreen = lazy(() => import('./screens/admin/AdminTouristsScreen'));
const AdminSOSScreen = lazy(() => import('./screens/admin/AdminSOSScreen'));
const AdminTrackingScreen = lazy(() => import('./screens/admin/AdminTrackingScreen'));
const AdminZoneManagementScreen = lazy(() => import('./screens/admin/AdminZoneManagementScreen'));
const AdminQRScannerScreen = lazy(() => import('./screens/admin/AdminQRScannerScreen'));
const AdminNotificationsScreen = lazy(() => import('./screens/admin/AdminNotificationsScreen'));
const AdminReportsScreen = lazy(() => import('./screens/admin/AdminReportsScreen'));
const AdminAnalyticsScreen = lazy(() => import('./screens/admin/AdminAnalyticsScreen'));
const AdminSettingsScreen = lazy(() => import('./screens/admin/AdminSettingsScreen'));
const AdminIncidentReportsScreen = lazy(() => import('./screens/admin/AdminIncidentReportsScreen'));

// BottomNavigation lazy — only used on mobile layout
const BottomNavigation = lazy(() => import('./components/BottomNavigation'));

const MainLayout = memo(() => {
  return (
    <div className="web-layout">
      <Sidebar />
      <div className="main-content">
        <Suspense fallback={<InlineLoader />}>
          <Outlet />
        </Suspense>
      </div>
    </div>
  );
});

// Lightweight inline loader — smaller DOM, no full-screen overlay
const InlineLoader = memo(() => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <div className="spinner"></div>
  </div>
));

// Memoized ProtectedRoute — uses synchronous auth check, no loading flash
const ProtectedRoute = memo(({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();

  // With synchronous auth initialization, loading should be false immediately.
  // Only show spinner if auth state is truly unknown (shouldn't happen in practice)
  if (loading && isAuthenticated === null) {
    return <InlineLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/welcome" replace />;
  }

  return <>{children}</>;
});

const App: React.FC = () => {
  useEffect(() => {
    // Prefetch dashboard screen after initial render
    const prefetchTimer = setTimeout(() => {
      import('./screens/DashboardScreen');
    }, 1000);
    
    return () => clearTimeout(prefetchTimer);
  }, []);

  return (
    <BrowserRouter>
      <Suspense fallback={<InlineLoader />}>
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
              <Route path="community-chat" element={<CommunityChatScreen />} />
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
      </Suspense>
    </BrowserRouter>
  );
}


export default App;
