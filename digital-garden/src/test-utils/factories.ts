import { ContentMetadata, ParsedContent, ContentNode, LinkInfo } from '../types/content';
import { GraphNode, GraphLink } from '../types/graph';
import { BacklinkInfo } from '../types/backlinks';
// import { TagConnection } from '../types/tagGraph';
import { TimelineEntry } from '../types/timeline';

export const getMockContentMetadata = (
  overrides?: Partial<ContentMetadata>
): ContentMetadata => {
  return {
    title: 'Test Content',
    date: '2024-01-01',
    tags: ['test', 'sample'],
    slug: 'test-content',
    description: 'This is a test content description',
    ...overrides,
  };
};

export const getMockParsedContent = (
  overrides?: Partial<ParsedContent>
): ParsedContent => {
  return {
    metadata: getMockContentMetadata(overrides?.metadata),
    content: '# Test Content\n\nThis is test content with a [[link]].',
    slug: 'test-content',
    outboundLinks: ['link'],
    inboundLinks: [],
    ...overrides,
  };
};

export const getMockContentNode = (
  overrides?: Partial<ContentNode>
): ContentNode => {
  return {
    id: 'test-content',
    title: 'Test Content',
    tags: ['test', 'sample'],
    date: '2024-01-01',
    connections: [],
    ...overrides,
  };
};

export const getMockGraphNode = (
  overrides?: Partial<GraphNode>
): GraphNode => {
  return {
    id: 'test-node',
    title: 'Test Node',
    group: 1,
    size: 10,
    tags: ['test'],
    date: '2024-01-01',
    neighbors: [],
    links: [],
    ...overrides,
  };
};

export const getMockGraphLink = (
  overrides?: Partial<GraphLink>
): GraphLink => {
  return {
    id: 'link-1',
    source: 'node-1',
    target: 'node-2',
    value: 1,
    ...overrides,
  };
};

export const getMockBacklinkInfo = (
  overrides?: Partial<BacklinkInfo>
): BacklinkInfo => {
  return {
    slug: 'linked-content',
    title: 'Linked Content',
    excerpt: 'This is a context with a [[test-content]] link.',
    date: new Date('2024-01-02'),
    tags: ['linked'],
    linkType: 'incoming',
    ...overrides,
  };
};

// Tag connection factory will be added when needed

export const getMockTimelineEntry = (
  overrides?: Partial<TimelineEntry>
): TimelineEntry => {
  return {
    id: 'timeline-entry',
    title: 'Timeline Entry',
    date: '2024-01-01',
    tags: ['timeline'],
    excerpt: 'This is a preview of the timeline entry...',
    ...overrides,
  };
};

export const getMockLinkInfo = (
  overrides?: Partial<LinkInfo>
): LinkInfo => {
  return {
    from: 'source-content',
    to: 'target-content',
    type: 'outbound',
    ...overrides,
  };
};

export const getMockRelatedContent = (
  overrides?: Partial<import('../types/backlinks').RelatedContent>
): import('../types/backlinks').RelatedContent => {
  return {
    content: getMockParsedContent(),
    relevanceScore: 0.85,
    connectionType: 'tag',
    sharedTags: ['javascript', 'testing'],
    ...overrides,
  };
};