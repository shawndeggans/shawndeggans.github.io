import { useState, useEffect, useCallback } from 'react';
import { ParsedContent, ContentNode, LinkInfo } from '../types/content';
import { loadAllContent, loadMarkdownFile, getAllLinks } from '../utils/contentLoader';
import { parseMarkdown } from '../utils/markdown';

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
      const newContentMap = await loadAllContent();
      const newContentNodes = processContentNodes(newContentMap);
      const newLinks = getAllLinks(newContentMap);
      
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
    try {
      const filename = `${slug}.md`;
      const fileContent = await loadMarkdownFile(filename);
      const parsedContent = parseMarkdown(fileContent, slug);
      
      // Update the content map
      setContentMap(prev => new Map(prev.set(slug, parsedContent)));
      
      return parsedContent;
    } catch (error) {
      console.error(`Error loading content ${slug}:`, error);
      return null;
    }
  }, []);

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