import { ParsedContent } from './content';

export interface BacklinkInfo {
  slug: string;
  title: string;
  excerpt: string;
  date: Date;
  tags: string[];
  contextSnippet?: string; // Where the link appears in source content
  linkType: 'outgoing' | 'incoming';
}

export interface RelatedContent {
  content: ParsedContent;
  relevanceScore: number;
  connectionType: 'tag' | 'backlink' | 'semantic';
  sharedTags?: string[];
  commonLinks?: string[];
}

export interface BacklinkPreview {
  slug: string;
  title: string;
  excerpt: string;
  readingTime: number;
  tags: string[];
  lastModified: Date;
}

export interface BacklinkFilters {
  search: string;
  tags: string[];
  dateRange: {
    start?: Date;
    end?: Date;
  };
  sortBy: 'date' | 'title' | 'relevance';
  sortOrder: 'asc' | 'desc';
}