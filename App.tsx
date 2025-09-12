
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import HomePage from './components/pages/HomePage';
import AppBuilderPage from './components/pages/AppBuilderPage';
import SettingsPage from './components/pages/SettingsPage';

function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/build" element={<AppBuilderPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </HashRouter>
    </AppProvider>
  );
}

export default App;
