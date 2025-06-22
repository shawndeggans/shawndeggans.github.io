import React, { useState, useMemo } from 'react';
import { useTimelineData } from '../../hooks/useGraphData';
import { useFilterState } from '../../hooks/useFilterState';
import { TimelineGroup } from './TimelineGroup';
import { TimelineGrouping, TimelineSortOrder } from '../../types/timeline';
import './TimelineView.css';

export const TimelineView: React.FC = () => {
  const { timelineEntries, entriesByYear, entriesByMonth, isLoading } = useTimelineData();
  const { filterState } = useFilterState();
  const [grouping, setGrouping] = useState<TimelineGrouping>('month');
  const [sortOrder, setSortOrder] = useState<TimelineSortOrder>('newest');

  // Group entries based on grouping selection
  const groupedEntries = useMemo(() => {
    if (grouping === 'year') {
      return Array.from(entriesByYear.entries())
        .sort((a, b) => sortOrder === 'newest' ? b[0] - a[0] : a[0] - b[0])
        .map(([year, entries]) => ({
          period: year.toString(),
          entries: sortOrder === 'newest' ? entries : [...entries].reverse()
        }));
    } else {
      // Month grouping
      const groups: { period: string; entries: any[] }[] = [];
      const months = Array.from(entriesByMonth.entries())
        .sort((a, b) => {
          const [yearA, monthA] = a[0].split('-').map(Number);
          const [yearB, monthB] = b[0].split('-').map(Number);
          if (sortOrder === 'newest') {
            return yearB - yearA || monthB - monthA;
          }
          return yearA - yearB || monthA - monthB;
        });

      for (const [key, entries] of months) {
        const [year, month] = key.split('-');
        const monthName = new Date(Number(year), Number(month)).toLocaleDateString('en-US', { 
          month: 'long', 
          year: 'numeric' 
        });
        groups.push({
          period: monthName,
          entries: sortOrder === 'newest' ? entries : [...entries].reverse()
        });
      }
      return groups;
    }
  }, [entriesByYear, entriesByMonth, grouping, sortOrder]);

  if (isLoading) {
    return (
      <div className="timeline-view">
        <div className="timeline-loading">
          <div className="loading-spinner"></div>
          <p>Loading timeline...</p>
        </div>
      </div>
    );
  }

  if (timelineEntries.length === 0) {
    return (
      <div className="timeline-view">
        <div className="timeline-empty">
          <p>No content matches your filters.</p>
          <p>Try adjusting your search or tag filters.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="timeline-view">
      {/* Minimal controls - just grouping and sort */}
      <div className="timeline-controls">
        <div className="timeline-stats">
          <span>{timelineEntries.length} entries</span>
          {filterState.selectedTags.length > 0 && (
            <span className="filter-indicator">
              • Filtered by {filterState.selectedTags.length} tag{filterState.selectedTags.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className="timeline-options">
          <select 
            value={grouping} 
            onChange={(e) => setGrouping(e.target.value as TimelineGrouping)}
            className="timeline-select"
          >
            <option value="month">By Month</option>
            <option value="year">By Year</option>
          </select>
          <select 
            value={sortOrder} 
            onChange={(e) => setSortOrder(e.target.value as TimelineSortOrder)}
            className="timeline-select"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      <div className="timeline-content">
        {groupedEntries.map((group, index) => (
          <TimelineGroup
            key={group.period}
            group={group}
            isLast={index === groupedEntries.length - 1}
          />
        ))}
      </div>
    </div>
  );
};

export default TimelineView;