export interface TimelineEntry {
  id: string;
  title: string;
  date: string;
  excerpt?: string;
  tags: string[];
  readingTime?: number;
  wordCount?: number;
}

export interface TimelineGroup {
  period: string; // e.g., "2024", "March 2024", "2024-03"
  entries: TimelineEntry[];
}

export interface TimelineFilters {
  tags: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  searchQuery?: string;
}

export type TimelineGrouping = 'year' | 'month' | 'week';

export type TimelineSortOrder = 'newest' | 'oldest';