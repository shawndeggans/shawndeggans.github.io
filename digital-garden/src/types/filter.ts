/**
 * Filter Types
 * 
 * Defines the global filter system that affects both graph and timeline views.
 * Supports full URL state encoding for bookmarking and sharing.
 */

import { UnifiedNode, UnifiedLink } from './unifiedGraph';

// Core filter state interface
export interface FilterState {
  searchText: string;              // Text search across titles, content, and tags
  selectedTags: string[];          // Array of selected tag names
  dateRange?: DateRange;           // Optional date filtering
  nodeTypes: string[];             // Filter by node types (content, tag, etc.)
  linkTypes: string[];             // Filter by link types
}

// Date range filtering
export interface DateRange {
  start: Date;
  end: Date;
}

// Filter application results
export interface FilteredData {
  nodes: UnifiedNode[];
  links: UnifiedLink[];
  matchedNodes: Set<string>;       // Node IDs that match filter criteria
  highlightedNodes: Set<string>;   // Nodes to highlight in visualization
  statistics: FilterStatistics;
}

// Filter statistics for UI display
export interface FilterStatistics {
  totalNodes: number;
  filteredNodes: number;
  totalLinks: number;
  filteredLinks: number;
  nodeTypeCounts: Record<string, number>;
  tagCounts: Record<string, number>;
  matchingSources: SearchMatchSources;
}

// Where search matches were found
export interface SearchMatchSources {
  titles: number;                  // Matches in content titles
  content: number;                 // Matches in content body
  tags: number;                    // Matches in tag names
  descriptions: number;            // Matches in descriptions
}

// URL parameter names for state synchronization
export const URL_PARAMS = {
  SEARCH: 'search',
  TAGS: 'tags',
  DATE_START: 'date_start',
  DATE_END: 'date_end',
  NODE_TYPES: 'node_types',
  LINK_TYPES: 'link_types'
} as const;

// URL state interface for serialization
export interface URLFilterState {
  search?: string;
  tags?: string;                   // Comma-separated tag list
  date_start?: string;             // ISO date string
  date_end?: string;               // ISO date string
  node_types?: string;             // Comma-separated type list
  link_types?: string;             // Comma-separated type list
}

// Filter configuration options
export interface FilterConfig {
  // Search behavior
  searchOptions: {
    caseSensitive: boolean;
    wholeWords: boolean;
    includeContent: boolean;        // Search in content body text
    includeDescriptions: boolean;   // Search in descriptions
    highlightMatches: boolean;      // Highlight matching text
  };
  
  // Tag filtering behavior
  tagOptions: {
    mode: 'any' | 'all';           // Match any selected tags vs all selected tags
    caseSensitive: boolean;
    showRelated: boolean;          // Show nodes connected to matching tags
  };
  
  // Date filtering behavior
  dateOptions: {
    includeUndated: boolean;       // Include content without dates
    granularity: 'day' | 'month' | 'year';
  };
  
  // Visual feedback
  visualOptions: {
    fadeUnmatched: boolean;        // Fade nodes that don't match
    highlightConnections: boolean; // Highlight connections to matched nodes
    animateFiltering: boolean;     // Animate filter application
  };
}

// Default filter state
export const DEFAULT_FILTER_STATE: FilterState = {
  searchText: '',
  selectedTags: [],
  nodeTypes: ['content', 'tag'],
  linkTypes: ['content_link', 'tag_assignment', 'tag_cooccurrence']
};

// Default filter configuration
export const DEFAULT_FILTER_CONFIG: FilterConfig = {
  searchOptions: {
    caseSensitive: false,
    wholeWords: false,
    includeContent: true,
    includeDescriptions: true,
    highlightMatches: true
  },
  tagOptions: {
    mode: 'any',
    caseSensitive: false,
    showRelated: true
  },
  dateOptions: {
    includeUndated: true,
    granularity: 'day'
  },
  visualOptions: {
    fadeUnmatched: true,
    highlightConnections: true,
    animateFiltering: true
  }
};

// Filter operation types
export type FilterOperation = 
  | { type: 'SET_SEARCH_TEXT'; payload: string }
  | { type: 'ADD_TAG'; payload: string }
  | { type: 'REMOVE_TAG'; payload: string }
  | { type: 'SET_TAGS'; payload: string[] }
  | { type: 'SET_DATE_RANGE'; payload: DateRange | undefined }
  | { type: 'SET_NODE_TYPES'; payload: string[] }
  | { type: 'SET_LINK_TYPES'; payload: string[] }
  | { type: 'CLEAR_FILTERS' }
  | { type: 'LOAD_FROM_URL'; payload: URLFilterState };

// Filter validation and utilities
export interface FilterValidation {
  isValid: boolean;
  errors: FilterValidationError[];
  warnings: FilterValidationWarning[];
}

export interface FilterValidationError {
  field: keyof FilterState;
  message: string;
  value: unknown;
}

export interface FilterValidationWarning {
  field: keyof FilterState;
  message: string;
  suggestion: string;
}

// Advanced filter features
export interface SavedFilter {
  id: string;
  name: string;
  description?: string;
  filterState: FilterState;
  createdAt: Date;
  lastUsed?: Date;
  useCount: number;
}

export interface FilterPreset {
  id: string;
  name: string;
  description: string;
  filterState: Partial<FilterState>;
  icon?: string;
}

// Common filter presets
export const FILTER_PRESETS: FilterPreset[] = [
  {
    id: 'recent',
    name: 'Recent Content',
    description: 'Content from the last 30 days',
    filterState: {
      dateRange: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: new Date()
      }
    },
    icon: '🕒'
  },
  {
    id: 'architecture',
    name: 'Architecture',
    description: 'Content related to software architecture',
    filterState: {
      selectedTags: ['software-architecture', 'system-design', 'architecture']
    },
    icon: '🏗️'
  },
  {
    id: 'data',
    name: 'Data & Analytics',
    description: 'Data engineering and analytics content',
    filterState: {
      selectedTags: ['data-architecture', 'data-modeling', 'analytics']
    },
    icon: '📊'
  }
];

// Filter event handlers interface
export interface FilterEventHandlers {
  onSearchChange: (searchText: string) => void;
  onTagAdd: (tag: string) => void;
  onTagRemove: (tag: string) => void;
  onDateRangeChange: (range: DateRange | undefined) => void;
  onFilterClear: () => void;
  onPresetApply: (preset: FilterPreset) => void;
  onFilterSave: (name: string, description?: string) => void;
}

// Type guards and utilities
export function isValidDateRange(range: DateRange): boolean {
  return range.start <= range.end;
}

export function isFilterEmpty(filter: FilterState): boolean {
  return !filter.searchText && 
         filter.selectedTags.length === 0 && 
         !filter.dateRange &&
         filter.nodeTypes.length === DEFAULT_FILTER_STATE.nodeTypes.length &&
         filter.linkTypes.length === DEFAULT_FILTER_STATE.linkTypes.length;
}

export function getFilterDescription(filter: FilterState): string {
  const parts: string[] = [];
  
  if (filter.searchText) {
    parts.push(`searching "${filter.searchText}"`);
  }
  
  if (filter.selectedTags.length > 0) {
    parts.push(`tagged ${filter.selectedTags.join(', ')}`);
  }
  
  if (filter.dateRange) {
    parts.push(`from ${filter.dateRange.start.toLocaleDateString()} to ${filter.dateRange.end.toLocaleDateString()}`);
  }
  
  if (parts.length === 0) {
    return 'No active filters';
  }
  
  return `Showing content ${parts.join(' and ')}`;
}