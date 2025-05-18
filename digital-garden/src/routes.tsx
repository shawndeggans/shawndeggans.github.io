import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ContentView from './components/ContentView/ContentView';
import GraphView from './components/GraphView/GraphView';
import TimelineView from './components/TimelineView/TimelineView';
import Layout from './components/Layout/Layout'; // ADD this import

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={
        <Layout>
          <GraphView />
        </Layout>
      } />
      <Route path="/timeline" element={
        <Layout>
          <TimelineView />
        </Layout>
      } />
      <Route path="/content/:slug" element={
        <Layout>
          <ContentView />
        </Layout>
      } />
      <Route path="*" element={
        <Layout>
          <div style={{ padding: 'var(--spacing-lg)', textAlign: 'center' }}>
            <h1>Page Not Found</h1>
            <p>The page you're looking for doesn't exist.</p>
          </div>
        </Layout>
      } />
    </Routes>
  );
};

export default AppRoutes;