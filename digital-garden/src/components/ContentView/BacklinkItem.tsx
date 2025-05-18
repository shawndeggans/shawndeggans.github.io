import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { BacklinkInfo } from '../../types/backlinks';
import { ParsedContent } from '../../types/content';
import BacklinkPreview from './BacklinkPreview';
import './BacklinkItem.css';

interface BacklinkItemProps {
  backlink: BacklinkInfo;
  content?: ParsedContent; // For preview functionality
  showContext?: boolean;
  className?: string;
}

export const BacklinkItem: React.FC<BacklinkItemProps> = ({
  backlink,
  content,
  showContext = false,
  className = '',
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [previewPosition, setPreviewPosition] = useState({ x: 0, y: 0 });
  const itemRef = useRef<HTMLDivElement>(null);
  const previewTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (event: React.MouseEvent) => {
    if (!content) return;

    // Clear any existing timeout
    if (previewTimeoutRef.current) {
      clearTimeout(previewTimeoutRef.current);
    }

    // Set position based on mouse position
    const rect = event.currentTarget.getBoundingClientRect();
    setPreviewPosition({
      x: rect.right + 8,
      y: rect.top,
    });

    // Show preview after short delay
    previewTimeoutRef.current = setTimeout(() => {
      setShowPreview(true);
    }, 500);
  };

  const handleMouseLeave = () => {
    // Clear timeout and hide preview
    if (previewTimeoutRef.current) {
      clearTimeout(previewTimeoutRef.current);
    }
    setShowPreview(false);
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <>
      <div
        ref={itemRef}
        className={`backlink-item ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="backlink-item-header">
          <Link
            to={`/content/${backlink.slug}`}
            className="backlink-item-title"
          >
            {backlink.title}
          </Link>
          <span className="backlink-item-date">
            {formatDate(backlink.date)}
          </span>
        </div>

        <p className="backlink-item-excerpt">{backlink.excerpt}</p>

        {showContext && backlink.contextSnippet && (
          <div className="backlink-item-context">
            <span className="backlink-item-context-label">Context:</span>
            <span className="backlink-item-context-text">
              ...{backlink.contextSnippet}...
            </span>
          </div>
        )}

        {backlink.tags.length > 0 && (
          <div className="backlink-item-tags">
            {backlink.tags.map((tag) => (
              <span key={tag} className="backlink-item-tag">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Preview modal */}
      {showPreview && content && (
        <BacklinkPreview
          content={content}
          position={previewPosition}
          onClose={() => setShowPreview(false)}
        />
      )}
    </>
  );
};

export default BacklinkItem;