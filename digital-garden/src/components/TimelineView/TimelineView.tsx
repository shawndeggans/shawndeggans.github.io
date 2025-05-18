import React, { useState, useMemo } from 'react';
import { useContent } from '../../hooks/useContent';
import { TimelineFilters } from './TimelineFilters';
import { TimelineGroup } from './TimelineGroup';
import { 
  transformContentToTimeline, 
  groupTimelineEntries, 
  filterTimelineEntries,
  getUniqueTimelineTags
} from '../../utils/timelineData';
import { TimelineGrouping, TimelineSortOrder, TimelineFilters as TimelineFiltersType } from '../../types/timeline';
import './TimelineView.css';

export const TimelineView: React.FC = () => {
  const { contentMap, loading, error } = useContent();
  const [filters, setFilters] = useState<TimelineFiltersType>({ tags: [] });
  const [grouping, setGrouping] = useState<TimelineGrouping>('month');
  const [sortOrder, setSortOrder] = useState<TimelineSortOrder>('newest');

  // Transform content to timeline entries
  const allEntries = useMemo(() => {
    if (!contentMap.size) return [];
    return transformContentToTimeline(contentMap);
  }, [contentMap]);

  // Filter entries based on current filters
  const filteredEntries = useMemo(() => {
    return filterTimelineEntries(allEntries, filters);
  }, [allEntries, filters]);

  // Group filtered entries
  const groupedEntries = useMemo(() => {
    return groupTimelineEntries(filteredEntries, grouping, sortOrder);
  }, [filteredEntries, grouping, sortOrder]);

  // Get available tags for filtering
  const availableTags = useMemo(() => {
    return getUniqueTimelineTags(allEntries);
  }, [allEntries]);

  if (loading) {
    return (
      <div className="timeline-view">
        <div className="timeline-loading">
          <div className="loading-spinner"></div>
          <p>Loading timeline...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="timeline-view">
        <div className="timeline-error">
          <p>Error loading content: {error}</p>
        </div>
      </div>
    );
  }

  if (allEntries.length === 0) {
    return (
      <div className="timeline-view">
        <div className="timeline-empty">
          <p>No content available for timeline.</p>
          <p>Add some markdown files to see them here!</p>
        </div>
      </div>
    );
  }
  return (
    <div className="timeline-view">
      <TimelineFilters
        filters={filters}
        grouping={grouping}
        sortOrder={sortOrder}
        availableTags={availableTags}
        onFiltersChange={setFilters}
        onGroupingChange={setGrouping}
        onSortOrderChange={setSortOrder}
        totalEntries={allEntries.length}
        filteredEntries={filteredEntries.length}
      />

      {filteredEntries.length === 0 ? (
        <div className="timeline-no-results">
          <p>No content matches your current filters.</p>
          <p>Try adjusting your search or clearing filters.</p>
        </div>
      ) : (
        <div className="timeline-content">
          {groupedEntries.map((group, index) => (
            <TimelineGroup
              key={group.period}
              group={group}
              isLast={index === groupedEntries.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TimelineView;