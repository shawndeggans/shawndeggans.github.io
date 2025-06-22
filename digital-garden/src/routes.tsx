import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage/HomePage';
import ContentView from './components/ContentView/ContentView';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Home page: Unified exploration interface */}
      <Route path="/" element={<HomePage />} />
      
      {/* Content pages: Individual content display */}
      <Route path="/content/:slug" element={<ContentView />} />
      
      {/* Fallback: Redirect to home */}
      <Route path="*" element={<HomePage />} />
    </Routes>
  );
};

export default AppRoutes;