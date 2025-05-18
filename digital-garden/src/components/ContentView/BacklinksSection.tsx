import React, { useState } from 'react';
import { BacklinkInfo } from '../../types/backlinks';
import { ParsedContent } from '../../types/content';
import BacklinkItem from './BacklinkItem';
import './BacklinksSection.css';

interface BacklinksSectionProps {
  title: string;
  backlinks: BacklinkInfo[];
  contentMap: Map<string, ParsedContent>;
  emptyMessage?: string;
  showContext?: boolean;
  initialCollapsed?: boolean;
  maxDisplay?: number;
}

export const BacklinksSection: React.FC<BacklinksSectionProps> = ({
  title,
  backlinks,
  contentMap,
  emptyMessage = 'No connections found',
  showContext = false,
  initialCollapsed = false,
  maxDisplay = 10,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed);
  const [showAll, setShowAll] = useState(false);

  if (backlinks.length === 0) {
    return (
      <div className="backlinks-section">
        <div className="backlinks-section-header">
          <h3 className="backlinks-section-title">{title}</h3>
          <span className="backlinks-section-count">({backlinks.length})</span>
        </div>
        <p className="backlinks-section-empty">{emptyMessage}</p>
      </div>
    );
  }

  const displayedBacklinks = showAll ? backlinks : backlinks.slice(0, maxDisplay);
  const hasMore = backlinks.length > maxDisplay;

  return (
    <div className="backlinks-section">
      <div className="backlinks-section-header">
        <button
          className="backlinks-section-toggle"
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-expanded={!isCollapsed}
        >
          <span className={`backlinks-section-icon ${isCollapsed ? 'collapsed' : ''}`}>
            ▼
          </span>
          <h3 className="backlinks-section-title">{title}</h3>
          <span className="backlinks-section-count">({backlinks.length})</span>
        </button>
      </div>

      {!isCollapsed && (
        <div className="backlinks-section-content">
          <div className="backlinks-section-list">
            {displayedBacklinks.map((backlink) => (
              <BacklinkItem
                key={backlink.slug}
                backlink={backlink}
                content={contentMap.get(backlink.slug)}
                showContext={showContext}
              />
            ))}
          </div>

          {hasMore && !showAll && (
            <button
              className="backlinks-section-show-more"
              onClick={() => setShowAll(true)}
            >
              Show {backlinks.length - maxDisplay} more...
            </button>
          )}

          {showAll && hasMore && (
            <button
              className="backlinks-section-show-less"
              onClick={() => setShowAll(false)}
            >
              Show less
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default BacklinksSection;