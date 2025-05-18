import { ParsedContent, ContentMetadata } from '../types/content';  // Removed unused 'LinkInfo'

// Regular expression to match [[double bracket]] links
const DOUBLE_BRACKET_REGEX = /\[\[([^\]]+)\]\]/g;

// Simple frontmatter parser for browser compatibility
function parseFrontmatter(fileContent: string): { data: any; content: string } {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = fileContent.match(frontmatterRegex);
  
  if (!match) {
    return { data: {}, content: fileContent };
  }
  
  const [, yamlString, content] = match;
  const data: any = {};
  
  // Simple YAML parser (handles basic key: value pairs)
  const lines = yamlString.split('\n');
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith('#')) continue;
    
    const colonIndex = trimmedLine.indexOf(':');
    if (colonIndex === -1) continue;
    
    const key = trimmedLine.substring(0, colonIndex).trim();
    let value = trimmedLine.substring(colonIndex + 1).trim();
    
    // Handle different value types
    if (value.startsWith('[') && value.endsWith(']')) {
      // Array handling
      const arrayContent = value.slice(1, -1);
      data[key] = arrayContent.split(',').map(item => item.trim().replace(/['"]/g, ''));
    } else if (value.startsWith('"') && value.endsWith('"')) {
      // String with quotes
      data[key] = value.slice(1, -1);
    } else if (value.startsWith("'") && value.endsWith("'")) {
      // String with single quotes
      data[key] = value.slice(1, -1);
    } else if (value === 'true' || value === 'false') {
      // Boolean
      data[key] = value === 'true';
    } else if (!isNaN(Number(value))) {
      // Number
      data[key] = Number(value);
    } else {
      // Plain string
      data[key] = value;
    }
  }
  
  return { data, content };
}

/**
 * Extract double-bracket links from markdown content
 */
export function extractDoubleLinks(content: string): string[] {
  const links: string[] = [];
  let match;
  
  while ((match = DOUBLE_BRACKET_REGEX.exec(content)) !== null) {
    // Extract the link text and convert to slug format
    const linkText = match[1].trim();
    const slug = convertToSlug(linkText);
    links.push(slug);
  }
  
  return Array.from(new Set(links)); // Remove duplicates
}

/**
 * Convert text to URL-friendly slug
 */
export function convertToSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Convert title to filename
 */
export function titleToFilename(title: string): string {
  return `${convertToSlug(title)}.md`;
}

/**
 * Parse markdown file with frontmatter
 */
export function parseMarkdown(fileContent: string, slug: string): ParsedContent {
  const parsed = parseFrontmatter(fileContent);
  const metadata = parsed.data as ContentMetadata;
  const content = parsed.content;
  
  // Extract outbound links from content
  const outboundLinks = extractDoubleLinks(content);
  
  // Ensure required metadata fields
  if (!metadata.title) {
    metadata.title = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
  
  if (!metadata.date) {
    metadata.date = new Date().toISOString().split('T')[0];
  }
  
  if (!metadata.tags) {
    metadata.tags = [];
  }
  
  return {
    metadata,
    content,
    slug,
    outboundLinks,
    inboundLinks: [] // Will be populated when processing all content
  };
}

/**
 * Replace double-bracket links with regular markdown links
 */
export function processDoubleLinks(content: string, baseUrl: string = '/#/content'): string {
  return content.replace(DOUBLE_BRACKET_REGEX, (match, linkText) => {
    const slug = convertToSlug(linkText.trim());
    return `[${linkText}](${baseUrl}/${slug})`;
  });
}

/**
 * Process content for display (convert double links, etc.)
 */
export function processContentForDisplay(content: string): string {
  // Convert double-bracket links to regular markdown links
  let processedContent = processDoubleLinks(content);
  
  // You can add more processing here if needed
  // For example: custom syntax, special formatting, etc.
  
  return processedContent;
}

/**
 * Calculate reading time estimate
 */
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}