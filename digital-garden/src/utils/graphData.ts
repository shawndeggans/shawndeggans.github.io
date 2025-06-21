import { ParsedContent } from '../types/content';
import { GraphNode, GraphLink, GraphData, GraphConfig } from '../types/graph';

export function transformContentToGraphData(
  contentMap: Map<string, ParsedContent>,
  links: Array<{ from: string; to: string }>
): GraphData {
  // Exclude standalone pages like 'about' from the graph
  const excludeFromGraph = ['about'];
  
  const nodes: GraphNode[] = [];
  const processedLinks: GraphLink[] = [];
  
  // Create initial nodes from content
  contentMap.forEach((content, slug) => {
    // Skip pages that shouldn't be in the graph
    if (excludeFromGraph.includes(slug)) {
      return;
    }
    
    nodes.push({
      id: slug,
      title: content.metadata.title,
      group: content.metadata.tags?.length || 0, // Group by tag count for now
      size: calculateNodeSize(slug, links),
      tags: content.metadata.tags || [],
      date: content.metadata.date || '',
      neighbors: [], // Will be populated below
      links: [], // Will be populated below
    });
  });
  
  // Create links from connections and generate IDs
  links.forEach((link, index) => {
    // Only include links where both nodes exist AND neither is excluded
    if (contentMap.has(link.from) && 
        contentMap.has(link.to) && 
        !excludeFromGraph.includes(link.from) && 
        !excludeFromGraph.includes(link.to)) {
      
      const linkId = `${link.from}-${link.to}`;
      processedLinks.push({
        id: linkId,
        source: link.from,
        target: link.to,
        value: 1, // All links have equal weight for now
      });
    }
  });
  
  // Pre-compute neighbors and link associations (Obsidian-style)
  const nodeMap = new Map<string, GraphNode>();
  nodes.forEach(node => nodeMap.set(node.id, node));
  
  processedLinks.forEach(link => {
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
  
  return { nodes, links: processedLinks };
}

function calculateNodeSize(nodeId: string, links: Array<{ from: string; to: string }>): number {
  // Size based on number of connections
  const connections = links.filter(link => link.from === nodeId || link.to === nodeId).length;
  return Math.max(3, Math.min(10, connections)); // Size between 3 and 10
}

export function getDefaultGraphConfig(width: number, height: number): GraphConfig {
  return {
    width,
    height,
    nodeRadius: {
      min: 8,
      max: 20,
    },
    forces: {
      center: 0.3,
      charge: -300,
      link: 0.6,
      collision: 1,
    },
    colors: {
      nodes: {
        default: '#3498db', // Primary blue
        hover: '#2980b9',   // Darker blue
        selected: '#e74c3c', // Accent red
      },
      links: {
        default: '#95a5a6', // Light gray
        hover: '#34495e',   // Darker gray
      },
      background: '#f0f8ff', // Alice blue
    },
  };
}