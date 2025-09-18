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
import ChangelogPage from './components/pages/ChangelogPage';
import DocsPage from './components/pages/DocsPage'; // New Import
import DeveloperAPIPage from './components/pages/DeveloperAPIPage'; // New Import
import Sidebar from './components/common/Sidebar';
import Banner from './components/common/Banner';

const FullPageSpinner: React.FC = () => (
    <div className="flex items-center justify-center h-screen w-screen bg-black">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-white/50" role="status" aria-label="Loading">
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

  // This wrapper provides the consistent layout for all protected pages
  return user ? (
    <div className="flex flex-col h-screen w-screen bg-black">
      <Banner />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  ) : null;
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
      
      {/* Pages without Sidebar/Banner */}
      <Route path="/home" element={<HomePage />} />

      {/* Pages with Sidebar/Banner layout */}
      <Route path="/build" element={<ProtectedRoute><AppBuilderPage /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
      <Route path="/agents" element={<ProtectedRoute><AgentsPage /></ProtectedRoute>} />
      <Route path="/onedrive" element={<ProtectedRoute><SiloOneDrivePage /></ProtectedRoute>} />
      <Route path="/privacy" element={<ProtectedRoute><PrivacyPolicyPage /></ProtectedRoute>} />
      <Route path="/terms" element={<ProtectedRoute><TermsOfServicePage /></ProtectedRoute>} />
      <Route path="/changelog" element={<ProtectedRoute><ChangelogPage /></ProtectedRoute>} />
      <Route path="/docs" element={<ProtectedRoute><DocsPage /></ProtectedRoute>} />
      <Route path="/developer" element={<ProtectedRoute><DeveloperAPIPage /></ProtectedRoute>} />
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
