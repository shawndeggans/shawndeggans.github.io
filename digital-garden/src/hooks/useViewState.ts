import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ViewState, BreadcrumbItem } from '../types/navigation';

export const useViewState = (): {
  viewState: ViewState;
  breadcrumbs: BreadcrumbItem[];
} => {
  const location = useLocation();
  const [viewState, setViewState] = useState<ViewState>({
    currentView: 'graph',
  });

  useEffect(() => {
    const path = location.pathname;
    
    if (path === '/' || path === '') {
      setViewState({
        currentView: 'graph',
      });
    } else if (path.startsWith('/timeline')) {
      setViewState({
        currentView: 'timeline',
      });
    } else if (path.startsWith('/content/')) {
      const contentSlug = path.replace('/content/', '');
      setViewState({
        currentView: 'content',
        contentSlug,
        // Store previous view in sessionStorage for breadcrumbs
        previousView: sessionStorage.getItem('previousView') as 'graph' | 'timeline' || 'graph',
      });
    }
  }, [location]);

  // Store current view for breadcrumb navigation
  useEffect(() => {
    if (viewState.currentView !== 'content') {
      sessionStorage.setItem('previousView', viewState.currentView);
    }
  }, [viewState.currentView]);

  // Generate breadcrumbs based on current view
  const breadcrumbs: BreadcrumbItem[] = (() => {
    switch (viewState.currentView) {
      case 'graph':
        return [{ label: 'Graph' }];
      
      case 'timeline':
        return [{ label: 'Timeline' }];
      
      case 'content':
        const items: BreadcrumbItem[] = [
          {
            label: viewState.previousView === 'timeline' ? 'Timeline' : 'Graph',
            path: viewState.previousView === 'timeline' ? '/timeline' : '/',
          },
        ];
        
        if (viewState.contentSlug) {
          // You could fetch the actual title here from contentMap
          items.push({
            label: viewState.contentSlug.replace(/-/g, ' '),
          });
        }
        
        return items;
      
      default:
        return [];
    }
  })();

  return { viewState, breadcrumbs };
};