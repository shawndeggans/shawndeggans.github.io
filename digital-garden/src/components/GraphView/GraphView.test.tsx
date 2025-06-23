import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../test-utils/test-utils';
import { GraphView } from './GraphView';
import { server } from '../../mocks/server';
import { http, HttpResponse } from 'msw';

describe('GraphView behavior', () => {
  it('should display loading state while fetching content', () => {
    render(<GraphView />);
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should display graph visualization after content loads', async () => {
    render(<GraphView />);
    
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });
    
    expect(screen.getByTestId('graph-container')).toBeInTheDocument();
  });

  it('should display error message when content fails to load', async () => {
    server.use(
      http.get('/content/index.json', () => {
        return HttpResponse.error();
      })
    );

    render(<GraphView />);
    
    await waitFor(() => {
      expect(screen.getByText(/error loading content/i)).toBeInTheDocument();
    });
  });

  it('should navigate to content when node is clicked', async () => {
    const mockContent = [
      {
        slug: 'test-content',
        title: 'Test Content',
        date: '2024-01-01',
        tags: ['test'],
        description: 'Test description'
      }
    ];

    server.use(
      http.get('/content/index.json', () => {
        return HttpResponse.json(mockContent);
      })
    );

    render(<GraphView />, { initialEntries: ['/graph'] });
    
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    const node = await screen.findByTestId('graph-node-test-content');
    await userEvent.click(node);

    await waitFor(() => {
      expect(window.location.pathname).toContain('/content/test-content');
    });
  });

  it('should show node details on hover', async () => {
    const mockContent = [
      {
        slug: 'hover-test',
        title: 'Hover Test Content',
        date: '2024-01-01',
        tags: ['hover', 'test'],
        description: 'Content for hover testing'
      }
    ];

    server.use(
      http.get('/content/index.json', () => {
        return HttpResponse.json(mockContent);
      })
    );

    render(<GraphView />);
    
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    const node = await screen.findByTestId('graph-node-hover-test');
    await userEvent.hover(node);

    expect(screen.getByText('Hover Test Content')).toBeInTheDocument();
    expect(screen.getByText('Tags: hover, test')).toBeInTheDocument();
  });

  it('should display connections between linked content', async () => {
    const mockContent = [
      {
        slug: 'content-a',
        title: 'Content A',
        date: '2024-01-01',
        tags: ['test'],
        description: 'First content'
      },
      {
        slug: 'content-b',
        title: 'Content B',
        date: '2024-01-02',
        tags: ['test'],
        description: 'Second content'
      }
    ];

    server.use(
      http.get('/content/index.json', () => {
        return HttpResponse.json(mockContent);
      }),
      http.get('/content/content-a.md', () => {
        return HttpResponse.text(`---
title: Content A
---
This links to [[content-b]]`);
      })
    );

    render(<GraphView />);
    
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    const linkElement = await screen.findByTestId('graph-link-content-a-content-b');
    expect(linkElement).toBeInTheDocument();
  });

  it('should resize graph when window resizes', async () => {
    render(<GraphView />);
    
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    const graphContainer = screen.getByTestId('graph-container');
    const initialWidth = graphContainer.getBoundingClientRect().width;

    global.innerWidth = 1200;
    global.dispatchEvent(new Event('resize'));

    await waitFor(() => {
      const newWidth = graphContainer.getBoundingClientRect().width;
      expect(newWidth).not.toBe(initialWidth);
    });
  });

  it('should filter nodes based on search input', async () => {
    const mockContent = [
      {
        slug: 'searchable-content',
        title: 'Searchable Content',
        date: '2024-01-01',
        tags: ['findme'],
        description: 'Content that can be searched'
      },
      {
        slug: 'other-content',
        title: 'Other Content',
        date: '2024-01-02',
        tags: ['different'],
        description: 'Different content'
      }
    ];

    server.use(
      http.get('/content/index.json', () => {
        return HttpResponse.json(mockContent);
      })
    );

    render(<GraphView />);
    
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search/i);
    await userEvent.type(searchInput, 'findme');

    await waitFor(() => {
      expect(screen.getByTestId('graph-node-searchable-content')).toBeInTheDocument();
    });
    
    expect(screen.queryByTestId('graph-node-other-content')).not.toBeInTheDocument();
  });
});