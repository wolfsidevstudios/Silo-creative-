import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import HomePage from './components/pages/HomePage';
import AppBuilderPage from './components/pages/AppBuilderPage';
import SettingsPage from './components/pages/SettingsPage';
import AgentsPage from './components/pages/AgentsPage';
import PrivacyPolicyPage from './components/pages/PrivacyPolicyPage';
import TermsOfServicePage from './components/pages/TermsOfServicePage';
import LoginPage from './components/pages/LoginPage';
import LandingPage from './components/pages/LandingPage';
import SiloOneDrivePage from './components/pages/SiloOneDrivePage';

const FullPageSpinner: React.FC = () => (
    <div className="flex items-center justify-center h-screen w-screen bg-gray-50">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-indigo-500" role="status" aria-label="Loading">
            <span className="sr-only">Loading...</span>
        </div>
    </div>
);

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login', { state: { from: location } });
    }
  }, [user, loading, navigate, location]);

  if (loading) return <FullPageSpinner />;

  return user ? <>{children}</> : null;
};

const LoginPageWrapper: React.FC = () => {
    const { user, loading } = useAppContext();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && user) {
            navigate('/home');
        }
    }, [user, loading, navigate]);
    
    if (loading || user) return <FullPageSpinner />;
    
    return <LoginPage />;
}

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPageWrapper />} />
      <Route path="/privacy" element={<PrivacyPolicyPage />} />
      <Route path="/terms" element={<TermsOfServicePage />} />
      <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
      <Route path="/build" element={<ProtectedRoute><AppBuilderPage /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
      <Route path="/agents" element={<ProtectedRoute><AgentsPage /></ProtectedRoute>} />
      <Route path="/onedrive" element={<ProtectedRoute><SiloOneDrivePage /></ProtectedRoute>} />
    </Routes>
  );
};

function App() {
  return (
    <AppProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </AppProvider>
  );
}

export default App;