import { ParsedContent } from '../types/content';
import { TagNode, TagLink, TagGraphData, TagGraphConfig, TagCluster } from '../types/tagGraph';

export function transformContentToTagGraph(
  contentMap: Map<string, ParsedContent>
): TagGraphData {
  const tagContentMap = new Map<string, string[]>(); // tag -> content slugs
  const tagCounts = new Map<string, number>(); // tag -> count
  
  // Build tag-content relationships
  contentMap.forEach((content, slug) => {
    const tags = content.metadata.tags || [];
    tags.forEach(tag => {
      if (!tagContentMap.has(tag)) {
        tagContentMap.set(tag, []);
        tagCounts.set(tag, 0);
      }
      tagContentMap.get(tag)!.push(slug);
      tagCounts.set(tag, tagCounts.get(tag)! + 1);
    });
  });
  
  // Create initial tag nodes
  const nodes: TagNode[] = [];
  tagContentMap.forEach((contentSlugs, tag) => {
    const contentCount = contentSlugs.length;
    
    nodes.push({
      id: tag,
      title: tag,
      group: Math.floor(Math.random() * 5), // Random group for now, could be smarter
      size: calculateTagNodeSize(contentCount),
      contentCount,
      connectedContent: contentSlugs,
      neighbors: [], // Will be populated below
      links: [], // Will be populated below
    });
  });
  
  // Create tag links based on co-occurrence and generate IDs
  const links: TagLink[] = [];
  const tagList = Array.from(tagContentMap.keys());
  
  for (let i = 0; i < tagList.length; i++) {
    for (let j = i + 1; j < tagList.length; j++) {
      const tag1 = tagList[i];
      const tag2 = tagList[j];
      const content1 = tagContentMap.get(tag1)!;
      const content2 = tagContentMap.get(tag2)!;
      
      // Find shared content
      const sharedContent = content1.filter(slug => content2.includes(slug));
      
      if (sharedContent.length > 0) {
        // Calculate connection strength
        const strength = calculateTagConnectionStrength(
          sharedContent.length,
          content1.length,
          content2.length
        );
        
        const linkId = `${tag1}-${tag2}`;
        links.push({
          id: linkId,
          source: tag1,
          target: tag2,
          value: strength,
          sharedContent,
        });
      }
    }
  }
  
  // Pre-compute neighbors and link associations (Obsidian-style)
  const nodeMap = new Map<string, TagNode>();
  nodes.forEach(node => nodeMap.set(node.id, node));
  
  links.forEach(link => {
    const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
    const targetId = typeof link.target === 'string' ? link.target : link.target.id;
    
    const sourceNode = nodeMap.get(sourceId);
    const targetNode = nodeMap.get(targetId);
    
    if (sourceNode && targetNode) {
      // Add bidirectional neighbor relationships
      if (!sourceNode.neighbors.includes(targetId)) {
        sourceNode.neighbors.push(targetId);
      }
      if (!targetNode.neighbors.includes(sourceId)) {
        targetNode.neighbors.push(sourceId);
      }
      
      // Associate link with both nodes
      sourceNode.links.push(link.id);
      targetNode.links.push(link.id);
    }
  });
  
  return { nodes, links };
}

function calculateTagNodeSize(contentCount: number): number {
  // Logarithmic scaling for node size
  return Math.max(1, Math.log2(contentCount + 1));
}

function calculateTagConnectionStrength(
  sharedCount: number,
  tag1Count: number,
  tag2Count: number
): number {
  // Jaccard similarity coefficient
  const union = tag1Count + tag2Count - sharedCount;
  return sharedCount / union;
}

// Get all unique tags with their content counts
export function getTagStats(contentMap: Map<string, ParsedContent>): Array<{
  tag: string;
  count: number;
  content: string[];
}> {
  const tagMap = new Map<string, string[]>();
  
  contentMap.forEach((content, slug) => {
    const tags = content.metadata.tags || [];
    tags.forEach(tag => {
      if (!tagMap.has(tag)) {
        tagMap.set(tag, []);
      }
      tagMap.get(tag)!.push(slug);
    });
  });
  
  return Array.from(tagMap.entries())
    .map(([tag, content]) => ({
      tag,
      count: content.length,
      content,
    }))
    .sort((a, b) => b.count - a.count);
}

// Filter tag graph data
export function filterTagGraph(
  data: TagGraphData,
  filter: {
    minContentCount?: number;
    minConnectionStrength?: number;
    selectedTags?: string[];
    hideIsolated?: boolean;
  }
): TagGraphData {
  let filteredNodes = [...data.nodes];
  let filteredLinks = [...data.links];
  
  // Filter by content count
  if (filter.minContentCount !== undefined) {
    filteredNodes = filteredNodes.filter(node => 
      node.contentCount >= filter.minContentCount!
    );
  }
  
  // Filter by selected tags
  if (filter.selectedTags && filter.selectedTags.length > 0) {
    const selectedTagIds = new Set(filter.selectedTags);
    filteredNodes = filteredNodes.filter(node => 
      selectedTagIds.has(node.id)
    );
  }
  
  // Update node IDs after filtering
  const nodeIds = new Set(filteredNodes.map(node => node.id));
  
  // Filter links to only include nodes that remain
  filteredLinks = filteredLinks.filter(link => {
    const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
    const targetId = typeof link.target === 'string' ? link.target : link.target.id;
    return nodeIds.has(sourceId) && nodeIds.has(targetId);
  });
  
  // Filter by connection strength
  if (filter.minConnectionStrength !== undefined) {
    filteredLinks = filteredLinks.filter(link => 
      link.value >= filter.minConnectionStrength!
    );
  }
  
  // Remove isolated nodes if requested
  if (filter.hideIsolated) {
    const connectedNodeIds = new Set<string>();
    filteredLinks.forEach(link => {
      const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
      const targetId = typeof link.target === 'string' ? link.target : link.target.id;
      connectedNodeIds.add(sourceId);
      connectedNodeIds.add(targetId);
    });
    
    filteredNodes = filteredNodes.filter(node => 
      connectedNodeIds.has(node.id)
    );
  }
  
  return { nodes: filteredNodes, links: filteredLinks };
}

// Detect tag clusters using simple community detection
export function detectTagClusters(data: TagGraphData): TagCluster[] {
  // Simple clustering based on connection strength
  // This is a basic implementation - could be enhanced with proper algorithms
  const clusters: TagCluster[] = [];
  const visited = new Set<string>();
  const clusterColors = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6'];
  
  data.nodes.forEach(node => {
    if (visited.has(node.id)) return;
    
    const cluster: string[] = [node.id];
    visited.add(node.id);
    
    // Find strongly connected tags
    const strongLinks = data.links.filter(link => {
      const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
      const targetId = typeof link.target === 'string' ? link.target : link.target.id;
      return (sourceId === node.id || targetId === node.id) && link.value > 0.3;
    });
    
    strongLinks.forEach(link => {
      const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
      const targetId = typeof link.target === 'string' ? link.target : link.target.id;
      const connectedId = sourceId === node.id ? targetId : sourceId;
      
      if (!visited.has(connectedId)) {
        cluster.push(connectedId);
        visited.add(connectedId);
      }
    });
    
    if (cluster.length > 1) {
      clusters.push({
        id: `cluster-${clusters.length}`,
        tags: cluster,
        color: clusterColors[clusters.length % clusterColors.length],
      });
    }
  });
  
  return clusters;
}

export function getDefaultTagGraphConfig(width: number, height: number): TagGraphConfig {
  return {
    width,
    height,
    nodeRadius: {
      min: 12,
      max: 30,
    },
    forces: {
      center: 0.2,
      charge: -400,
      link: 0.5,
      collision: 1.2,
    },
    colors: {
      nodes: {
        default: '#3498db', // Primary blue from variables.css
        hover: '#2980b9',   // Darker blue
        selected: '#e74c3c', // Accent red from variables.css
        clusters: ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6'],
      },
      links: {
        default: '#95a5a6', // Light gray
        hover: '#34495e',   // Darker gray
        strong: '#2c3e50',  // Dark slate for strong connections
      },
      background: '#f0f8ff', // Alice blue from variables.css
    },
  };
}

// Get tag relationship information for tooltips
export function getTagRelationship(
  tag1: string,
  tag2: string,
  data: TagGraphData
): {
  sharedContent: string[];
  strength: number;
} | null {
  const link = data.links.find(link => {
    const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
    const targetId = typeof link.target === 'string' ? link.target : link.target.id;
    return (sourceId === tag1 && targetId === tag2) || 
           (sourceId === tag2 && targetId === tag1);
  });
  
  return link ? {
    sharedContent: link.sharedContent,
    strength: link.value,
  } : null;
}