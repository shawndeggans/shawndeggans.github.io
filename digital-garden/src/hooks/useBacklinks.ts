import { useMemo } from 'react';
import { ParsedContent } from '../types/content';
import { BacklinkInfo, RelatedContent, BacklinkFilters } from '../types/backlinks';
import { getBacklinksForContent, getRelatedContent } from '../utils/backlinkData';

interface UseBacklinksResult {
  incoming: BacklinkInfo[];
  outgoing: BacklinkInfo[];
  related: RelatedContent[];
  filteredIncoming: BacklinkInfo[];
  filteredOutgoing: BacklinkInfo[];
}

export const useBacklinks = (
  currentContent: ParsedContent | undefined,
  contentMap: Map<string, ParsedContent>,
  links: Array<{ source: string; target: string }>,
  filters: BacklinkFilters = {
    search: '',
    tags: [],
    dateRange: {},
    sortBy: 'date',
    sortOrder: 'desc',
  }
): UseBacklinksResult => {
  const { incoming, outgoing, related } = useMemo(() => {
    if (!currentContent) {
      return { incoming: [], outgoing: [], related: [] };
    }

    const { incoming, outgoing } = getBacklinksForContent(
      currentContent.slug,
      contentMap,
      links
    );

    const related = getRelatedContent(currentContent, contentMap, links);

    return { incoming, outgoing, related };
  }, [currentContent, contentMap, links]);

  const { filteredIncoming, filteredOutgoing } = useMemo(() => {
    const filterBacklinks = (backlinks: BacklinkInfo[]): BacklinkInfo[] => {
      let filtered = [...backlinks];

      // Apply search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filtered = filtered.filter(
          backlink =>
            backlink.title.toLowerCase().includes(searchTerm) ||
            backlink.excerpt.toLowerCase().includes(searchTerm) ||
            backlink.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
      }

      // Apply tag filter
      if (filters.tags.length > 0) {
        filtered = filtered.filter(backlink =>
          filters.tags.some(tag => backlink.tags.includes(tag))
        );
      }

      // Apply date range filter
      if (filters.dateRange.start || filters.dateRange.end) {
        filtered = filtered.filter(backlink => {
          const backlinkDate = backlink.date;
          if (filters.dateRange.start && backlinkDate < filters.dateRange.start) {
            return false;
          }
          if (filters.dateRange.end && backlinkDate > filters.dateRange.end) {
            return false;
          }
          return true;
        });
      }

      // Apply sorting
      filtered.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (filters.sortBy) {
          case 'title':
            aValue = a.title.toLowerCase();
            bValue = b.title.toLowerCase();
            break;
          case 'date':
            aValue = a.date;
            bValue = b.date;
            break;
          default:
            aValue = a.date;
            bValue = b.date;
        }

        const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        return filters.sortOrder === 'asc' ? comparison : -comparison;
      });

      return filtered;
    };

    return {
      filteredIncoming: filterBacklinks(incoming),
      filteredOutgoing: filterBacklinks(outgoing),
    };
  }, [incoming, outgoing, filters]);

  return {
    incoming,
    outgoing,
    related,
    filteredIncoming,
    filteredOutgoing,
  };
};