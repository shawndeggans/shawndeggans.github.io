# Digital Garden

A modern, interactive digital garden built with React that transforms traditional blog navigation into an interconnected knowledge exploration platform.

## 🌱 Philosophy

This digital garden embraces the concept of **non-linear exploration** over chronological browsing. Instead of isolated blog posts, content forms an interconnected web of ideas that can be discovered through multiple pathways:

- **Visual connections** through an interactive graph
- **Chronological browsing** via timeline view  
- **Topical exploration** through tag networks
- **Organic growth** without rigid templates

## ✨ Features

### 📊 Interactive Graph Visualization
- Force-directed graph showing content connections
- Click nodes to navigate, hover to see relationships
- Real-time tooltips with metadata
- Zoom and pan exploration
- Visual representation similar to Obsidian's graph view

### 📅 Timeline View
- Chronological content organization
- Advanced filtering by tags and search
- Grouping by year, month, or week
- Rich metadata display with reading times
- Card-based responsive design

### 🏷️ Tag Network (Planned)
- Tag-based content discovery
- Connection strength visualization
- Co-occurrence relationships
- Interactive filtering controls

### 📝 Clean Reading Experience
- Distraction-free content display
- Beautiful typography (Source Serif Pro + Open Sans)
- Bidirectional link visualization
- Responsive design for all devices

### 🧭 Unified Navigation
- Consistent navigation across all views
- Breadcrumb support
- Alice Blue design theme
- Mobile-responsive interface

### ℹ️ About Page
- Simple markdown-based about content
- Excluded from graph visualization
- Consistent styling with reading view

## 🛠️ Technology Stack

- **Frontend**: React 19.1.0 with TypeScript
- **Routing**: React Router DOM 7.6.0 (HashRouter for GitHub Pages)
- **Visualization**: D3.js v7 for interactive graphs
- **Markdown**: react-markdown with remark-gfm
- **Styling**: CSS with design system tokens
- **Build**: Create React App
- **Deployment**: GitHub Actions → GitHub Pages
- **Node**: Version 20.x required

## 🚀 Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm package manager
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/shawndeggans/shawndeggans.github.io.git
   cd shawndeggans.github.io/digital-garden
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   ```
   http://localhost:3000
   ```

### Content Setup

1. **Create content directory structure**
   ```
   public/content/
   ├── index.md          # Home page content
   ├── about.md           # About page content  
   ├── other-content.md   # Your content files
   └── index.json         # File listing
   ```

2. **Update content index**
   ```json
   [
     "index.md",
     "about.md",
     "your-content.md"
   ]
   ```

## 📝 Content Creation

### Writing Content

Create `.md` files in `public/content/` with optional frontmatter:

```markdown
---
title: Your Content Title
date: 2025-01-15
tags: [technology, learning]
description: Optional description for SEO
---

# Your Content

Write your content using standard markdown.

## Creating Connections

Use [[double-bracket]] syntax to link to other content:

- [[index]] links to index.md
- [[about]] links to about.md

These create bidirectional connections shown in the graph view.
```

### Frontmatter Options

- `title`: Display title (auto-generated from filename if missing)
- `date`: Publication date (defaults to today if missing)  
- `tags`: Array of tags for filtering and organization
- `description`: Meta description for SEO purposes

### Connecting Content

- Use `[[other-content]]` syntax to create bidirectional links
- Links automatically appear in:
  - Graph visualization as connections
  - Reading view as "References" and "Referenced by" sections
  - Timeline view for navigation

## 🗂️ Project Structure

```
src/
├── components/
│   ├── GraphView/          # Interactive graph visualization
│   ├── TimelineView/       # Chronological content browser
│   ├── ContentView/        # Reading interface
│   ├── AboutView/          # About page display
│   ├── Navigation/         # Navigation and breadcrumbs
│   └── Layout/             # Unified layout wrapper
├── hooks/
│   ├── useContent.ts       # Central content management
│   └── useViewState.ts     # Navigation state tracking
├── utils/
│   ├── markdown.ts         # Frontmatter parsing
│   ├── contentLoader.ts    # File loading system
│   └── graphData.ts        # Graph data transformation
├── types/
│   ├── content.ts          # Content type definitions
│   ├── graph.ts            # Graph data types
│   └── navigation.ts       # Navigation types
└── styles/
    ├── variables.css       # Design system tokens
    └── global.css          # Global styles
```

## 🎨 Design System

### Color Palette

- **Background**: Alice Blue (#F0F8FF)
- **Surface**: White (#FFFFFF)  
- **Primary**: Blue (#3498DB)
- **Accent**: Red (#E74C3C)
- **Text**: Dark Gray (#4A5568)

### Typography

- **Body**: Source Serif Pro (Google Fonts)
- **Headings**: Open Sans (Google Fonts)
- **Code**: Consolas, Monaco, Courier New

### Responsive Design

- Mobile-first approach
- Consistent spacing using CSS custom properties
- Touch-friendly interactions
- Adaptive layouts for all screen sizes

## 🔧 Development

### Available Scripts

```bash
npm start          # Development server
npm run build      # Production build
npm run deploy     # Manual deployment to GitHub Pages
npm test           # Run tests (when available)
```

### Development Workflow

1. **Content changes**: Just add/edit `.md` files and update `index.json`
2. **Code changes**: Edit React components, CSS, or utilities
3. **Testing**: Use `npm start` for live reload during development
4. **Deployment**: Push to main branch for automatic deployment

### Build Configuration

- Uses `CI=false` to treat warnings as warnings, not errors
- Optimized for GitHub Pages static hosting
- HashRouter configuration for client-side routing compatibility

## 🚢 Deployment

### Automatic Deployment

- **Trigger**: Push to main branch
- **Action**: GitHub Actions workflow
- **Target**: GitHub Pages
- **URL**: https://shawndeggans.github.io/

### Manual Deployment

```bash
npm run build
npm run deploy
```

### Environment Requirements

- Node.js 20.x in GitHub Actions
- Static file hosting (GitHub Pages)
- No server-side processing required

## 📱 Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)  
- ✅ Safari (latest)
- ✅ Mobile browsers
- ✅ Edge (latest)

## 🎯 Features Roadmap

### ✅ Completed
- Interactive graph visualization
- Timeline view with filtering
- Clean reading experience
- Unified navigation system
- Enhanced content connections
- About page

### 🔄 In Progress
- Tag network visualization

### 📋 Future Enhancements
- Full-text search functionality
- Content management optimizations
- Performance improvements
- Analytics integration

## 🔧 Customization

### Updating Colors

Edit `src/styles/variables.css`:

```css
:root {
  --color-primary: #your-color;
  --color-background: #your-background;
  /* ... other variables */
}
```

### Adding New Views

1. Create component in `src/components/NewView/`
2. Add route in `src/routes.tsx`
3. Update navigation in `src/components/Navigation/Navigation.tsx`

### Modifying Graph Behavior

Edit `src/utils/graphData.ts` and `src/components/GraphView/GraphVisualization.tsx`:

- Adjust force simulation parameters
- Change node sizing algorithms
- Modify color schemes and interactions

## 📚 Key Concepts

### Digital Garden Philosophy

This project embodies the digital garden movement:

- **Learning in public**: Ideas develop transparently over time
- **Imperfection is okay**: Notes don't need to be polished articles
- **Connections matter**: Relationships between ideas are valuable
- **Growth over perfection**: Content evolves and improves organically

### Non-Linear Navigation

Unlike traditional blogs, this garden offers multiple exploration paths:

- **Graph view**: Discover content through visual connections
- **Timeline view**: Browse chronologically when preferred  
- **Tag networks**: Explore by topic and theme
- **Direct links**: Follow references within content

### Bidirectional Linking

The `[[double-bracket]]` syntax creates two-way connections:

- Forward links: References you make to other content
- Backlinks: Content that references the current page
- Graph connections: Visual representation of relationships

## 🤝 Contributing

This is a personal digital garden, but the architecture and approach can serve as inspiration for your own implementation. Feel free to fork and adapt for your own knowledge garden!

## 📞 Contact

Created and maintained by Shawn Deggans.

---

*This digital garden grows with each new connection and idea. Happy exploring! 🌱*