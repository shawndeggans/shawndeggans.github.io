import React from 'react';
import { TimelineGroup as TimelineGroupType } from '../../types/timeline';
import { TimelineEntry } from './TimelineEntry';

interface TimelineGroupProps {
  group: TimelineGroupType;
  isLast?: boolean;
}

export const TimelineGroup: React.FC<TimelineGroupProps> = ({ group, isLast = false }) => {
  return (
    <div className="timeline-group">
      <div className="timeline-group-header">
        <h2 className="timeline-group-title">{group.period}</h2>
        <span className="timeline-group-count">
          {group.entries.length} {group.entries.length === 1 ? 'entry' : 'entries'}
        </span>
      </div>
      
      <div className="timeline-group-entries">
        {group.entries.map((entry, index) => (
          <TimelineEntry
            key={entry.id}
            entry={entry}
            isFirst={index === 0}
            isLast={index === group.entries.length - 1 && isLast}
          />
        ))}
      </div>
    </div>
  );
};