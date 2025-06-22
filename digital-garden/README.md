# Digital Garden - Interactive Knowledge Explorer

A modern digital garden built with React and D3.js that transforms traditional content navigation into an interactive exploration experience. Unlike conventional blogs or wikis, this system presents content through a unified graph visualization where ideas connect naturally through relationships rather than hierarchical navigation.

## 🌱 What is a Digital Garden?

This digital garden embraces the philosophy of **learning in public** and **connecting ideas**. Rather than organizing content chronologically like a blog, it creates a living network where:

- **Ideas grow and evolve** over time through iterative refinement
- **Connections emerge naturally** through bidirectional linking and tag relationships  
- **Discovery happens through exploration** rather than traditional navigation
- **Knowledge compounds** as new content links to existing ideas

## ✨ Key Features

### Unified Exploration Interface
- **Single Home Page**: Combines graph visualization, filtering, and timeline in one view
- **No Traditional Navigation**: Discovery happens through visual exploration and filtering
- **App-like Experience**: Clean, minimal interface focused on content discovery

### Interactive Graph Visualization
- **Unified Network**: Displays both content nodes (blue) and tag nodes (purple) in a single graph
- **Force-Directed Layout**: Uses D3.js physics simulation for natural node positioning
- **Interactive Elements**: Click nodes to navigate, hover for details, drag to explore
- **Visual Relationships**: Shows content connections, tag assignments, and tag co-occurrence

### Intelligent Filtering System
- **Global Search**: Text search across all content with real-time filtering
- **Tag Cloud**: Visual tag exploration with frequency-based sizing
- **Date Range Selection**: Filter content by publication date
- **Unified State**: All filters affect both graph and timeline simultaneously

### Automatic Content Discovery
- **Zero Configuration**: Drop markdown files in `/public/content/` and they're automatically discovered
- **Build-time Indexing**: Content is processed during development and build phases
- **Wiki-style Linking**: Use `[[Page Title]]` syntax for automatic bidirectional links
- **Rich Metadata**: Automatic extraction of tags, dates, descriptions, and relationships

### Timeline Integration
- **Compact Timeline**: Chronological view integrated below the graph
- **Synchronized Filtering**: Timeline reflects the same filters as the graph
- **Rich Content Cards**: Preview content with metadata, tags, and excerpts
- **Clickable Tags**: Tags in timeline entries trigger graph filtering

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Git (for deployment to GitHub Pages)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/digital-garden.git
cd digital-garden

# Install dependencies
npm install

# Start development server
npm start
```

The application will automatically:
1. Scan `/public/content/` for markdown files
2. Generate a content index with relationships and metadata
3. Launch the development server at `http://localhost:3000`

### Adding Your First Content

1. Create a markdown file in `/public/content/`:

```markdown
---
title: My First Note
date: 2024-01-15
tags: [example, getting-started]
description: An example note to get started
---

# My First Note

This is my first note in the digital garden! 

I can link to other notes using [[wiki-style]] syntax. When I reference [[Another Note]], it creates a bidirectional connection.

## Tags and Discovery

Tags help organize content and create relationships. This note is tagged with `example` and `getting-started`.
```

2. Restart the development server (`npm start`) to see your content appear in the graph

## 📝 Content Authoring Guide

### Frontmatter Schema

All content files should include YAML frontmatter with metadata:

```yaml
---
title: "Your Content Title"           # Required: Display title
date: "2024-01-15"                   # Optional: Publication date (YYYY-MM-DD)
tags: [tag1, tag2, tag3]             # Optional: Array of tags
description: "Brief description"      # Optional: Used in previews and search
---
```

### Wiki-style Linking

Create connections between content using double bracket syntax:

```markdown
# Link Examples

Link to other content: [[My Core Values]]
Link with custom text: [[Building a Semantic Layer|semantic layers]]
Link to content with special characters: [[volatility-based decomposition]]
```

**Important**: Links use the exact title from the target content's frontmatter, not the filename.

### Supported Markdown Features

- **GitHub Flavored Markdown**: Tables, task lists, strikethrough
- **Code Syntax Highlighting**: Fenced code blocks with language specification
- **Rich Text**: Bold, italic, headings, lists, quotes
- **Links and Images**: Standard markdown linking and image embedding

### Content Organization Tips

1. **Use Descriptive Titles**: Titles become node labels and link targets
2. **Tag Strategically**: Tags create visual clusters in the graph
3. **Link Generously**: More connections create a richer knowledge network
4. **Write Evergreen Content**: Focus on ideas that can grow and evolve
5. **Cross-Reference Ideas**: Look for opportunities to connect new content to existing notes

## 🏗️ System Architecture

### Build-time Content Processing

The system uses a build-time approach for optimal performance:

```
Content Creation → Build Process → Runtime Display
     ↓                ↓              ↓
  Markdown Files → Content Index → React App
```

1. **Content Scanning**: `scripts/generateContentIndex.js` scans `/public/content/`
2. **Metadata Extraction**: Parses frontmatter and extracts wiki-links
3. **Relationship Building**: Creates content connections and tag relationships
4. **Index Generation**: Outputs unified data structure to `/public/data/contentIndex.json`

### Component Architecture

```
HomePage (Main Interface)
├── GlobalFilter (Search, Tags, Dates)
├── UnifiedGraph (D3.js Visualization)
└── TimelineView (Chronological Content)

ContentView (Individual Content Pages)
├── Content Rendering (ReactMarkdown)
├── BacklinksSection (Bidirectional Links)
└── RelatedContent (Tag-based Suggestions)
```

### Data Flow

1. **Content Index**: Single source of truth generated at build time
2. **React Hooks**: `useGraphData`, `useFilterState`, `useContent` manage state
3. **Real-time Filtering**: Filter state affects all components simultaneously
4. **URL Synchronization**: Filter state persists in URL for sharing

## 🎨 Technology Stack

### Core Technologies
- **React 19.1.0**: Modern React with concurrent features
- **TypeScript**: Type-safe development and better tooling
- **D3.js 7.9.0**: Advanced data visualization and force simulation
- **React Router 6**: Client-side routing and navigation

### Content Processing
- **ReactMarkdown**: Markdown rendering with GitHub Flavored Markdown
- **Remark/Rehype**: Markdown processing pipeline
- **Custom Build Script**: Node.js-based content indexing

### Styling & UI
- **CSS Custom Properties**: Design system with consistent theming
- **Responsive Design**: Mobile-friendly layouts (future enhancement)
- **CSS Grid & Flexbox**: Modern layout techniques

## 🚀 Deployment

### GitHub Pages Setup

The project is configured for automatic deployment to GitHub Pages:

1. **Build Process**: `npm run build` triggers content indexing and production build
2. **GitHub Actions**: Automated deployment on push to main branch
3. **Static Hosting**: Optimized build served from GitHub Pages

### Manual Deployment

```bash
# Build for production
npm run build

# Deploy to GitHub Pages (if gh-pages configured)
npm run deploy
```

### Environment Configuration

Set the `homepage` field in `package.json` for proper routing:

```json
{
  "homepage": "https://yourusername.github.io/repository-name"
}
```

## 🛠️ Development Guide

### Project Structure

```
digital-garden/
├── public/
│   ├── content/              # Your markdown content files
│   └── data/                 # Generated content index
├── src/
│   ├── components/           # React components
│   │   ├── HomePage/         # Main interface components
│   │   ├── ContentView/      # Individual content pages
│   │   └── shared/           # Reusable components
│   ├── hooks/                # Custom React hooks
│   ├── types/                # TypeScript type definitions
│   ├── utils/                # Utility functions
│   └── styles/               # Global CSS and design system
├── scripts/
│   └── generateContentIndex.js  # Build-time content processor
└── docs/                     # Project documentation
```

### Key Files

- **`scripts/generateContentIndex.js`**: Content discovery and relationship building
- **`src/hooks/useGraphData.ts`**: Graph data processing and filtering
- **`src/components/HomePage/UnifiedGraph.tsx`**: D3.js visualization component
- **`src/utils/graphDataProcessor.ts`**: Data transformation for visualization

### Development Workflow

1. **Content Development**: Add/edit markdown files in `/public/content/`
2. **Automatic Rebuilding**: Development server rebuilds content index on restart
3. **Real-time Updates**: React hot reloading for component changes
4. **Type Safety**: TypeScript catches errors during development

### Extending Functionality

#### Adding New Content Types

1. Extend the frontmatter schema in content indexing script
2. Update TypeScript types in `src/types/`
3. Modify content processing in `src/utils/graphDataProcessor.ts`
4. Update UI components to display new metadata

#### Customizing Visualization

1. Modify D3.js configuration in `UnifiedGraph.tsx`
2. Adjust force simulation parameters for different layouts
3. Customize node and link styling in component CSS
4. Add new interaction modes or filtering options

## 🎯 Configuration & Customization

### Content Indexing Options

Modify `scripts/generateContentIndex.js` to:
- Change content directory location
- Adjust frontmatter parsing rules
- Add custom metadata extraction
- Modify link detection patterns

### Visual Customization

Update CSS custom properties in `src/styles/variables.css`:

```css
:root {
  /* Brand Colors */
  --accent-color: #3b82f6;          /* Primary accent */
  --text-primary: #1a1a1a;          /* Main text */
  --text-secondary: #6b7280;        /* Secondary text */
  --border-color: #e5e7eb;          /* Borders and dividers */
  
  /* Graph Visualization */
  --graph-bg: #fafbfc;              /* Graph background */
  --node-content: #3b82f6;          /* Content node color */
  --node-tag: #8b5cf6;              /* Tag node color */
}
```

### Performance Tuning

For large content collections (200+ files):
- Adjust D3.js force simulation parameters
- Implement content lazy loading
- Add virtualization for timeline view
- Consider content pagination

## 📖 Usage Examples

### Research Notes
Perfect for academic research, technical documentation, or personal knowledge management where connections between ideas matter more than publication order.

### Technical Documentation
Create living documentation that evolves with your codebase, connecting concepts, patterns, and decisions through natural relationships.

### Creative Writing
Build interconnected story worlds, character development, or thematic explorations where relationships emerge organically.

### Learning Journals
Document learning journeys where new concepts build on previous knowledge, creating a visual map of intellectual growth.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **D3.js Community**: For the incredible data visualization library
- **Digital Garden Movement**: For inspiring a new way to think about knowledge sharing
- **React Ecosystem**: For the robust tooling and component model
- **Obsidian & Roam**: For pioneering bidirectional linking in note-taking tools

---

*This digital garden grows through exploration and connection. Every link creates new pathways for discovery.*