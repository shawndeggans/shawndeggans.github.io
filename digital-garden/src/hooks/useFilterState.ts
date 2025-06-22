/**
 * Filter State Hook
 * 
 * Manages global filter state with URL synchronization for bookmarking and sharing.
 * Provides the React interface for the filter system.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  FilterState, 
  URLFilterState, 
  DEFAULT_FILTER_STATE, 
  URL_PARAMS,
  FilterOperation,
  DateRange,
  isFilterEmpty,
  getFilterDescription
} from '../types/filter';

// Hook return type
interface UseFilterStateReturn {
  // Current state
  filterState: FilterState;
  isFilterActive: boolean;
  filterDescription: string;
  
  // Actions
  setSearchText: (text: string) => void;
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;
  setTags: (tags: string[]) => void;
  toggleTag: (tag: string) => void;
  setDateRange: (range: DateRange | undefined) => void;
  setNodeTypes: (types: string[]) => void;
  setLinkTypes: (types: string[]) => void;
  clearFilters: () => void;
  
  // Utilities
  hasTag: (tag: string) => boolean;
  loadFromUrl: () => void;
  exportToUrl: () => string;
  applyFilterOperation: (operation: FilterOperation) => void;
}

/**
 * Custom hook for managing filter state with URL synchronization
 */
export function useFilterState(): UseFilterStateReturn {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filterState, setFilterState] = useState<FilterState>(() => {
    // Initialize from URL on first load
    return loadFilterFromUrl(searchParams);
  });

  // Derived state
  const isFilterActive = useMemo(() => !isFilterEmpty(filterState), [filterState]);
  const filterDescription = useMemo(() => getFilterDescription(filterState), [filterState]);

  // Sync URL when filter state changes
  useEffect(() => {
    const urlState = serializeFilterToUrl(filterState);
    const newSearchParams = new URLSearchParams();

    // Only include non-empty parameters
    Object.entries(urlState).forEach(([key, value]) => {
      if (value && value.trim() !== '') {
        newSearchParams.set(key, value);
      }
    });

    // Update URL without triggering navigation
    setSearchParams(newSearchParams, { replace: true });
  }, [filterState, setSearchParams]);

  // Action creators
  const setSearchText = useCallback((text: string) => {
    setFilterState(prev => ({ ...prev, searchText: text }));
  }, []);

  const addTag = useCallback((tag: string) => {
    setFilterState(prev => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tag) 
        ? prev.selectedTags 
        : [...prev.selectedTags, tag]
    }));
  }, []);

  const removeTag = useCallback((tag: string) => {
    setFilterState(prev => ({
      ...prev,
      selectedTags: prev.selectedTags.filter(t => t !== tag)
    }));
  }, []);

  const setTags = useCallback((tags: string[]) => {
    setFilterState(prev => ({ ...prev, selectedTags: [...tags] }));
  }, []);

  const toggleTag = useCallback((tag: string) => {
    setFilterState(prev => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tag)
        ? prev.selectedTags.filter(t => t !== tag)
        : [...prev.selectedTags, tag]
    }));
  }, []);

  const setDateRange = useCallback((range: DateRange | undefined) => {
    setFilterState(prev => ({ ...prev, dateRange: range }));
  }, []);

  const setNodeTypes = useCallback((types: string[]) => {
    setFilterState(prev => ({ ...prev, nodeTypes: [...types] }));
  }, []);

  const setLinkTypes = useCallback((types: string[]) => {
    setFilterState(prev => ({ ...prev, linkTypes: [...types] }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilterState({ ...DEFAULT_FILTER_STATE });
  }, []);

  // Utilities
  const hasTag = useCallback((tag: string): boolean => {
    return filterState.selectedTags.includes(tag);
  }, [filterState.selectedTags]);

  const loadFromUrl = useCallback(() => {
    const urlState = loadFilterFromUrl(searchParams);
    setFilterState(urlState);
  }, [searchParams]);

  const exportToUrl = useCallback((): string => {
    const urlState = serializeFilterToUrl(filterState);
    const params = new URLSearchParams();
    
    Object.entries(urlState).forEach(([key, value]) => {
      if (value && value.trim() !== '') {
        params.set(key, value);
      }
    });

    return params.toString();
  }, [filterState]);

  const applyFilterOperation = useCallback((operation: FilterOperation) => {
    setFilterState(prev => {
      switch (operation.type) {
        case 'SET_SEARCH_TEXT':
          return { ...prev, searchText: operation.payload };
        
        case 'ADD_TAG':
          return {
            ...prev,
            selectedTags: prev.selectedTags.includes(operation.payload)
              ? prev.selectedTags
              : [...prev.selectedTags, operation.payload]
          };
        
        case 'REMOVE_TAG':
          return {
            ...prev,
            selectedTags: prev.selectedTags.filter(t => t !== operation.payload)
          };
        
        case 'SET_TAGS':
          return { ...prev, selectedTags: [...operation.payload] };
        
        case 'SET_DATE_RANGE':
          return { ...prev, dateRange: operation.payload };
        
        case 'SET_NODE_TYPES':
          return { ...prev, nodeTypes: [...operation.payload] };
        
        case 'SET_LINK_TYPES':
          return { ...prev, linkTypes: [...operation.payload] };
        
        case 'CLEAR_FILTERS':
          return { ...DEFAULT_FILTER_STATE };
        
        case 'LOAD_FROM_URL':
          return deserializeFilterFromUrl(operation.payload);
        
        default:
          return prev;
      }
    });
  }, []);

  return {
    // State
    filterState,
    isFilterActive,
    filterDescription,
    
    // Actions
    setSearchText,
    addTag,
    removeTag,
    setTags,
    toggleTag,
    setDateRange,
    setNodeTypes,
    setLinkTypes,
    clearFilters,
    
    // Utilities
    hasTag,
    loadFromUrl,
    exportToUrl,
    applyFilterOperation
  };
}

/**
 * Utility functions for URL serialization
 */

function loadFilterFromUrl(searchParams: URLSearchParams): FilterState {
  const urlState: URLFilterState = {
    search: searchParams.get(URL_PARAMS.SEARCH) || undefined,
    tags: searchParams.get(URL_PARAMS.TAGS) || undefined,
    date_start: searchParams.get(URL_PARAMS.DATE_START) || undefined,
    date_end: searchParams.get(URL_PARAMS.DATE_END) || undefined,
    node_types: searchParams.get(URL_PARAMS.NODE_TYPES) || undefined,
    link_types: searchParams.get(URL_PARAMS.LINK_TYPES) || undefined
  };

  return deserializeFilterFromUrl(urlState);
}

function deserializeFilterFromUrl(urlState: URLFilterState): FilterState {
  const filterState: FilterState = { ...DEFAULT_FILTER_STATE };

  // Search text
  if (urlState.search) {
    filterState.searchText = decodeURIComponent(urlState.search);
  }

  // Tags
  if (urlState.tags) {
    filterState.selectedTags = urlState.tags
      .split(',')
      .map(tag => decodeURIComponent(tag.trim()))
      .filter(tag => tag.length > 0);
  }

  // Date range
  if (urlState.date_start && urlState.date_end) {
    try {
      const start = new Date(urlState.date_start);
      const end = new Date(urlState.date_end);
      
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        filterState.dateRange = { start, end };
      }
    } catch (error) {
      console.warn('Invalid date range in URL:', error);
    }
  }

  // Node types
  if (urlState.node_types) {
    filterState.nodeTypes = urlState.node_types
      .split(',')
      .map(type => type.trim())
      .filter(type => type.length > 0);
  }

  // Link types
  if (urlState.link_types) {
    filterState.linkTypes = urlState.link_types
      .split(',')
      .map(type => type.trim())
      .filter(type => type.length > 0);
  }

  return filterState;
}

function serializeFilterToUrl(filterState: FilterState): URLFilterState {
  const urlState: URLFilterState = {};

  // Search text
  if (filterState.searchText) {
    urlState.search = encodeURIComponent(filterState.searchText);
  }

  // Tags
  if (filterState.selectedTags.length > 0) {
    urlState.tags = filterState.selectedTags
      .map(tag => encodeURIComponent(tag))
      .join(',');
  }

  // Date range
  if (filterState.dateRange) {
    urlState.date_start = filterState.dateRange.start.toISOString().split('T')[0];
    urlState.date_end = filterState.dateRange.end.toISOString().split('T')[0];
  }

  // Node types (only if different from default)
  if (JSON.stringify(filterState.nodeTypes.sort()) !== 
      JSON.stringify(DEFAULT_FILTER_STATE.nodeTypes.sort())) {
    urlState.node_types = filterState.nodeTypes.join(',');
  }

  // Link types (only if different from default)
  if (JSON.stringify(filterState.linkTypes.sort()) !== 
      JSON.stringify(DEFAULT_FILTER_STATE.linkTypes.sort())) {
    urlState.link_types = filterState.linkTypes.join(',');
  }

  return urlState;
}

/**
 * Higher-order hook for components that need specific filter functionality
 */

interface UseTagFilterReturn {
  selectedTags: string[];
  hasTag: (tag: string) => boolean;
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;
  toggleTag: (tag: string) => void;
  clearTags: () => void;
}

export function useTagFilter(): UseTagFilterReturn {
  const { filterState, addTag, removeTag, toggleTag, hasTag, setTags } = useFilterState();

  const clearTags = useCallback(() => {
    setTags([]);
  }, [setTags]);

  return {
    selectedTags: filterState.selectedTags,
    hasTag,
    addTag,
    removeTag,
    toggleTag,
    clearTags
  };
}

interface UseSearchFilterReturn {
  searchText: string;
  setSearchText: (text: string) => void;
  clearSearch: () => void;
  hasSearch: boolean;
}

export function useSearchFilter(): UseSearchFilterReturn {
  const { filterState, setSearchText } = useFilterState();

  const clearSearch = useCallback(() => {
    setSearchText('');
  }, [setSearchText]);

  return {
    searchText: filterState.searchText,
    setSearchText,
    clearSearch,
    hasSearch: filterState.searchText.length > 0
  };
}

interface UseDateFilterReturn {
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  clearDateRange: () => void;
  hasDateFilter: boolean;
}

export function useDateFilter(): UseDateFilterReturn {
  const { filterState, setDateRange } = useFilterState();

  const clearDateRange = useCallback(() => {
    setDateRange(undefined);
  }, [setDateRange]);

  return {
    dateRange: filterState.dateRange,
    setDateRange,
    clearDateRange,
    hasDateFilter: filterState.dateRange !== undefined
  };
}