import { screen, fireEvent } from '@testing-library/react';
import { render } from '../../test-utils/test-utils';
import Breadcrumb from './Breadcrumb';
import { BreadcrumbItem } from '../../types/navigation';

describe('Breadcrumb behavior', () => {
  const sampleBreadcrumbItems: BreadcrumbItem[] = [
    { label: 'Home', path: '/' },
    { label: 'Content', path: '/content' },
    { label: 'Current Page' }
  ];

  it('should not render when there is only one item', () => {
    const singleItem: BreadcrumbItem[] = [{ label: 'Home', path: '/' }];
    const { container } = render(<Breadcrumb items={singleItem} />);
    
    expect(container.firstChild).toBeNull();
  });

  it('should not render when there are no items', () => {
    const { container } = render(<Breadcrumb items={[]} />);
    
    expect(container.firstChild).toBeNull();
  });

  it('should render all breadcrumb items when multiple items provided', () => {
    render(<Breadcrumb items={sampleBreadcrumbItems} />);
    
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.getByText('Current Page')).toBeInTheDocument();
  });

  it('should render clickable links for non-last items with paths', () => {
    render(<Breadcrumb items={sampleBreadcrumbItems} />);
    
    const homeLink = screen.getByRole('link', { name: 'Home' });
    const contentLink = screen.getByRole('link', { name: 'Content' });
    
    expect(homeLink).toHaveAttribute('href', expect.stringContaining('/'));
    expect(contentLink).toHaveAttribute('href', expect.stringContaining('/content'));
  });

  it('should render the last item as non-clickable current page', () => {
    render(<Breadcrumb items={sampleBreadcrumbItems} />);
    
    const currentPage = screen.getByText('Current Page');
    
    expect(currentPage).toHaveAttribute('aria-current', 'page');
    expect(currentPage.tagName).toBe('SPAN');
    expect(currentPage).toHaveClass('breadcrumb-current');
  });

  it('should display separators between items except after the last', () => {
    render(<Breadcrumb items={sampleBreadcrumbItems} />);
    
    const separators = screen.getAllByText('/');
    expect(separators).toHaveLength(2); // One less than total items
    
    separators.forEach(separator => {
      expect(separator).toHaveAttribute('aria-hidden', 'true');
    });
  });

  it('should navigate when breadcrumb links are clicked', () => {
    render(<Breadcrumb items={sampleBreadcrumbItems} />, { initialEntries: ['/current'] });
    
    const homeLink = screen.getByRole('link', { name: 'Home' });
    fireEvent.click(homeLink);
    
    // Since we're using MemoryRouter, we can't check URL directly,
    // but we can verify the link has the correct href
    expect(homeLink).toHaveAttribute('href', expect.stringContaining('/'));
  });

  it('should apply custom className when provided', () => {
    const { container } = render(<Breadcrumb items={sampleBreadcrumbItems} className="custom-breadcrumb" />);
    
    const breadcrumbElement = container.querySelector('.breadcrumb');
    expect(breadcrumbElement).toHaveClass('custom-breadcrumb');
  });

  it('should handle items without paths correctly', () => {
    const itemsWithoutPaths: BreadcrumbItem[] = [
      { label: 'Home', path: '/' },
      { label: 'Section' }, // No path
      { label: 'Current Page' }
    ];
    
    render(<Breadcrumb items={itemsWithoutPaths} />);
    
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    
    // Section should not be a link since it has no path, and gets breadcrumb-current class
    const sectionElement = screen.getByText('Section');
    expect(sectionElement.tagName).toBe('SPAN');
    expect(sectionElement).toHaveClass('breadcrumb-current');
  });

  it('should provide proper accessibility attributes', () => {
    render(<Breadcrumb items={sampleBreadcrumbItems} />);
    
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveAttribute('aria-label', 'Breadcrumb');
    
    const currentPage = screen.getByText('Current Page');
    expect(currentPage).toHaveAttribute('aria-current', 'page');
  });

  it('should render with two items correctly', () => {
    const twoItems: BreadcrumbItem[] = [
      { label: 'Home', path: '/' },
      { label: 'Current' }
    ];
    
    render(<Breadcrumb items={twoItems} />);
    
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getByText('Current')).toHaveAttribute('aria-current', 'page');
    expect(screen.getAllByText('/')).toHaveLength(1);
  });

  it('should handle many breadcrumb items', () => {
    const manyItems: BreadcrumbItem[] = [
      { label: 'Home', path: '/' },
      { label: 'Category', path: '/category' },
      { label: 'Subcategory', path: '/category/sub' },
      { label: 'Item', path: '/category/sub/item' },
      { label: 'Current Page' }
    ];
    
    render(<Breadcrumb items={manyItems} />);
    
    expect(screen.getAllByRole('link')).toHaveLength(4); // All except last
    expect(screen.getAllByText('/')).toHaveLength(4); // One less than total
    expect(screen.getByText('Current Page')).toHaveAttribute('aria-current', 'page');
  });
});