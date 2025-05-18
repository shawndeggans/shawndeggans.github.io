export interface ContentMetadata {
  title: string;
  date: string;
  tags: string[];
  slug?: string;
  description?: string;
  [key: string]: any;
}

export interface ParsedContent {
  metadata: ContentMetadata;
  content: string;
  slug: string;
  outboundLinks: string[];
  inboundLinks: string[];
}

export interface ContentNode {
  id: string;
  title: string;
  tags: string[];
  date: string;
  connections: string[];
}

export interface LinkInfo {
  from: string;
  to: string;
  type: 'outbound' | 'inbound';
}