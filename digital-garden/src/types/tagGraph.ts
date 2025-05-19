export interface TagNode {
  id: string; // tag name
  title: string; // display name (same as id for tags)
  group: number; // cluster/category for coloring
  size: number; // based on content count
  contentCount: number; // number of posts with this tag
  connectedContent: string[]; // slugs of content with this tag
  x?: number; // D3 will set these
  y?: number;
  fx?: number; // Fixed positions
  fy?: number;
  index?: number;
}

export interface TagLink {
  source: string | TagNode;
  target: string | TagNode;
  value: number; // co-occurrence strength (0-1)
  sharedContent: string[]; // content slugs that share both tags
  index?: number;
}

export interface TagGraphData {
  nodes: TagNode[];
  links: TagLink[];
}

export interface TagCluster {
  id: string;
  tags: string[];
  color: string;
}

export interface TagGraphConfig {
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
      clusters: string[]; // Different colors for tag clusters
    };
    links: {
      default: string;
      hover: string;
      strong: string; // For strong tag relationships
    };
    background: string;
  };
}

export interface TagFilter {
  minContentCount?: number;
  minConnectionStrength?: number;
  selectedTags?: string[];
  hideIsolated?: boolean;
}