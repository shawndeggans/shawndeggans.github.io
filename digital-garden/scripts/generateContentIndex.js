#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Paths
const CONTENT_DIR = path.join(__dirname, '..', 'public', 'content');
const OUTPUT_FILE = path.join(__dirname, '..', 'public', 'data', 'contentIndex.json');

// Utility function to parse frontmatter
function parseFrontmatter(content) {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
  const match = content.match(frontmatterRegex);
  
  if (!match) {
    return { frontmatter: {}, body: content };
  }

  const frontmatterText = match[1];
  const body = content.replace(frontmatterRegex, '').trim();
  
  const frontmatter = {};
  const lines = frontmatterText.split('\n');
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;
    
    const colonIndex = trimmedLine.indexOf(':');
    if (colonIndex === -1) continue;
    
    const key = trimmedLine.substring(0, colonIndex).trim();
    let value = trimmedLine.substring(colonIndex + 1).trim();
    
    // Handle arrays (tags)
    if (value.startsWith('[') && value.endsWith(']')) {
      value = value.slice(1, -1)
        .split(',')
        .map(item => item.trim())
        .filter(item => item.length > 0);
    }
    
    frontmatter[key] = value;
  }
  
  return { frontmatter, body };
}

// Extract internal links from content
function extractInternalLinks(content) {
  const linkRegex = /\[\[([^\]]+)\]\]/g;
  const links = [];
  let match;
  
  while ((match = linkRegex.exec(content)) !== null) {
    const linkText = match[1].trim();
    if (linkText && !links.includes(linkText)) {
      links.push(linkText);
    }
  }
  
  return links;
}

// Generate unique ID from filename
function generateId(filename) {
  return path.basename(filename, '.md')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

// Calculate reading time (average 200 words per minute)
function calculateReadingTime(content) {
  const wordCount = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(wordCount / 200);
  return `${minutes} min read`;
}

// Process a single markdown file
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const { frontmatter, body } = parseFrontmatter(content);
    const filename = path.basename(filePath);
    const id = generateId(filename);
    
    // Extract internal links
    const internalLinks = extractInternalLinks(content);
    
    // Get file stats
    const stats = fs.statSync(filePath);
    
    return {
      id,
      filename,
      title: frontmatter.title || path.basename(filename, '.md'),
      date: frontmatter.date || null,
      tags: frontmatter.tags || [],
      description: frontmatter.description || '',
      internalLinks,
      body: body,
      readingTime: calculateReadingTime(body),
      lastModified: stats.mtime.toISOString(),
      wordCount: body.trim().split(/\s+/).length
    };
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error.message);
    return null;
  }
}

// Main function to scan directory and generate index
function generateContentIndex() {
  console.log('🔍 Scanning content directory...');
  
  try {
    // Ensure content directory exists
    if (!fs.existsSync(CONTENT_DIR)) {
      console.error(`Content directory not found: ${CONTENT_DIR}`);
      process.exit(1);
    }
    
    // Read all markdown files
    const files = fs.readdirSync(CONTENT_DIR)
      .filter(file => file.endsWith('.md') && file !== 'README.md')
      .sort();
    
    console.log(`📁 Found ${files.length} markdown files`);
    
    // Process each file
    const contentIndex = {
      lastGenerated: new Date().toISOString(),
      totalFiles: files.length,
      files: []
    };
    
    for (const filename of files) {
      const filePath = path.join(CONTENT_DIR, filename);
      console.log(`📄 Processing: ${filename}`);
      
      const fileData = processFile(filePath);
      if (fileData) {
        contentIndex.files.push(fileData);
      }
    }
    
    // Ensure output directory exists
    const outputDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Write the index file
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(contentIndex, null, 2));
    
    console.log(`✅ Generated content index with ${contentIndex.files.length} files`);
    console.log(`📝 Output: ${OUTPUT_FILE}`);
    
    // Log some statistics
    const totalTags = new Set();
    const totalLinks = new Set();
    let totalWords = 0;
    
    contentIndex.files.forEach(file => {
      file.tags.forEach(tag => totalTags.add(tag));
      file.internalLinks.forEach(link => totalLinks.add(link));
      totalWords += file.wordCount;
    });
    
    console.log(`📊 Statistics:`);
    console.log(`   - Total words: ${totalWords.toLocaleString()}`);
    console.log(`   - Unique tags: ${totalTags.size}`);
    console.log(`   - Internal links: ${totalLinks.size}`);
    
  } catch (error) {
    console.error('❌ Error generating content index:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  generateContentIndex();
}

module.exports = { generateContentIndex, processFile, parseFrontmatter, extractInternalLinks };