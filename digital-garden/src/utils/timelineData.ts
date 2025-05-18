import { ParsedContent } from '../types/content';
import { TimelineEntry, TimelineGroup, TimelineFilters, TimelineGrouping, TimelineSortOrder } from '../types/timeline';

// Convert content to timeline entries
export function transformContentToTimeline(
  contentMap: Map<string, ParsedContent>
): TimelineEntry[] {
  const entries: TimelineEntry[] = [];
  
  contentMap.forEach((content, slug) => {
    entries.push({
      id: slug,
      title: content.metadata.title,
      date: content.metadata.date || new Date().toISOString().split('T')[0],
      excerpt: generateExcerpt(content.content),
      tags: content.metadata.tags || [],
      readingTime: estimateReadingTime(content.content),
      wordCount: countWords(content.content),
    });
  });
  
  return entries;
}

// Generate excerpt from content
function generateExcerpt(content: string, maxLength: number = 150): string {
  // Remove markdown headers, links, and formatting
  const plainText = content
    .replace(/^#{1,6}\s+/gm, '') // Remove headers
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove link formatting, keep text
    .replace(/\[\[([^\]]+)\]\]/g, '$1') // Remove double bracket links
    .replace(/[*_`]/g, '') // Remove emphasis markers
    .replace(/\n+/g, ' ') // Replace newlines with spaces
    .trim();
  
  if (plainText.length <= maxLength) return plainText;
  
  // Find the last complete sentence within the limit
  const truncated = plainText.substring(0, maxLength);
  const lastSentence = truncated.lastIndexOf('.');
  
  if (lastSentence > maxLength * 0.5) {
    return truncated.substring(0, lastSentence + 1);
  }
  
  // If no sentence boundary, truncate at word boundary
  const lastSpace = truncated.lastIndexOf(' ');
  return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
}

// Estimate reading time (average 200 words per minute)
function estimateReadingTime(content: string): number {
  const wordCount = countWords(content);
  return Math.ceil(wordCount / 200);
}

// Count words in content
function countWords(content: string): number {
  return content
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 0).length;
}

// Group timeline entries by period
export function groupTimelineEntries(
  entries: TimelineEntry[],
  grouping: TimelineGrouping,
  sortOrder: TimelineSortOrder = 'newest'
): TimelineGroup[] {
  // Sort entries first
  const sortedEntries = [...entries].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return sortOrder === 'newest' 
      ? dateB.getTime() - dateA.getTime()
      : dateA.getTime() - dateB.getTime();
  });
  
  // Group by period
  const groups = new Map<string, TimelineEntry[]>();
  
  sortedEntries.forEach(entry => {
    const date = new Date(entry.date);
    let groupKey: string;
    
    switch (grouping) {
      case 'year':
        groupKey = date.getFullYear().toString();
        break;
      case 'month':
        groupKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        break;
      case 'week':
        const weekStart = getWeekStart(date);
        groupKey = weekStart.toISOString().split('T')[0];
        break;
      default:
        groupKey = date.getFullYear().toString();
    }
    
    if (!groups.has(groupKey)) {
      groups.set(groupKey, []);
    }
    groups.get(groupKey)!.push(entry);
  });
  
  // Convert to array and format group names
  const result: TimelineGroup[] = [];
  groups.forEach((entries, key) => {
    result.push({
      period: formatGroupPeriod(key, grouping),
      entries,
    });
  });
  
  return result;
}

// Get the start of the week (Monday)
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
  return new Date(d.setDate(diff));
}

// Format group period for display
function formatGroupPeriod(key: string, grouping: TimelineGrouping): string {
  switch (grouping) {
    case 'year':
      return key;
    case 'month':
      const [year, month] = key.split('-');
      return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long'
      });
    case 'week':
      const weekDate = new Date(key);
      const weekEnd = new Date(weekDate);
      weekEnd.setDate(weekEnd.getDate() + 6);
      return `${weekDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    default:
      return key;
  }
}

// Filter timeline entries
export function filterTimelineEntries(
  entries: TimelineEntry[],
  filters: TimelineFilters
): TimelineEntry[] {
  return entries.filter(entry => {
    // Filter by tags
    if (filters.tags.length > 0) {
      const hasMatchingTag = filters.tags.some(tag => 
        entry.tags.some(entryTag => 
          entryTag.toLowerCase().includes(tag.toLowerCase())
        )
      );
      if (!hasMatchingTag) return false;
    }
    
    // Filter by date range
    if (filters.dateRange) {
      const entryDate = new Date(entry.date);
      const startDate = new Date(filters.dateRange.start);
      const endDate = new Date(filters.dateRange.end);
      if (entryDate < startDate || entryDate > endDate) return false;
    }
    
    // Filter by search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const titleMatch = entry.title.toLowerCase().includes(query);
      const excerptMatch = entry.excerpt?.toLowerCase().includes(query);
      const tagMatch = entry.tags.some(tag => tag.toLowerCase().includes(query));
      if (!titleMatch && !excerptMatch && !tagMatch) return false;
    }
    
    return true;
  });
}

// Get all unique tags from timeline entries
export function getUniqueTimelineTags(entries: TimelineEntry[]): string[] {
  const tagSet = new Set<string>();
  entries.forEach(entry => {
    entry.tags.forEach(tag => tagSet.add(tag));
  });
  return Array.from(tagSet).sort();
}

// Get date range from timeline entries
export function getTimelineDateRange(entries: TimelineEntry[]): { start: string; end: string } | null {
  if (entries.length === 0) return null;
  
  const dates = entries.map(entry => new Date(entry.date));
  const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
  const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
  
  return {
    start: minDate.toISOString().split('T')[0],
    end: maxDate.toISOString().split('T')[0],
  };
}