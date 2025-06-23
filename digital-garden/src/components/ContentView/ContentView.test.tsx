import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../test-utils/test-utils';
import ContentView from './ContentView';

describe('ContentView behavior', () => {
  const mockSlug = 'test-content';
  const mockContent = `---
title: Test Content
date: 2024-01-01
tags: [test, sample]
---

# Test Content

This is test content with a [[linked-content]] reference.`;

  beforeEach(() => {
    server.use(
      http.get(`/content/${mockSlug}.md`, () => {
        return HttpResponse.text(mockContent);
      })
    );
  });

  it('should display loading state while fetching content', () => {
    render(<ContentView />, { 
      initialEntries: [`/content/${mockSlug}`] 
    });
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should display content after loading', async () => {
    render(<ContentView />, { 
      initialEntries: [`/content/${mockSlug}`] 
    });
    
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });
    
    expect(screen.getByRole('heading', { name: 'Test Content' })).toBeInTheDocument();
    expect(screen.getByText(/This is test content/)).toBeInTheDocument();
  });

  it('should display error when content fails to load', async () => {
    server.use(
      http.get(`/content/${mockSlug}.md`, () => {
        return HttpResponse.error();
      })
    );

    render(<ContentView />, { 
      initialEntries: [`/content/${mockSlug}`] 
    });
    
    await waitFor(() => {
      expect(screen.getByText(/error loading content/i)).toBeInTheDocument();
    });
  });

  it('should display 404 when content is not found', async () => {
    server.use(
      http.get(`/content/${mockSlug}.md`, () => {
        return new HttpResponse(null, { status: 404 });
      })
    );

    render(<ContentView />, { 
      initialEntries: [`/content/${mockSlug}`] 
    });
    
    await waitFor(() => {
      expect(screen.getByText(/content not found/i)).toBeInTheDocument();
    });
  });

  it('should render markdown content correctly', async () => {
    render(<ContentView />, { 
      initialEntries: [`/content/${mockSlug}`] 
    });
    
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });
    
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Test Content');
  });

  it('should display content metadata', async () => {
    render(<ContentView />, { 
      initialEntries: [`/content/${mockSlug}`] 
    });
    
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });
    
    expect(screen.getByText('January 1, 2024')).toBeInTheDocument();
    expect(screen.getByText('#test')).toBeInTheDocument();
    expect(screen.getByText('#sample')).toBeInTheDocument();
  });

  it('should render internal links as clickable', async () => {
    render(<ContentView />, { 
      initialEntries: [`/content/${mockSlug}`] 
    });
    
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });
    
    const link = screen.getByRole('link', { name: 'linked-content' });
    expect(link).toHaveAttribute('href', expect.stringContaining('/content/linked-content'));
  });

  it('should display backlinks section when content has inbound links', async () => {
    server.use(
      http.get('/content/index.json', () => {
        return HttpResponse.json([
          {
            slug: 'linking-content',
            title: 'Linking Content',
            date: '2024-01-02',
            tags: ['linker']
          }
        ]);
      }),
      http.get('/content/linking-content.md', () => {
        return HttpResponse.text(`---
title: Linking Content
---
This content links to [[test-content]]`);
      })
    );

    render(<ContentView />, { 
      initialEntries: [`/content/${mockSlug}`] 
    });
    
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });
    
    expect(screen.getByText(/backlinks/i)).toBeInTheDocument();
    expect(screen.getByText('Linking Content')).toBeInTheDocument();
  });

  it('should navigate to tag page when tag is clicked', async () => {
    render(<ContentView />, { 
      initialEntries: [`/content/${mockSlug}`] 
    });
    
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });
    
    const tagLink = screen.getByText('#test');
    await userEvent.click(tagLink);
    
    expect(window.location.pathname).toContain('/tags/test');
  });

  it('should show related content based on shared tags', async () => {
    server.use(
      http.get('/content/index.json', () => {
        return HttpResponse.json([
          {
            slug: 'related-content',
            title: 'Related Content',
            date: '2024-01-03',
            tags: ['test', 'related']
          },
          {
            slug: mockSlug,
            title: 'Test Content',
            date: '2024-01-01',
            tags: ['test', 'sample']
          }
        ]);
      })
    );

    render(<ContentView />, { 
      initialEntries: [`/content/${mockSlug}`] 
    });
    
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });
    
    expect(screen.getByText(/related content/i)).toBeInTheDocument();
    expect(screen.getByText('Related Content')).toBeInTheDocument();
  });
});