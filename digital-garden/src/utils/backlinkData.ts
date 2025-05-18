import { ParsedContent } from '../types/content';
import { BacklinkInfo, RelatedContent, BacklinkPreview } from '../types/backlinks';

export const getBacklinksForContent = (
  targetSlug: string,
  contentMap: Map<string, ParsedContent>,
  links: Array<{ source: string; target: string }>
): {
  incoming: BacklinkInfo[];
  outgoing: BacklinkInfo[];
} => {
  const incoming: BacklinkInfo[] = [];
  const outgoing: BacklinkInfo[] = [];

  // Find incoming links (content that links TO this content)
  const incomingLinks = links.filter(link => link.target === targetSlug);
  for (const link of incomingLinks) {
    const sourceContent = contentMap.get(link.source);
    if (sourceContent) {
      incoming.push({
        slug: sourceContent.slug,
        title: sourceContent.metadata.title,
        excerpt: generateExcerpt(sourceContent.content, 120),
        date: new Date(sourceContent.metadata.date),
        tags: sourceContent.metadata.tags,
        contextSnippet: findLinkContext(sourceContent.content, targetSlug),
        linkType: 'incoming',
      });
    }
  }

  // Find outgoing links (content this content links TO)
  const outgoingLinks = links.filter(link => link.source === targetSlug);
  for (const link of outgoingLinks) {
    const targetContent = contentMap.get(link.target);
    if (targetContent) {
      outgoing.push({
        slug: targetContent.slug,
        title: targetContent.metadata.title,
        excerpt: generateExcerpt(targetContent.content, 120),
        date: new Date(targetContent.metadata.date),
        tags: targetContent.metadata.tags,
        linkType: 'outgoing',
      });
    }
  }

  return { incoming, outgoing };
};

export const getRelatedContent = (
  currentContent: ParsedContent,
  contentMap: Map<string, ParsedContent>,
  links: Array<{ source: string; target: string }>,
  maxResults: number = 5
): RelatedContent[] => {
  const related: RelatedContent[] = [];
  const currentSlug = currentContent.slug;
  const currentTags = currentContent.metadata.tags;

  // Get content connected via backlinks
  const connectedSlugs = new Set([
    ...links.filter(l => l.source === currentSlug).map(l => l.target),
    ...links.filter(l => l.target === currentSlug).map(l => l.source),
  ]);

  contentMap.forEach((content, slug) => {
    if (slug === currentSlug) return;

    let relevanceScore = 0;
    let connectionType: 'tag' | 'backlink' | 'semantic' = 'semantic';
    let sharedTags: string[] = [];
    let commonLinks: string[] = [];

    // Check for direct backlink connections
    if (connectedSlugs.has(slug)) {
      relevanceScore += 10;
      connectionType = 'backlink';
    }

    // Check for shared tags
    sharedTags = currentTags.filter(tag => content.metadata.tags.includes(tag));
    if (sharedTags.length > 0) {
      relevanceScore += sharedTags.length * 5;
      if (connectionType === 'semantic') connectionType = 'tag';
    }

    // Check for common links (content both link to)
    const currentOutgoing = links.filter(l => l.source === currentSlug).map(l => l.target);
    const contentOutgoing = links.filter(l => l.source === slug).map(l => l.target);
    commonLinks = currentOutgoing.filter(target => contentOutgoing.includes(target));
    if (commonLinks.length > 0) {
      relevanceScore += commonLinks.length * 3;
    }

    // Add to related if relevant
    if (relevanceScore > 0) {
      related.push({
        content,
        relevanceScore,
        connectionType,
        sharedTags: sharedTags.length > 0 ? sharedTags : undefined,
        commonLinks: commonLinks.length > 0 ? commonLinks : undefined,
      });
    }
  });

  // Sort by relevance and return top results
  return related
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, maxResults);
};

export const generateContentPreview = (content: ParsedContent): BacklinkPreview => {
  return {
    slug: content.slug,
    title: content.metadata.title,
    excerpt: generateExcerpt(content.content, 150),
    readingTime: estimateReadingTime(content.content),
    tags: content.metadata.tags,
    lastModified: new Date(content.metadata.date),
  };
};

// Helper functions
const generateExcerpt = (content: string, maxLength: number): string => {
  // Remove markdown formatting and create clean excerpt
  const cleanContent = content
    .replace(/^#+\s+/gm, '') // Remove headers
    .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
    .replace(/\*([^*]+)\*/g, '$1') // Remove italic
    .replace(/`([^`]+)`/g, '$1') // Remove inline code
    .replace(/\[\[([^\]]+)\]\]/g, '$1') // Remove link brackets
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove markdown links
    .trim();
  
  if (cleanContent.length <= maxLength) {
    return cleanContent;
  }
  
  return cleanContent.slice(0, maxLength).replace(/\s+\S*$/, '') + '...';
};

const findLinkContext = (content: string, targetSlug: string): string => {
  // Find the context around a link in the content
  const linkPattern = new RegExp(`\\[\\[${targetSlug}\\]\\]`, 'i');
  const match = content.match(linkPattern);
  
  if (!match) return '';
  
  const matchIndex = match.index!;
  const contextStart = Math.max(0, matchIndex - 50);
  const contextEnd = Math.min(content.length, matchIndex + match[0].length + 50);
  
  return content.slice(contextStart, contextEnd).trim();
};

const estimateReadingTime = (content: string): number => {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
};