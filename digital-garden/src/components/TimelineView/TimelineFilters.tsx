import React from 'react';
import type { TimelineFilters as TimelineFiltersType, TimelineGrouping, TimelineSortOrder } from '../../types/timeline';

interface TimelineFiltersProps {
  filters: TimelineFiltersType;
  grouping: TimelineGrouping;
  sortOrder: TimelineSortOrder;
  availableTags: string[];
  onFiltersChange: (filters: TimelineFiltersType) => void;
  onGroupingChange: (grouping: TimelineGrouping) => void;
  onSortOrderChange: (sortOrder: TimelineSortOrder) => void;
  totalEntries: number;
  filteredEntries: number;
}

export const TimelineFilters: React.FC<TimelineFiltersProps> = ({
  filters,
  grouping,
  sortOrder,
  availableTags,
  onFiltersChange,
  onGroupingChange,
  onSortOrderChange,
  totalEntries,
  filteredEntries,
}) => {
  const handleTagToggle = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];
    
    onFiltersChange({ ...filters, tags: newTags });
  };

  const handleSearchChange = (searchQuery: string) => {
    onFiltersChange({ ...filters, searchQuery: searchQuery || undefined });
  };

  const clearFilters = () => {
    onFiltersChange({ tags: [] });
  };

  const hasActiveFilters = filters.tags.length > 0 || filters.searchQuery;

  return (
    <div className="timeline-filters">
      <div className="timeline-filters-header">
        <div className="timeline-controls">
          <div className="timeline-control-group">
            <label htmlFor="grouping-select">Group by:</label>
            <select
              id="grouping-select"
              value={grouping}
              onChange={(e) => onGroupingChange(e.target.value as TimelineGrouping)}
              className="timeline-select"
            >
              <option value="year">Year</option>
              <option value="month">Month</option>
              <option value="week">Week</option>
            </select>
          </div>

          <div className="timeline-control-group">
            <label htmlFor="sort-select">Sort:</label>
            <select
              id="sort-select"
              value={sortOrder}
              onChange={(e) => onSortOrderChange(e.target.value as TimelineSortOrder)}
              className="timeline-select"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        <div className="timeline-stats">
          <span className="timeline-count">
            {filteredEntries === totalEntries 
              ? `${totalEntries} entries`
              : `${filteredEntries} of ${totalEntries} entries`
            }
          </span>
        </div>
      </div>

      <div className="timeline-search">
        <input
          type="text"
          placeholder="Search content..."
          value={filters.searchQuery || ''}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="timeline-search-input"
        />
      </div>

      {availableTags.length > 0 && (
        <div className="timeline-tag-filters">
          <div className="timeline-tag-filters-header">
            <h3>Filter by tags:</h3>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="timeline-clear-filters">
                Clear all
              </button>
            )}
          </div>
          
          <div className="timeline-tags">
            {availableTags.map(tag => (
              <button
                key={tag}
                onClick={() => handleTagToggle(tag)}
                className={`timeline-tag ${filters.tags.includes(tag) ? 'active' : ''}`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};