/**
 * Unified Graph Types
 * 
 * Generic node/link system designed for extensibility.
 * All nodes appear uniform regardless of type to enable
 * easy addition of new node types in the future.
 */

// Base node interface that all node types must implement
export interface BaseNode {
  id: string;                    // Unique identifier
  type: string;                  // Node type (extensible)
  label: string;                 // Display name
  metadata?: Record<string, any>; // Additional type-specific data
}

// Specific node types for current implementation
export interface ContentNode extends BaseNode {
  type: 'content';
  metadata: {
    filename: string;
    title: string;
    date?: string;
    description?: string;
    tags: string[];
    wordCount: number;
    readingTime: string;
    lastModified: string;
  };
}

export interface TagNode extends BaseNode {
  type: 'tag';
  metadata: {
    contentCount: number;        // Number of content items with this tag
    relatedTags: string[];       // Tags that frequently appear together
  };
}

// Union type for all current node types (extensible)
export type UnifiedNode = ContentNode | TagNode;

// Base link interface for all relationship types
export interface BaseLink {
  id: string;                    // Unique link identifier
  source: string;                // Source node ID
  target: string;                // Target node ID
  type: string;                  // Link type (extensible)
  weight?: number;               // Connection strength (0-1)
  metadata?: Record<string, any>; // Additional link-specific data
}

// Specific link types for current implementation
export interface ContentToContentLink extends BaseLink {
  type: 'content_link';          // Internal [[link]] connections
  metadata: {
    linkText: string;            // Original link text from markdown
    bidirectional: boolean;      // Whether this creates backlinks
  };
}

export interface ContentToTagLink extends BaseLink {
  type: 'tag_assignment';        // Content-to-tag relationships
  metadata: {
    tagPosition: number;         // Order of tag in content frontmatter
  };
}

export interface TagToTagLink extends BaseLink {
  type: 'tag_cooccurrence';      // Tags appearing together
  metadata: {
    cooccurrenceCount: number;   // How many times they appear together
    strength: number;            // Calculated relationship strength
  };
}

// Union type for all current link types (extensible)
export type UnifiedLink = ContentToContentLink | ContentToTagLink | TagToTagLink;

// Complete graph data structure
export interface UnifiedGraphData {
  nodes: UnifiedNode[];
  links: UnifiedLink[];
  metadata: {
    lastGenerated: string;
    totalNodes: number;
    totalLinks: number;
    nodeTypeCounts: Record<string, number>;
    linkTypeCounts: Record<string, number>;
  };
}

// Graph rendering configuration
export interface GraphRenderConfig {
  width: number | string;
  height: number | string;
  nodeRadius: number;
  linkDistance: number;
  chargeStrength: number;
  
  // Visual styling (uniform across all node types)
  nodeStyle: {
    fill: string;
    stroke: string;
    strokeWidth: number;
    opacity: number;
  };
  
  linkStyle: {
    stroke: string;
    strokeWidth: number;
    opacity: number;
  };
  
  // Force simulation settings
  forces: {
    link: { distance: number; strength: number };
    charge: { strength: number };
    center: { x: number; y: number };
    collision: { radius: number };
  };
  
  // Zoom and pan configuration
  zoom: {
    min: number;
    max: number;
    initial: 'fit' | number;
  };
}

// Node positioning and physics simulation data
export type NodeSimulationData = UnifiedNode & {
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;  // Fixed positions
  fy?: number | null;
}

export type LinkSimulationData = UnifiedLink & {
  source: NodeSimulationData | string;
  target: NodeSimulationData | string;
}

// Graph interaction events
export interface GraphInteractionEvent {
  type: 'node_click' | 'node_hover' | 'link_click' | 'background_click';
  node?: UnifiedNode;
  link?: UnifiedLink;
  position?: { x: number; y: number };
  originalEvent: Event;
}

// Type guards for runtime type checking
export function isContentNode(node: UnifiedNode): node is ContentNode {
  return node.type === 'content';
}

export function isTagNode(node: UnifiedNode): node is TagNode {
  return node.type === 'tag';
}

export function isContentToContentLink(link: UnifiedLink): link is ContentToContentLink {
  return link.type === 'content_link';
}

export function isContentToTagLink(link: UnifiedLink): link is ContentToTagLink {
  return link.type === 'tag_assignment';
}

export function isTagToTagLink(link: UnifiedLink): link is TagToTagLink {
  return link.type === 'tag_cooccurrence';
}

// Helper types for graph operations
export type NodeType = UnifiedNode['type'];
export type LinkType = UnifiedLink['type'];

export interface NodeTypeConfig {
  type: NodeType;
  displayName: string;
  description: string;
  defaultStyle?: Partial<GraphRenderConfig['nodeStyle']>;
}

export interface LinkTypeConfig {
  type: LinkType;
  displayName: string;
  description: string;
  defaultStyle?: Partial<GraphRenderConfig['linkStyle']>;
}

// Future extensibility: Templates for adding new node/link types
export interface ExtensionTemplate {
  nodeTypes: NodeTypeConfig[];
  linkTypes: LinkTypeConfig[];
  processorFunction?: string;  // Name of processor function to handle this type
}