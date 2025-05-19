import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NavigationItem } from '../../types/navigation';
import './Navigation.css';

interface NavigationProps {
  className?: string;
}

export const Navigation: React.FC<NavigationProps> = ({ className = '' }) => {
  const location = useLocation();

  const navigationItems: NavigationItem[] = [
    {
      id: 'graph',
      label: 'Graph',
      path: '/',
    },
    {
      id: 'timeline',
      label: 'Timeline',
      path: '/timeline',
    },
    {
      id: 'tag-graph',
      label: 'Tag Network',
      path: '/tag-graph',
    },
    {
      id: 'about',           // ADD THIS
      label: 'About',        // ADD THIS
      path: '/about',        // ADD THIS
    },                       // ADD THIS
  ];

  const isActive = (path: string): boolean => {
    if (path === '/') {
      return location.pathname === '/' || location.pathname === '';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className={`navigation ${className}`}>
      <div className="navigation-brand">
        <Link to="/" className="brand-link">
          <span className="brand-text">Curiouser and Curiouser!</span>
        </Link>
      </div>
      
      <div className="navigation-links">
        {navigationItems.map((item) => (
          <Link
            key={item.id}
            to={item.path}
            className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;