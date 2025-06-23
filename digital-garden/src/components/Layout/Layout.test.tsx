import { screen } from '@testing-library/react';
import { render } from '../../test-utils/test-utils';
import Layout from './Layout';

describe('Layout behavior', () => {
  it('should render navigation component', () => {
    render(
      <Layout>
        <div>Test content</div>
      </Layout>,
      { initialEntries: ['/'] }
    );
    
    // Navigation should be present (check for brand text)
    expect(screen.getByText('Curiouser and Curiouser!')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Graph' })).toBeInTheDocument();
  });

  it('should render children content in main area', () => {
    render(
      <Layout>
        <div>Test page content</div>
      </Layout>,
      { initialEntries: ['/'] }
    );
    
    expect(screen.getByText('Test page content')).toBeInTheDocument();
    
    const main = screen.getByRole('main');
    expect(main).toHaveClass('layout-content');
    expect(main).toContainElement(screen.getByText('Test page content'));
  });

  it('should show breadcrumbs by default on graph page', () => {
    render(
      <Layout>
        <div>Graph content</div>
      </Layout>,
      { initialEntries: ['/'] }
    );
    
    // On graph page, breadcrumb should show single item "Graph"
    expect(screen.getByText('Graph')).toBeInTheDocument();
  });

  it('should show breadcrumbs by default on timeline page', () => {
    render(
      <Layout>
        <div>Timeline content</div>
      </Layout>,
      { initialEntries: ['/timeline'] }
    );
    
    // On timeline page, breadcrumb should show single item "Timeline"
    expect(screen.getByText('Timeline')).toBeInTheDocument();
  });

  it('should show breadcrumbs with navigation on content page', () => {
    render(
      <Layout>
        <div>Content page</div>
      </Layout>,
      { initialEntries: ['/content/test-article'] }
    );
    
    // Content pages should have breadcrumbs with back navigation
    expect(screen.getByRole('link', { name: 'Graph' })).toBeInTheDocument(); // In breadcrumb
    expect(screen.getByText('test article')).toBeInTheDocument(); // Current page (slug converted)
  });

  it('should hide breadcrumbs when showBreadcrumb is false', () => {
    render(
      <Layout showBreadcrumb={false}>
        <div>Content without breadcrumbs</div>
      </Layout>,
      { initialEntries: ['/'] }
    );
    
    // Navigation should still be there
    expect(screen.getByText('Curiouser and Curiouser!')).toBeInTheDocument();
    
    // But no breadcrumb navigation
    expect(screen.queryByRole('navigation', { name: 'Breadcrumb' })).not.toBeInTheDocument();
  });

  it('should render complex nested content correctly', () => {
    render(
      <Layout>
        <div>
          <h1>Page Title</h1>
          <p>Page description</p>
          <section>
            <h2>Section Title</h2>
            <p>Section content</p>
          </section>
        </div>
      </Layout>,
      { initialEntries: ['/'] }
    );
    
    expect(screen.getByText('Page Title')).toBeInTheDocument();
    expect(screen.getByText('Page description')).toBeInTheDocument();
    expect(screen.getByText('Section Title')).toBeInTheDocument();
    expect(screen.getByText('Section content')).toBeInTheDocument();
  });

  it('should have proper layout structure', () => {
    const { container } = render(
      <Layout>
        <div>Test content</div>
      </Layout>,
      { initialEntries: ['/'] }
    );
    
    const layoutDiv = container.querySelector('.layout');
    expect(layoutDiv).toBeInTheDocument();
    
    const main = screen.getByRole('main');
    expect(main).toHaveClass('layout-content');
  });

  it('should handle content pages with different slugs', () => {
    render(
      <Layout>
        <div>Article content</div>
      </Layout>,
      { initialEntries: ['/content/my-awesome-article'] }
    );
    
    // Breadcrumb should show converted slug
    expect(screen.getByText('my awesome article')).toBeInTheDocument();
    
    // Should have Graph links in both navigation and breadcrumb
    const graphLinks = screen.getAllByRole('link', { name: 'Graph' });
    expect(graphLinks).toHaveLength(2); // Navigation + breadcrumb
  });

  it('should render multiple children correctly', () => {
    render(
      <Layout>
        <header>Page Header</header>
        <section>Main Section</section>
        <footer>Page Footer</footer>
      </Layout>,
      { initialEntries: ['/'] }
    );
    
    expect(screen.getByText('Page Header')).toBeInTheDocument();
    expect(screen.getByText('Main Section')).toBeInTheDocument();
    expect(screen.getByText('Page Footer')).toBeInTheDocument();
  });

  it('should maintain layout structure across different routes', () => {
    const { rerender } = render(
      <Layout>
        <div>Graph content</div>
      </Layout>,
      { initialEntries: ['/'] }
    );
    
    expect(screen.getByText('Graph content')).toBeInTheDocument();
    expect(screen.getByText('Curiouser and Curiouser!')).toBeInTheDocument();
    
    rerender(
      <Layout>
        <div>Timeline content</div>
      </Layout>
    );
    
    expect(screen.getByText('Timeline content')).toBeInTheDocument();
    expect(screen.getByText('Curiouser and Curiouser!')).toBeInTheDocument();
  });
});