/**
 * HomePage Component
 * 
 * Main unified exploration interface with:
 * - Global filter at top
 * - Full-width unified graph as hero section  
 * - Timeline view below for secondary content discovery
 */

import React from 'react';
import { useGraphData } from '../../hooks/useGraphData';
import { useFilterState } from '../../hooks/useFilterState';
import './HomePage.css';

// Import components (will be created next)
import { GlobalFilter } from './GlobalFilter';
import { UnifiedGraph } from './UnifiedGraph';
import { TimelineView } from '../TimelineView/TimelineView';

interface HomePageProps {
  className?: string;
}

export const HomePage: React.FC<HomePageProps> = ({ className }) => {
  const { 
    filteredData, 
    loadingState, 
    error, 
    visibleNodes, 
    visibleLinks,
    refreshData 
  } = useGraphData();

  const { 
    filterState, 
    isFilterActive, 
    filterDescription 
  } = useFilterState();

  // Handle loading states
  if (loadingState === 'loading') {
    return (
      <div className={`home-page home-page--loading ${className || ''}`}>
        <div className="home-page__loading">
          <div className="loading-spinner" />
          <p>Loading your digital garden...</p>
        </div>
      </div>
    );
  }

  if (loadingState === 'error') {
    return (
      <div className={`home-page home-page--error ${className || ''}`}>
        <div className="home-page__error">
          <h2>Unable to load content</h2>
          <p>{error}</p>
          <button 
            onClick={refreshData}
            className="btn btn--primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!filteredData) {
    return (
      <div className={`home-page home-page--empty ${className || ''}`}>
        <div className="home-page__empty">
          <h2>No content found</h2>
          <p>Your digital garden appears to be empty.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`home-page ${className || ''}`}>
      {/* Header with global filter */}
      <header className="home-page__header">
        <GlobalFilter />
        
        {/* Filter status */}
        {isFilterActive && (
          <div className="home-page__filter-status">
            <span className="filter-status__text">
              {filterDescription}
            </span>
            <span className="filter-status__results">
              Showing {visibleNodes} nodes, {visibleLinks} connections
            </span>
          </div>
        )}
      </header>

      {/* Main content area */}
      <main className="home-page__main">
        {/* Hero section: Unified graph visualization */}
        <section className="home-page__graph-section">
          <div className="graph-section__header">
            <div className="graph-stats">
              <span className="stat">
                <strong>{visibleNodes}</strong> nodes
              </span>
              <span className="stat">
                <strong>{visibleLinks}</strong> connections
              </span>
            </div>
          </div>
          
          <div className="graph-section__visualization">
            <UnifiedGraph 
              data={filteredData}
            />
          </div>
        </section>

        {/* Secondary section: Timeline view */}
        <section className="home-page__timeline-section">
          <div className="timeline-section__content">
            <TimelineView />
          </div>
        </section>
      </main>

      {/* Optional: Statistics footer */}
      <footer className="home-page__footer">
        <div className="footer-stats">
          <div className="stat-item">
            <span className="stat-label">Total Content</span>
            <span className="stat-value">{visibleNodes}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Active Filters</span>
            <span className="stat-value">
              {[
                filterState.searchText && 'Search',
                filterState.selectedTags.length > 0 && 'Tags',
                filterState.dateRange && 'Date Range'
              ].filter(Boolean).join(', ') || 'None'}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Last Updated</span>
            <span className="stat-value">
              {new Date().toLocaleDateString()}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;