
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import HomePage from './components/pages/HomePage';
import AppBuilderPage from './components/pages/AppBuilderPage';

function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/build" element={<AppBuilderPage />} />
        </Routes>
      </HashRouter>
    </AppProvider>
  );
}

export default App;
