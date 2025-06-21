export interface GraphNode {
  id: string;
  title: string;
  group: number; // For categorization/coloring
  size: number; // Node size based on connections
  tags: string[];
  date: string;
  // Obsidian-style neighbor tracking
  neighbors: string[]; // Pre-computed neighbor node IDs
  links: string[]; // Pre-computed link IDs involving this node
  x?: number; // D3 will set these
  y?: number;
  fx?: number; // Fixed positions
  fy?: number;
  index?: number;
}

export interface GraphLink {
  id: string; // Unique identifier for the link
  source: string | GraphNode;
  target: string | GraphNode;
  value: number; // Link strength
  index?: number;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export interface GraphConfig {
  width: number;
  height: number;
  nodeRadius: {
    min: number;
    max: number;
  };
  forces: {
    center: number;
    charge: number;
    link: number;
    collision: number;
  };
  colors: {
    nodes: {
      default: string;
      hover: string;
      selected: string;
    };
    links: {
      default: string;
      hover: string;
    };
    background: string;
  };
}