import React from 'react';
import { generateContentPreview } from '../../utils/backlinkData';
import { ParsedContent } from '../../types/content';
import './BacklinkPreview.css';

interface BacklinkPreviewProps {
  content: ParsedContent;
  onClose: () => void;
  position: { x: number; y: number };
}

export const BacklinkPreview: React.FC<BacklinkPreviewProps> = ({
  content,
  onClose,
  position,
}) => {
  const preview = generateContentPreview(content);

  return (
    <div className="backlink-preview-wrapper">
      <div className="backlink-preview-backdrop" onClick={onClose} />
      
      <div
        className="backlink-preview-card"
        style={{
          left: position.x,
          top: position.y,
        }}
      >
        <div className="backlink-preview-header">
          <h3 className="backlink-preview-title">{preview.title}</h3>
          <button
            className="backlink-preview-close"
            onClick={onClose}
            aria-label="Close preview"
          >
            ×
          </button>
        </div>
        
        <div className="backlink-preview-meta">
          <span className="backlink-preview-reading-time">
            {preview.readingTime} min read
          </span>
          <span className="backlink-preview-date">
            {preview.lastModified.toLocaleDateString()}
          </span>
        </div>
        
        <p className="backlink-preview-excerpt">{preview.excerpt}</p>
        
        {preview.tags.length > 0 && (
          <div className="backlink-preview-tags">
            {preview.tags.map((tag) => (
              <span key={tag} className="backlink-preview-tag">
                {tag}
              </span>
            ))}
          </div>
        )}
        
        <div className="backlink-preview-actions">
          <button
            className="backlink-preview-action"
            onClick={() => {
              window.location.hash = `/content/${preview.slug}`;
              onClose();
            }}
          >
            Read Full Content →
          </button>
        </div>
      </div>
    </div>
  );
};

export default BacklinkPreview;