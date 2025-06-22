/**
 * TagLink Component
 * 
 * Universal clickable tag component that navigates to home with tag filter applied.
 * Used throughout the application for consistent tag interaction behavior.
 */

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFilterState } from '../../hooks/useFilterState';
import './TagLink.css';

interface TagLinkProps {
  tag: string;
  variant?: 'default' | 'inline' | 'badge' | 'minimal';
  size?: 'small' | 'medium' | 'large';
  className?: string;
  onClick?: (tag: string, event: React.MouseEvent) => void;
  showCount?: boolean;
  count?: number;
  removable?: boolean;
  onRemove?: (tag: string) => void;
  disabled?: boolean;
}

export const TagLink: React.FC<TagLinkProps> = ({
  tag,
  variant = 'default',
  size = 'medium',
  className,
  onClick,
  showCount = false,
  count,
  removable = false,
  onRemove,
  disabled = false
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addTag, hasTag } = useFilterState();

  const isActive = hasTag(tag);
  const isOnHomePage = location.pathname === '/' || location.pathname === '';

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (disabled) return;

    // Call custom onClick handler if provided
    if (onClick) {
      onClick(tag, event);
      return;
    }

    // If we're already on the home page, just add the tag
    if (isOnHomePage) {
      if (!isActive) {
        addTag(tag);
      }
    } else {
      // Navigate to home page and add the tag filter
      navigate('/', { replace: false });
      
      // Add tag with a slight delay to ensure navigation completes
      setTimeout(() => {
        if (!hasTag(tag)) {
          addTag(tag);
        }
      }, 100);
    }
  };

  const handleRemove = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (onRemove) {
      onRemove(tag);
    }
  };

  const baseClasses = [
    'tag-link',
    `tag-link--${variant}`,
    `tag-link--${size}`,
    isActive && 'tag-link--active',
    disabled && 'tag-link--disabled',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type="button"
      className={baseClasses}
      onClick={handleClick}
      disabled={disabled}
      title={disabled ? undefined : `Filter by "${tag}"`}
      aria-label={`Filter content by tag: ${tag}`}
    >
      <span className="tag-link__text">
        {tag}
      </span>
      
      {showCount && count !== undefined && (
        <span className="tag-link__count">
          {count}
        </span>
      )}
      
      {removable && (
        <button
          type="button"
          className="tag-link__remove"
          onClick={handleRemove}
          aria-label={`Remove tag: ${tag}`}
          title={`Remove ${tag} filter`}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M9 3L3 9M3 3L9 9"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
    </button>
  );
};

// Helper component for rendering lists of tags
interface TagListProps {
  tags: string[];
  variant?: TagLinkProps['variant'];
  size?: TagLinkProps['size'];
  className?: string;
  showCounts?: boolean;
  getCounts?: (tag: string) => number;
  maxDisplay?: number;
  onTagClick?: (tag: string) => void;
}

export const TagList: React.FC<TagListProps> = ({
  tags,
  variant = 'default',
  size = 'medium',
  className,
  showCounts = false,
  getCounts,
  maxDisplay,
  onTagClick
}) => {
  const displayTags = maxDisplay ? tags.slice(0, maxDisplay) : tags;
  const remainingCount = maxDisplay && tags.length > maxDisplay ? tags.length - maxDisplay : 0;

  if (tags.length === 0) {
    return null;
  }

  return (
    <div className={`tag-list ${className || ''}`}>
      {displayTags.map(tag => (
        <TagLink
          key={tag}
          tag={tag}
          variant={variant}
          size={size}
          showCount={showCounts}
          count={getCounts?.(tag)}
          onClick={onTagClick ? (tagName) => onTagClick(tagName) : undefined}
        />
      ))}
      
      {remainingCount > 0 && (
        <span className="tag-list__more">
          +{remainingCount} more
        </span>
      )}
    </div>
  );
};

// Specialized component for content metadata tags
interface ContentTagsProps {
  tags: string[];
  className?: string;
  inline?: boolean;
}

export const ContentTags: React.FC<ContentTagsProps> = ({
  tags,
  className,
  inline = false
}) => {
  if (tags.length === 0) {
    return null;
  }

  return (
    <div className={`content-tags ${inline ? 'content-tags--inline' : ''} ${className || ''}`}>
      {!inline && (
        <span className="content-tags__label">Tags:</span>
      )}
      <TagList
        tags={tags}
        variant={inline ? 'inline' : 'badge'}
        size="small"
      />
    </div>
  );
};

// Filter chip component for active filters
interface FilterChipProps {
  tag: string;
  onRemove: (tag: string) => void;
  className?: string;
}

export const FilterChip: React.FC<FilterChipProps> = ({
  tag,
  onRemove,
  className
}) => {
  return (
    <TagLink
      tag={tag}
      variant="badge"
      size="small"
      className={`filter-chip ${className || ''}`}
      removable={true}
      onRemove={onRemove}
      onClick={() => {}} // Prevent navigation when clicking filter chips
    />
  );
};

export default TagLink;