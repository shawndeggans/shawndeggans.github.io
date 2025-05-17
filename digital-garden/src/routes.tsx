import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ContentView from './components/ContentView/ContentView';
import GraphView from './components/GraphView/GraphView';
import TimelineView from './components/TimelineView/TimelineView';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<GraphView />} />
      <Route path="/timeline" element={<TimelineView />} />
      <Route path="/content/:slug" element={<ContentView />} />
      <Route path="*" element={<div>Page not found</div>} />
    </Routes>
  );
};

export default AppRoutes;