import { ParsedContent, LinkInfo } from '../types/content';
import { parseMarkdown, convertToSlug } from './markdown';

/**
 * Load a single markdown file from the public/content directory
 */
export async function loadMarkdownFile(filename: string): Promise<string> {
  try {
    const url = `/content/${filename}`;
    console.log(`Attempting to load: ${url}`);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load ${filename}: ${response.status} ${response.statusText}`);
    }
    const content = await response.text();
    console.log(`Successfully loaded ${filename}, length: ${content.length}`);
    return content;
  } catch (error) {
    console.error(`Error loading ${filename}:`, error);
    throw error;
  }
}

/**
 * Get list of available content files
 * Start with a basic list and expand as needed
 */
export async function getContentFileList(): Promise<string[]> {
  // Start with known files
  const knownFiles = ['index.md', 'sample-connected.md'];
  
  // Try to load an index file if it exists
  try {
    const indexResponse = await fetch('/content/index.json');
    if (indexResponse.ok) {
      const index = await indexResponse.json();
      console.log('Loaded content index:', index);
      return index.files || knownFiles;
    }
  } catch (error) {
    console.log('No index.json found, using known files:', knownFiles);
  }
  
  return knownFiles;
}

/**
 * Load and parse all content files
 */
export async function loadAllContent(): Promise<Map<string, ParsedContent>> {
  const contentMap = new Map<string, ParsedContent>();
  
  try {
    const fileList = await getContentFileList();
    console.log('Loading files:', fileList);
    
    // Load all files
    const loadPromises = fileList.map(async (filename) => {
      try {
        const fileContent = await loadMarkdownFile(filename);
        const slug = filename.replace('.md', '');
        const parsedContent = parseMarkdown(fileContent, slug);
        contentMap.set(slug, parsedContent);
        console.log(`Parsed content for ${slug}:`, parsedContent.metadata.title);
      } catch (error) {
        console.error(`Failed to load ${filename}:`, error);
      }
    });
    
    await Promise.all(loadPromises);
    
    // Process inbound links
    processInboundLinks(contentMap);
    
    console.log('Loaded content:', Array.from(contentMap.keys()));
  } catch (error) {
    console.error('Error loading content:', error);
  }
  
  return contentMap;
}

/**
 * Process inbound links for all content
 */
function processInboundLinks(contentMap: Map<string, ParsedContent>): void {
  // First, clear all inbound links
  contentMap.forEach(content => {
    content.inboundLinks = [];
  });
  
  // Then populate inbound links based on outbound links
  contentMap.forEach((content, slug) => {
    for (const outboundLink of content.outboundLinks) {
      const targetContent = contentMap.get(outboundLink);
      if (targetContent) {
        targetContent.inboundLinks.push(slug);
      }
    }
  });
}

/**
 * Get all links (for graph visualization)
 */
export function getAllLinks(contentMap: Map<string, ParsedContent>): LinkInfo[] {
  const links: LinkInfo[] = [];
  
  contentMap.forEach((content, slug) => {
    for (const outboundLink of content.outboundLinks) {
      if (contentMap.has(outboundLink)) {
        links.push({
          from: slug,
          to: outboundLink,
          type: 'outbound'
        });
      }
    }
  });
  
  return links;
}