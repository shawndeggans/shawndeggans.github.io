# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Digital Garden** - a React-based personal knowledge management system that visualizes connections between content, tags, and ideas through interactive graph visualization. The application uses React 19.1.0 with TypeScript, D3.js for data visualization, and is deployed to GitHub Pages.

## Development Commands

### Core Development
- `npm start` - Run development server (opens http://localhost:3000)
- `npm test` - Run tests in interactive watch mode
- `npm run build` - Build for production
- `npm run build:ci` - Build for CI (disables warnings as errors)

### Deployment
- `npm run predeploy` - Runs build before deploy
- `npm run deploy` - Deploy to GitHub Pages using gh-pages

### Testing
- Tests use React Testing Library + Jest
- Test files: `*.test.tsx` (e.g., `src/App.test.tsx`)
- Setup: `src/setupTests.ts` configures Jest DOM matchers

## Architecture

### Core Application Structure
```
src/
├── components/           # Feature-based React components
│   ├── GraphView/       # Main D3.js graph visualization
│   ├── ContentView/     # Individual content display with backlinks
│   ├── TagGraphView/    # Tag-specific graph visualization  
│   ├── TimelineView/    # Chronological content timeline
│   └── Navigation/      # Navigation and breadcrumb components
├── hooks/               # Custom React hooks
│   ├── useContent.ts    # Content loading and processing
│   ├── useBacklinks.ts  # Backlink data management
│   └── useViewState.ts  # Navigation state management
├── types/               # TypeScript definitions
├── utils/               # Data processing utilities
└── styles/              # CSS styling
```

### Content System
- Content stored as Markdown files in `public/content/`
- Content registry: `public/content/index.json`
- Frontmatter metadata for tags, dates, descriptions
- Internal linking via `[[link-syntax]]`
- Automatic backlink detection and visualization

### Key Technologies
- **React Router 6.26.2** with HashRouter (GitHub Pages compatibility)
- **D3.js 7.9.0** for force-directed graph visualization
- **react-markdown** with GitHub Flavored Markdown support
- **TypeScript** with strict configuration

## Future Architecture (Per PRD)

The codebase is planned for significant simplification to create a unified exploration interface:

### Planned Changes
- **Single unified graph** combining content and tag connections
- **Global filtering** affecting both graph and timeline views
- **Automatic content discovery** eliminating manual index.json maintenance
- **Two-page navigation**: Home (graph + timeline + filter) + Content pages
- **Universal tag linking** - all tags clickable for instant filtering

### Migration Phases
1. Content discovery automation (build-time file scanning)
2. Graph unification (merge existing graph components)  
3. Filter integration (global filter affecting all views)
4. Navigation simplification (remove traditional menus)
5. Enhanced tag interaction (clickable tags everywhere)

## Development Guidelines

### Code Patterns
- Follow existing React patterns and component structure
- Use TypeScript interfaces for all data structures
- Implement custom hooks for data management and state
- Use D3.js for visualization with React integration patterns

### Content Processing
- Content files must have frontmatter with metadata
- Internal links use `[[filename]]` syntax without .md extension
- Tags are arrays in frontmatter: `tags: [tag1, tag2]`
- Automatic processing of markdown to extract connections

### Performance Considerations
- Graph visualization handles 200+ nodes efficiently
- Memoization for expensive data processing operations
- Responsive design supporting full-width graph displays
- Force simulation optimized for network visualization

## GitHub Pages Deployment

- Deployed to: https://shawndeggans.github.io/
- Uses HashRouter for client-side routing compatibility
- Build process: `npm run build` → `npm run deploy`
- GitHub Actions workflow handles automated deployment