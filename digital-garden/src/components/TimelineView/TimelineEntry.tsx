import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TimelineEntry as TimelineEntryType } from '../../types/timeline';

interface TimelineEntryProps {
  entry: TimelineEntryType;
  isFirst?: boolean;
  isLast?: boolean;
}

export const TimelineEntry: React.FC<TimelineEntryProps> = ({ 
  entry, 
  isFirst = false, 
  isLast = false 
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/content/${entry.id}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className={`timeline-entry ${isFirst ? 'first' : ''} ${isLast ? 'last' : ''}`}>
      <div className="timeline-entry-marker">
        <div className="timeline-entry-dot"></div>
        {!isLast && <div className="timeline-entry-line"></div>}
      </div>
      
      <div className="timeline-entry-content" onClick={handleClick}>
        <div className="timeline-entry-card">
          <div className="timeline-entry-header">
            <h3 className="timeline-entry-title">{entry.title}</h3>
            <div className="timeline-entry-date">{formatDate(entry.date)}</div>
          </div>
          
          {entry.excerpt && (
            <p className="timeline-entry-excerpt">{entry.excerpt}</p>
          )}
          
          <div className="timeline-entry-footer">
            <div className="timeline-entry-meta">
              {entry.readingTime && (
                <span className="timeline-entry-reading-time">
                  {entry.readingTime} min read
                </span>
              )}
              
              {entry.wordCount && (
                <span className="timeline-entry-word-count">
                  {entry.wordCount.toLocaleString()} words
                </span>
              )}
            </div>
            
            {entry.tags.length > 0 && (
              <div className="timeline-entry-tags">
                {entry.tags.map(tag => (
                  <span key={tag} className="timeline-entry-tag">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};