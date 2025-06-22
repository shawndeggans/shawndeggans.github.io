import { useState, useEffect, useCallback } from 'react';
import { ParsedContent, ContentNode, LinkInfo } from '../types/content';

interface UseContentReturn {
  contentMap: Map<string, ParsedContent>;
  contentNodes: ContentNode[];
  links: LinkInfo[];
  loading: boolean;
  error: string | null;
  getContent: (slug: string) => ParsedContent | undefined;
  refreshContent: () => Promise<void>;
  loadSingleContent: (slug: string) => Promise<ParsedContent | null>;
}

export function useContent(): UseContentReturn {
  const [contentMap, setContentMap] = useState<Map<string, ParsedContent>>(new Map());
  const [contentNodes, setContentNodes] = useState<ContentNode[]>([]);
  const [links, setLinks] = useState<LinkInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const processContentNodes = useCallback((contentMap: Map<string, ParsedContent>): ContentNode[] => {
    return Array.from(contentMap.values()).map(content => ({
      id: content.slug,
      title: content.metadata.title,
      tags: content.metadata.tags,
      date: content.metadata.date,
      connections: [...content.outboundLinks, ...content.inboundLinks]
    }));
  }, []);

  const refreshContent = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load from the unified content index
      const response = await fetch('/data/contentIndex.json');
      if (!response.ok) {
        throw new Error(`Failed to load content index: ${response.status}`);
      }
      
      const contentIndex = await response.json();
      const newContentMap = new Map<string, ParsedContent>();
      const newLinks: LinkInfo[] = [];
      
      // Create a title-to-id mapping for internal link resolution
      const titleToIdMap = new Map<string, string>();
      contentIndex.files.forEach((file: any) => {
        titleToIdMap.set(file.title, file.id);
      });
      
      // Transform the content index format to ParsedContent format
      contentIndex.files.forEach((file: any) => {
        // Convert internal link titles to IDs
        const outboundLinks = (file.internalLinks || [])
          .map((linkTitle: string) => titleToIdMap.get(linkTitle))
          .filter((linkedId: string | undefined): linkedId is string => linkedId !== undefined);
        
        const parsedContent: ParsedContent = {
          slug: file.id,
          content: file.body,
          metadata: {
            title: file.title,
            date: file.date,
            tags: file.tags || [],
            description: file.description
          },
          outboundLinks,
          inboundLinks: [] // Will be populated below
        };
        
        newContentMap.set(file.id, parsedContent);
      });
      
      // Process inbound links
      for (const [slug, content] of newContentMap.entries()) {
        for (const outboundLink of content.outboundLinks) {
          const targetContent = newContentMap.get(outboundLink);
          if (targetContent) {
            targetContent.inboundLinks.push(slug);
            newLinks.push({
              from: slug,
              to: outboundLink,
              type: 'outbound'
            });
          }
        }
      }
      
      const newContentNodes = processContentNodes(newContentMap);
      
      setContentMap(newContentMap);
      setContentNodes(newContentNodes);
      setLinks(newLinks);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load content';
      setError(errorMessage);
      console.error('Error loading content:', err);
    } finally {
      setLoading(false);
    }
  }, [processContentNodes]);

  const getContent = useCallback((slug: string): ParsedContent | undefined => {
    return contentMap.get(slug);
  }, [contentMap]);

  const loadSingleContent = useCallback(async (slug: string): Promise<ParsedContent | null> => {
    // With the unified index system, all content should already be loaded
    // This function now just returns from the existing content map
    const content = contentMap.get(slug);
    if (content) {
      return content;
    }
    
    // If content is not found, try to reload the entire index
    console.log(`Content ${slug} not found, refreshing content index`);
    await refreshContent();
    return contentMap.get(slug) || null;
  }, [contentMap, refreshContent]);

  // Load content on mount
  useEffect(() => {
    refreshContent();
  }, [refreshContent]);

  return {
    contentMap,
    contentNodes,
    links,
    loading,
    error,
    getContent,
    refreshContent,
    loadSingleContent
  };
}