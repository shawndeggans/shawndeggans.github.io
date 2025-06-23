/**
 * Graph Data Processor
 * 
 * Central engine for transforming content data into unified graph format.
 * Implements DRY principle by providing single source of truth for graph processing.
 */

import { 
  UnifiedGraphData, 
  UnifiedNode, 
  UnifiedLink, 
  ContentNode, 
  TagNode,
  ContentToContentLink,
  ContentToTagLink,
  TagToTagLink
} from '../types/unifiedGraph';
import { FilterState, FilteredData, FilterStatistics, SearchMatchSources } from '../types/filter';

// Content data structure from generated index
interface ContentIndex {
  lastGenerated: string;
  totalFiles: number;
  files: ContentFile[];
}

interface ContentFile {
  id: string;
  filename: string;
  title: string;
  date?: string;
  tags: string[];
  description: string;
  internalLinks: string[];
  body: string;
  readingTime: string;
  lastModified: string;
  wordCount: number;
}

/**
 * Main class for processing graph data
 */
export class GraphDataProcessor {
  private contentIndex: ContentIndex | null = null;
  private graphData: UnifiedGraphData | null = null;
  private lastProcessed: string | null = null;

  /**
   * Load content index from generated file
   */
  async loadContentIndex(): Promise<ContentIndex> {
    try {
      // In development, files are served from public, so we need to fetch from the built location
      const response = await fetch('/data/contentIndex.json');
      if (!response.ok) {
        throw new Error(`Failed to load content index: ${response.statusText}`);
      }
      
      const data = await response.json();
      this.contentIndex = data;
      return data;
    } catch (error) {
      console.error('Error loading content index:', error);
      throw error;
    }
  }

  /**
   * Process content into unified graph data
   */
  async processGraphData(forceReprocess = false): Promise<UnifiedGraphData> {
    // Load content if not already loaded
    if (!this.contentIndex) {
      await this.loadContentIndex();
    }

    if (!this.contentIndex) {
      throw new Error('Content index not available');
    }

    // Check if reprocessing is needed
    if (!forceReprocess && 
        this.graphData && 
        this.lastProcessed === this.contentIndex.lastGenerated) {
      return this.graphData;
    }

    console.log('🔄 Processing graph data...');

    const nodes: UnifiedNode[] = [];
    const links: UnifiedLink[] = [];
    const tagCounts: Map<string, number> = new Map();
    const tagConnections: Map<string, Set<string>> = new Map();

    // Step 1: Create content nodes and collect tag information
    for (const file of this.contentIndex.files) {
      // Create content node
      const contentNode: ContentNode = {
        id: file.id,
        type: 'content',
        label: file.title,
        metadata: {
          filename: file.filename,
          title: file.title,
          date: file.date,
          description: file.description,
          tags: file.tags,
          wordCount: file.wordCount,
          readingTime: file.readingTime,
          lastModified: file.lastModified
        }
      };

      nodes.push(contentNode);

      // Collect tag information
      for (const tag of file.tags) {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
        
        // Track tag co-occurrences
        if (!tagConnections.has(tag)) {
          tagConnections.set(tag, new Set());
        }
        
        // Add other tags in this content as connections
        for (const otherTag of file.tags) {
          if (tag !== otherTag) {
            tagConnections.get(tag)?.add(otherTag);
          }
        }
      }
    }

    // Step 2: Create tag nodes
    for (const [tag, count] of tagCounts.entries()) {
      const relatedTags = Array.from(tagConnections.get(tag) || []);
      
      const tagNode: TagNode = {
        id: `tag:${tag}`,
        type: 'tag',
        label: tag,
        metadata: {
          contentCount: count,
          relatedTags
        }
      };

      nodes.push(tagNode);
    }

    // Step 3: Create content-to-content links (internal links)
    for (const file of this.contentIndex.files) {
      for (const linkTarget of file.internalLinks) {
        // Find target content by title or ID
        const targetFile = this.contentIndex.files.find(f => 
          f.title === linkTarget || 
          f.id === linkTarget || 
          f.filename.replace('.md', '') === linkTarget
        );

        if (targetFile) {
          const link: ContentToContentLink = {
            id: `content-link:${file.id}-${targetFile.id}`,
            source: file.id,
            target: targetFile.id,
            type: 'content_link',
            weight: 0.8,
            metadata: {
              linkText: linkTarget,
              bidirectional: true
            }
          };

          links.push(link);
        }
      }
    }

    // Step 4: Create content-to-tag links
    for (const file of this.contentIndex.files) {
      for (let i = 0; i < file.tags.length; i++) {
        const tag = file.tags[i];
        const link: ContentToTagLink = {
          id: `tag-assignment:${file.id}-${tag}`,
          source: file.id,
          target: `tag:${tag}`,
          type: 'tag_assignment',
          weight: 0.6,
          metadata: {
            tagPosition: i
          }
        };

        links.push(link);
      }
    }

    // Step 5: Create tag-to-tag links (co-occurrence)
    const processedTagPairs = new Set<string>();
    
    for (const [tag, connectedTags] of tagConnections.entries()) {
      for (const connectedTag of connectedTags) {
        const pairKey = [tag, connectedTag].sort().join('-');
        
        // Avoid duplicate pairs
        if (processedTagPairs.has(pairKey)) {
          continue;
        }
        processedTagPairs.add(pairKey);

        // Calculate co-occurrence strength
        const tag1Count = tagCounts.get(tag) || 0;
        const tag2Count = tagCounts.get(connectedTag) || 0;
        const cooccurrenceCount = this.calculateCooccurrenceCount(tag, connectedTag);
        
        // Only create link if tags co-occur in multiple files
        if (cooccurrenceCount > 1) {
          const strength = cooccurrenceCount / Math.min(tag1Count, tag2Count);
          
          const link: TagToTagLink = {
            id: `tag-cooccurrence:${tag}-${connectedTag}`,
            source: `tag:${tag}`,
            target: `tag:${connectedTag}`,
            type: 'tag_cooccurrence',
            weight: Math.min(strength, 1),
            metadata: {
              cooccurrenceCount,
              strength
            }
          };

          links.push(link);
        }
      }
    }

    // Step 6: Create final graph data
    this.graphData = {
      nodes,
      links,
      metadata: {
        lastGenerated: new Date().toISOString(),
        totalNodes: nodes.length,
        totalLinks: links.length,
        nodeTypeCounts: this.countNodeTypes(nodes),
        linkTypeCounts: this.countLinkTypes(links)
      }
    };

    this.lastProcessed = this.contentIndex.lastGenerated;
    
    console.log(`✅ Processed graph data: ${nodes.length} nodes, ${links.length} links`);
    return this.graphData;
  }

  /**
   * Apply filters to graph data
   */
  applyFilters(graphData: UnifiedGraphData, filterState: FilterState): FilteredData {
    const matchedNodes = new Set<string>();
    const highlightedNodes = new Set<string>();
    const filteredNodes: UnifiedNode[] = [];
    const filteredLinks: UnifiedLink[] = [];

    // Apply search filter
    if (filterState.searchText) {
      this.applySearchFilter(graphData.nodes, filterState.searchText, matchedNodes);
    }

    // Apply tag filter
    if (filterState.selectedTags.length > 0) {
      this.applyTagFilter(graphData.nodes, filterState.selectedTags, matchedNodes);
    }

    // Apply date range filter
    if (filterState.dateRange) {
      this.applyDateRangeFilter(graphData.nodes, filterState.dateRange, matchedNodes);
    }

    // Apply node type filter
    this.applyNodeTypeFilter(graphData.nodes, filterState.nodeTypes, matchedNodes);

    // If no specific filters, include all nodes
    if (filterState.searchText === '' && 
        filterState.selectedTags.length === 0 && 
        !filterState.dateRange) {
      graphData.nodes.forEach(node => matchedNodes.add(node.id));
    }

    // Add matched nodes to filtered result
    for (const node of graphData.nodes) {
      if (matchedNodes.has(node.id) && filterState.nodeTypes.includes(node.type)) {
        filteredNodes.push(node);
        highlightedNodes.add(node.id);
      }
    }

    // Add links between matched nodes
    for (const link of graphData.links) {
      if (matchedNodes.has(link.source) && 
          matchedNodes.has(link.target) &&
          filterState.linkTypes.includes(link.type)) {
        filteredLinks.push(link);
      }
    }

    const statistics = this.calculateFilterStatistics(
      graphData, 
      filteredNodes, 
      filteredLinks
    );

    return {
      nodes: filteredNodes,
      links: filteredLinks,
      matchedNodes,
      highlightedNodes,
      statistics
    };
  }

  /**
   * Apply search filter to nodes
   */
  private applySearchFilter(nodes: UnifiedNode[], searchText: string, matchedNodes: Set<string>): void {
    const searchLower = searchText.toLowerCase();

    for (const node of nodes) {
      let matched = false;

      // Search in label
      if (node.label.toLowerCase().includes(searchLower)) {
        matched = true;
      }

      // Search in content-specific fields
      if (node.type === 'content') {
        const contentNode = node as ContentNode;
        
        // Search in title
        if (contentNode.metadata.title.toLowerCase().includes(searchLower)) {
          matched = true;
        }

        // Search in description
        if (contentNode.metadata.description?.toLowerCase().includes(searchLower)) {
          matched = true;
        }

        // Search in tags
        for (const tag of contentNode.metadata.tags) {
          if (tag.toLowerCase().includes(searchLower)) {
            matched = true;
            break;
          }
        }
      }

      if (matched) {
        matchedNodes.add(node.id);
      }
    }
  }

  /**
   * Apply tag filter to nodes
   */
  private applyTagFilter(nodes: UnifiedNode[], selectedTags: string[], matchedNodes: Set<string>): void {
    for (const node of nodes) {
      if (node.type === 'content') {
        const contentNode = node as ContentNode;
        const hasMatchingTag = selectedTags.some(tag => 
          contentNode.metadata.tags.includes(tag)
        );
        
        if (hasMatchingTag) {
          matchedNodes.add(node.id);
        }
      } else if (node.type === 'tag') {
        // Include tag nodes if they are selected
        const tagName = node.label;
        if (selectedTags.includes(tagName)) {
          matchedNodes.add(node.id);
        }
      }
    }
  }

  /**
   * Apply date range filter to nodes
   */
  private applyDateRangeFilter(nodes: UnifiedNode[], dateRange: { start: Date; end: Date }, matchedNodes: Set<string>): void {
    for (const node of nodes) {
      if (node.type === 'content') {
        const contentNode = node as ContentNode;
        
        if (contentNode.metadata.date) {
          const nodeDate = new Date(contentNode.metadata.date);
          if (nodeDate >= dateRange.start && nodeDate <= dateRange.end) {
            matchedNodes.add(node.id);
          }
        }
      }
    }
  }

  /**
   * Apply node type filter
   */
  private applyNodeTypeFilter(nodes: UnifiedNode[], nodeTypes: string[], matchedNodes: Set<string>): void {
    // If specific nodes were already matched by other filters, respect node type filter
    const currentMatches = Array.from(matchedNodes);
    matchedNodes.clear();

    for (const nodeId of currentMatches) {
      const node = nodes.find(n => n.id === nodeId);
      if (node && nodeTypes.includes(node.type)) {
        matchedNodes.add(nodeId);
      }
    }

    // If no other filters were applied, include all nodes of specified types
    if (currentMatches.length === 0) {
      for (const node of nodes) {
        if (nodeTypes.includes(node.type)) {
          matchedNodes.add(node.id);
        }
      }
    }
  }

  /**
   * Calculate co-occurrence count between two tags
   */
  private calculateCooccurrenceCount(tag1: string, tag2: string): number {
    if (!this.contentIndex) return 0;

    let count = 0;
    for (const file of this.contentIndex.files) {
      if (file.tags.includes(tag1) && file.tags.includes(tag2)) {
        count++;
      }
    }
    
    return count;
  }

  /**
   * Count nodes by type
   */
  private countNodeTypes(nodes: UnifiedNode[]): Record<string, number> {
    const counts: Record<string, number> = {};
    
    for (const node of nodes) {
      counts[node.type] = (counts[node.type] || 0) + 1;
    }
    
    return counts;
  }

  /**
   * Count links by type
   */
  private countLinkTypes(links: UnifiedLink[]): Record<string, number> {
    const counts: Record<string, number> = {};
    
    for (const link of links) {
      counts[link.type] = (counts[link.type] || 0) + 1;
    }
    
    return counts;
  }

  /**
   * Calculate filter statistics
   */
  private calculateFilterStatistics(
    originalData: UnifiedGraphData, 
    filteredNodes: UnifiedNode[], 
    filteredLinks: UnifiedLink[]
  ): FilterStatistics {
    const nodeTypeCounts: Record<string, number> = {};
    const tagCounts: Record<string, number> = {};

    for (const node of filteredNodes) {
      nodeTypeCounts[node.type] = (nodeTypeCounts[node.type] || 0) + 1;
      
      if (node.type === 'content') {
        const contentNode = node as ContentNode;
        for (const tag of contentNode.metadata.tags) {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        }
      }
    }

    // Calculate search match sources (simplified for now)
    const matchingSources: SearchMatchSources = {
      titles: 0,
      content: 0,
      tags: 0,
      descriptions: 0
    };

    return {
      totalNodes: originalData.nodes.length,
      filteredNodes: filteredNodes.length,
      totalLinks: originalData.links.length,
      filteredLinks: filteredLinks.length,
      nodeTypeCounts,
      tagCounts,
      matchingSources
    };
  }

  /**
   * Get current graph data (cached)
   */
  getCurrentGraphData(): UnifiedGraphData | null {
    return this.graphData;
  }

  /**
   * Clear cached data
   */
  clearCache(): void {
    this.contentIndex = null;
    this.graphData = null;
    this.lastProcessed = null;
  }
}

// Export singleton instance
export const graphDataProcessor = new GraphDataProcessor();