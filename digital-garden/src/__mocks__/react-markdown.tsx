import React from 'react';

// Mock implementation of ReactMarkdown for testing
const ReactMarkdown: React.FC<{ children: string; remarkPlugins?: unknown[] }> = ({ children }) => {
  // Simple mock that renders markdown as HTML-like content for tests
  return <div data-testid="markdown-content">{children}</div>;
};

export default ReactMarkdown;