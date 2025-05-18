import React from 'react';
import Navigation from '../Navigation/Navigation';
import Breadcrumb from '../Navigation/Breadcrumb';
import { useViewState } from '../../hooks/useViewState';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
  showBreadcrumb?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  showBreadcrumb = true 
}) => {
  const { breadcrumbs } = useViewState();

  return (
    <div className="layout">
      <Navigation />
      {showBreadcrumb && <Breadcrumb items={breadcrumbs} />}
      <main className="layout-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;