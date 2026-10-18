import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { LanguageProvider } from '@/lib/i18n';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
import { LayoutDashboard, ClipboardList, Users, BookOpen, ScanLine } from 'lucide-react';

// Public
import PublicLayout from '@/components/PublicLayout';
import Landing from '@/pages/Landing';
import HowItWorks from '@/pages/HowItWorks';
import Features from '@/pages/Features';

import About from '@/pages/About';
import Contact from '@/pages/Contact';
import CropCareAssistant from '@/components/CropCareAssistant';
import ErrorBoundary from '@/components/ErrorBoundary';

// Auth
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';

// Onboarding
import Onboarding from '@/pages/Onboarding';

// Farmer
import FarmerLayout from '@/components/FarmerLayout';
import Dashboard from '@/pages/Dashboard';
import MyCrops from '@/pages/MyCrops';
import CropDetail from '@/pages/CropDetail';
import Scan from '@/pages/Scan';
import ScanResult from '@/pages/ScanResult';
import History from '@/pages/History';
import HistoryDetail from '@/pages/HistoryDetail';
import Experts from '@/pages/Experts';
import ExpertRequest from '@/pages/ExpertRequest';
import Chat from '@/pages/Chat';
import Alerts from '@/pages/Alerts';
import Notifications from '@/pages/Notifications';
import Knowledge from '@/pages/Knowledge';
import Profile from '@/pages/Profile';

// Expert & Admin
import DashboardLayout from '@/components/DashboardLayout';
import ExpertDashboard from '@/pages/ExpertDashboard';
import ExpertCases from '@/pages/ExpertCases';
import ExpertCaseDetail from '@/pages/ExpertCaseDetail';
import AdminDashboard from '@/pages/AdminDashboard';
import AdminUsers from '@/pages/AdminUsers';
import AdminDiseases from '@/pages/AdminDiseases';
import AdminDiagnoses from '@/pages/AdminDiagnoses';

const EXPERT_NAV = [
  { label: 'Dashboard', to: '/expert/dashboard', icon: LayoutDashboard },
  { label: 'Cases', to: '/expert/cases', icon: ClipboardList }
];

const ADMIN_NAV = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Users', to: '/admin/users', icon: Users },
  { label: 'Diseases', to: '/admin/diseases', icon: BookOpen },
  { label: 'Diagnoses', to: '/admin/diagnoses', icon: ScanLine }
];

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError?.type === 'user_not_registered') {
    return <UserNotRegisteredError />;
  }

  return (
    <Routes>
      {/* Public */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/features" element={<Features />} />

        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Route>

      {/* Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Register />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Onboarding */}
      <Route path="/onboarding" element={<Onboarding />} />

      {/* Farmer (protected) */}
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<FarmerLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/my-crops" element={<MyCrops />} />
          <Route path="/my-crops/:id" element={<CropDetail />} />
          <Route path="/scan" element={<Scan />} />
          <Route path="/scan/result" element={<ScanResult />} />
          <Route path="/history" element={<History />} />
          <Route path="/history/:id" element={<HistoryDetail />} />
          <Route path="/experts" element={<Experts />} />
          <Route path="/expert-request" element={<ExpertRequest />} />
          <Route path="/chat/:expertId" element={<Chat />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/knowledge" element={<Knowledge />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* Expert */}
        <Route element={<DashboardLayout nav={EXPERT_NAV} title="Expert" accent="expert" />}>
          <Route path="/expert/dashboard" element={<ExpertDashboard />} />
          <Route path="/expert/cases" element={<ExpertCases />} />
          <Route path="/expert/cases/:id" element={<ExpertCaseDetail />} />
        </Route>

        {/* Admin */}
        <Route element={<DashboardLayout nav={ADMIN_NAV} title="Admin" accent="admin" />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/diseases" element={<AdminDiseases />} />
          <Route path="/admin/diagnoses" element={<AdminDiagnoses />} />
        </Route>
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <LanguageProvider>
          <QueryClientProvider client={queryClientInstance}>
            <Router>
              <ScrollToTop />
              <ErrorBoundary>
                <AuthenticatedApp />
              </ErrorBoundary>
              <ErrorBoundary fallback={null}>
                <CropCareAssistant />
              </ErrorBoundary>
            </Router>
            <Toaster />
          </QueryClientProvider>
        </LanguageProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
