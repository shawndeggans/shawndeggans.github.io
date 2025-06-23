/**
 * Unified Graph Data Hook
 * 
 * Main data interface that integrates graph processor, filter state, and tag engine.
 * Provides unified graph data with filtering capabilities for React components.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { UnifiedGraphData, UnifiedNode, UnifiedLink } from '../types/unifiedGraph';
import { FilteredData } from '../types/filter';
import { graphDataProcessor } from '../utils/graphDataProcessor';
import { tagRelationshipEngine } from '../utils/tagRelationshipEngine';
import { useFilterState } from './useFilterState';

// Loading states
type LoadingState = 'idle' | 'loading' | 'success' | 'error';

interface UseGraphDataReturn {
  // Data
  rawGraphData: UnifiedGraphData | null;
  filteredData: FilteredData | null;
  
  // Loading states
  loadingState: LoadingState;
  error: string | null;
  
  // Actions
  refreshData: () => Promise<void>;
  clearCache: () => void;
  
  // Statistics
  totalNodes: number;
  totalLinks: number;
  visibleNodes: number;
  visibleLinks: number;
  
  // Utilities
  getNodeById: (id: string) => UnifiedNode | undefined;
  getLinkById: (id: string) => UnifiedLink | undefined;
  getConnectedNodes: (nodeId: string) => UnifiedNode[];
  getNodesByType: (type: string) => UnifiedNode[];
  getAllTags: () => string[];
}

/**
 * Main hook for accessing unified graph data
 */
export function useGraphData(): UseGraphDataReturn {
  const { filterState } = useFilterState();
  const [rawGraphData, setRawGraphData] = useState<UnifiedGraphData | null>(null);
  const [filteredData, setFilteredData] = useState<FilteredData | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [error, setError] = useState<string | null>(null);

  // Load and process graph data
  const loadGraphData = useCallback(async (forceReload = false) => {
    try {
      setLoadingState('loading');
      setError(null);

      console.log('🔄 Loading graph data...');
      const graphData = await graphDataProcessor.processGraphData(forceReload);
      
      console.log('🏷️ Processing tag relationships...');
      // Extract content for tag processing
      const contentForTags = graphData.nodes
        .filter(node => node.type === 'content')
        .map(node => ({
          id: node.id,
          title: node.label,
          tags: (node as any).metadata?.tags || [],
          date: (node as any).metadata?.date
        }));

      tagRelationshipEngine.processTagRelationships(contentForTags);

      setRawGraphData(graphData);
      setLoadingState('success');
      
      console.log('✅ Graph data loaded successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setLoadingState('error');
      console.error('❌ Error loading graph data:', err);
    }
  }, []);

  // Apply filters to graph data
  const applyFilters = useCallback(() => {
    if (!rawGraphData) {
      setFilteredData(null);
      return;
    }

    try {
      const filtered = graphDataProcessor.applyFilters(rawGraphData, filterState);
      setFilteredData(filtered);
    } catch (err) {
      console.error('Error applying filters:', err);
      setError(err instanceof Error ? err.message : 'Filter error');
    }
  }, [rawGraphData, filterState]);

  // Load data on mount
  useEffect(() => {
    loadGraphData();
  }, [loadGraphData]);

  // Apply filters when data or filter state changes
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Refresh data action
  const refreshData = useCallback(async () => {
    await loadGraphData(true);
  }, [loadGraphData]);

  // Clear cache action
  const clearCache = useCallback(() => {
    graphDataProcessor.clearCache();
    setRawGraphData(null);
    setFilteredData(null);
    setLoadingState('idle');
    setError(null);
  }, []);

  // Memoized statistics
  const totalNodes = useMemo(() => rawGraphData?.nodes.length || 0, [rawGraphData]);
  const totalLinks = useMemo(() => rawGraphData?.links.length || 0, [rawGraphData]);
  const visibleNodes = useMemo(() => filteredData?.nodes.length || 0, [filteredData]);
  const visibleLinks = useMemo(() => filteredData?.links.length || 0, [filteredData]);

  // Utility functions
  const getNodeById = useCallback((id: string): UnifiedNode | undefined => {
    return rawGraphData?.nodes.find(node => node.id === id);
  }, [rawGraphData]);

  const getLinkById = useCallback((id: string): UnifiedLink | undefined => {
    return rawGraphData?.links.find(link => link.id === id);
  }, [rawGraphData]);

  const getConnectedNodes = useCallback((nodeId: string): UnifiedNode[] => {
    if (!rawGraphData) return [];

    const connectedNodeIds = new Set<string>();
    
    // Find all links connected to this node
    for (const link of rawGraphData.links) {
      if (link.source === nodeId) {
        connectedNodeIds.add(link.target);
      } else if (link.target === nodeId) {
        connectedNodeIds.add(link.source);
      }
    }

    // Return the actual node objects
    return rawGraphData.nodes.filter(node => connectedNodeIds.has(node.id));
  }, [rawGraphData]);

  const getNodesByType = useCallback((type: string): UnifiedNode[] => {
    if (!rawGraphData) return [];
    return rawGraphData.nodes.filter(node => node.type === type);
  }, [rawGraphData]);

  const getAllTags = useCallback((): string[] => {
    if (!rawGraphData) return [];
    
    const tags = new Set<string>();
    
    // Collect tags from content nodes
    rawGraphData.nodes
      .filter(node => node.type === 'content')
      .forEach(node => {
        const contentNode = node as any;
        if (contentNode.metadata?.tags) {
          contentNode.metadata.tags.forEach((tag: string) => tags.add(tag));
        }
      });

    return Array.from(tags).sort();
  }, [rawGraphData]);

  return {
    // Data
    rawGraphData,
    filteredData,
    
    // Loading states
    loadingState,
    error,
    
    // Actions
    refreshData,
    clearCache,
    
    // Statistics
    totalNodes,
    totalLinks,
    visibleNodes,
    visibleLinks,
    
    // Utilities
    getNodeById,
    getLinkById,
    getConnectedNodes,
    getNodesByType,
    getAllTags
  };
}

/**
 * Hook for accessing only content nodes (useful for timeline views)
 */
interface UseContentDataReturn {
  contentNodes: UnifiedNode[];
  filteredContentNodes: UnifiedNode[];
  loadingState: LoadingState;
  error: string | null;
}

export function useContentData(): UseContentDataReturn {
  const { rawGraphData, filteredData, loadingState, error } = useGraphData();

  const contentNodes = useMemo(() => {
    if (!rawGraphData) return [];
    return rawGraphData.nodes.filter(node => node.type === 'content');
  }, [rawGraphData]);

  const filteredContentNodes = useMemo(() => {
    if (!filteredData) return [];
    return filteredData.nodes.filter(node => node.type === 'content');
  }, [filteredData]);

  return {
    contentNodes,
    filteredContentNodes,
    loadingState,
    error
  };
}

/**
 * Hook for accessing tag-specific data
 */
interface UseTagDataReturn {
  tagNodes: UnifiedNode[];
  allTags: string[];
  tagRelationships: Array<{ tag1: string; tag2: string; strength: number }>;
  getRelatedTags: (tag: string) => string[];
  getTagMetrics: (tag: string) => any;
}

export function useTagData(): UseTagDataReturn {
  const { rawGraphData } = useGraphData();

  const tagNodes = useMemo(() => {
    if (!rawGraphData) return [];
    return rawGraphData.nodes.filter(node => node.type === 'tag');
  }, [rawGraphData]);

  const allTags = useMemo(() => {
    return tagNodes.map(node => node.label).sort();
  }, [tagNodes]);

  const tagRelationships = useMemo(() => {
    if (!rawGraphData) return [];
    
    return rawGraphData.links
      .filter(link => link.type === 'tag_cooccurrence')
      .map(link => ({
        tag1: link.source.replace('tag:', ''),
        tag2: link.target.replace('tag:', ''),
        strength: link.weight || 0
      }));
  }, [rawGraphData]);

  const getRelatedTags = useCallback((tag: string): string[] => {
    return tagRelationshipEngine.getRelatedTags(tag, 10);
  }, []);

  const getTagMetrics = useCallback((tag: string) => {
    return tagRelationshipEngine.getTagMetrics(tag);
  }, []);

  return {
    tagNodes,
    allTags,
    tagRelationships,
    getRelatedTags,
    getTagMetrics
  };
}

/**
 * Hook for accessing graph visualization data with D3 compatibility
 */
interface UseVisualizationDataReturn {
  nodes: UnifiedNode[];
  links: UnifiedLink[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useVisualizationData(): UseVisualizationDataReturn {
  const { filteredData, loadingState, error, refreshData } = useGraphData();

  const nodes = useMemo(() => {
    return filteredData?.nodes || [];
  }, [filteredData]);

  const links = useMemo(() => {
    return filteredData?.links || [];
  }, [filteredData]);

  const isLoading = loadingState === 'loading';

  return {
    nodes,
    links,
    isLoading,
    error,
    refresh: refreshData
  };
}

/**
 * Hook for accessing timeline-specific data
 */
interface UseTimelineDataReturn {
  timelineEntries: Array<{
    id: string;
    title: string;
    date: Date | null;
    tags: string[];
    description: string;
    wordCount: number;
    readingTime: string;
  }>;
  entriesByYear: Map<number, any[]>;
  entriesByMonth: Map<string, any[]>;
  isLoading: boolean;
}

export function useTimelineData(): UseTimelineDataReturn {
  const { filteredContentNodes, loadingState } = useContentData();

  const timelineEntries = useMemo(() => {
    return filteredContentNodes
      .map(node => {
        const metadata = (node as any).metadata;
        return {
          id: node.id,
          title: node.label,
          date: metadata?.date ? new Date(metadata.date) : null,
          tags: metadata?.tags || [],
          description: metadata?.description || '',
          wordCount: metadata?.wordCount || 0,
          readingTime: metadata?.readingTime || ''
        };
      })
      .sort((a, b) => {
        // Sort by date, newest first (handle null dates)
        if (!a.date && !b.date) return 0;
        if (!a.date) return 1;
        if (!b.date) return -1;
        return b.date.getTime() - a.date.getTime();
      });
  }, [filteredContentNodes]);

  const entriesByYear = useMemo(() => {
    const yearMap = new Map<number, any[]>();
    
    timelineEntries.forEach(entry => {
      if (entry.date) {
        const year = entry.date.getFullYear();
        if (!yearMap.has(year)) {
          yearMap.set(year, []);
        }
        yearMap.get(year)!.push(entry);
      }
    });

    return yearMap;
  }, [timelineEntries]);

  const entriesByMonth = useMemo(() => {
    const monthMap = new Map<string, any[]>();
    
    timelineEntries.forEach(entry => {
      if (entry.date) {
        const key = `${entry.date.getFullYear()}-${entry.date.getMonth()}`;
        if (!monthMap.has(key)) {
          monthMap.set(key, []);
        }
        monthMap.get(key)!.push(entry);
      }
    });

    return monthMap;
  }, [timelineEntries]);

  return {
    timelineEntries,
    entriesByYear,
    entriesByMonth,
    isLoading: loadingState === 'loading'
  };
}