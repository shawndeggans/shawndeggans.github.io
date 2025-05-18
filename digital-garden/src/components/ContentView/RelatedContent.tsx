import React from 'react';
import { Link } from 'react-router-dom';
import { RelatedContent as RelatedContentType } from '../../types/backlinks';
import './RelatedContent.css';

interface RelatedContentProps {
  related: RelatedContentType[];
  maxDisplay?: number;
}

export const RelatedContent: React.FC<RelatedContentProps> = ({
  related,
  maxDisplay = 5,
}) => {
  if (related.length === 0) {
    return null;
  }

  const displayedRelated = related.slice(0, maxDisplay);

  const getConnectionIcon = (type: string): string => {
    switch (type) {
      case 'backlink':
        return '🔗';
      case 'tag':
        return '🏷️';
      default:
        return '💭';
    }
  };

  const getConnectionLabel = (item: RelatedContentType): string => {
    switch (item.connectionType) {
      case 'backlink':
        return 'Linked content';
      case 'tag':
        return `Shared tags: ${item.sharedTags?.join(', ')}`;
      default:
        return 'Related content';
    }
  };

  return (
    <div className="related-content">
      <h3 className="related-content-title">Related Content</h3>
      
      <div className="related-content-list">
        {displayedRelated.map((item) => (
          <div key={item.content.slug} className="related-content-item">
            <div className="related-content-item-header">
              <span className="related-content-icon">
                {getConnectionIcon(item.connectionType)}
              </span>
              <Link
                to={`/content/${item.content.slug}`}
                className="related-content-link"
              >
                {item.content.metadata.title}
              </Link>
              <span className="related-content-score">
                {item.relevanceScore}
              </span>
            </div>
            
            <p className="related-content-excerpt">
              {item.content.content.slice(0, 120).replace(/#+\s+/g, '')}...
            </p>
            
            <div className="related-content-meta">
              <span className="related-content-connection">
                {getConnectionLabel(item)}
              </span>
              <span className="related-content-date">
                {new Date(item.content.metadata.date).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      {related.length > maxDisplay && (
        <p className="related-content-more">
          And {related.length - maxDisplay} more related items...
        </p>
      )}
    </div>
  );
};

export default RelatedContent;