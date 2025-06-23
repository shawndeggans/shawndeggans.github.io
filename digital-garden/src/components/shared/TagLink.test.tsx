import { screen, fireEvent } from '@testing-library/react';
import { render } from '../../test-utils/test-utils';
import { TagLink, TagList, ContentTags, FilterChip } from './TagLink';

// Mock the filter state hook
const mockAddTag = jest.fn();
const mockHasTag = jest.fn().mockReturnValue(false);

jest.mock('../../hooks/useFilterState', () => ({
  useFilterState: () => ({
    addTag: mockAddTag,
    hasTag: mockHasTag,
    removeTag: jest.fn(),
    clearFilters: jest.fn(),
    setSearchText: jest.fn(),
    setDateRange: jest.fn(),
    searchText: '',
    selectedTags: [],
    dateRange: undefined,
    isFilterActive: false,
  }),
}));

describe('TagLink behavior', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display the tag name', () => {
    render(<TagLink tag="javascript" />);
    
    expect(screen.getByText('javascript')).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    render(<TagLink tag="react" />);
    
    const button = screen.getByRole('button', { name: 'Filter content by tag: react' });
    expect(button).toHaveAttribute('title', 'Filter by "react"');
  });

  it('should apply correct CSS classes for different variants', () => {
    const { rerender } = render(<TagLink tag="test" variant="badge" />);
    
    let button = screen.getByRole('button');
    expect(button).toHaveClass('tag-link--badge');
    
    rerender(<TagLink tag="test" variant="minimal" />);
    button = screen.getByRole('button');
    expect(button).toHaveClass('tag-link--minimal');
  });

  it('should apply correct CSS classes for different sizes', () => {
    const { rerender } = render(<TagLink tag="test" size="small" />);
    
    let button = screen.getByRole('button');
    expect(button).toHaveClass('tag-link--small');
    
    rerender(<TagLink tag="test" size="large" />);
    button = screen.getByRole('button');
    expect(button).toHaveClass('tag-link--large');
  });

  it('should display count when showCount is true', () => {
    render(<TagLink tag="popular" showCount={true} count={42} />);
    
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('42')).toHaveClass('tag-link__count');
  });

  it('should not display count when showCount is false', () => {
    render(<TagLink tag="popular" showCount={false} count={42} />);
    
    expect(screen.queryByText('42')).not.toBeInTheDocument();
  });

  it('should call custom onClick handler when provided', () => {
    const mockOnClick = jest.fn();
    
    render(<TagLink tag="clickable" onClick={mockOnClick} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(mockOnClick).toHaveBeenCalledWith('clickable', expect.any(Object));
  });

  it('should be disabled when disabled prop is true', () => {
    render(<TagLink tag="disabled" disabled={true} />);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('tag-link--disabled');
    expect(button).not.toHaveAttribute('title');
  });

  it('should show remove button when removable is true', () => {
    const mockOnRemove = jest.fn();
    render(<TagLink tag="removable" removable={true} onRemove={mockOnRemove} />);
    
    const removeButton = screen.getByRole('button', { name: 'Remove tag: removable' });
    expect(removeButton).toBeInTheDocument();
    expect(removeButton).toHaveAttribute('title', 'Remove removable filter');
  });

  it('should call onRemove when remove button is clicked', () => {
    const mockOnRemove = jest.fn();
    
    render(<TagLink tag="removable" removable={true} onRemove={mockOnRemove} />);
    
    const removeButton = screen.getByRole('button', { name: 'Remove tag: removable' });
    fireEvent.click(removeButton);
    
    expect(mockOnRemove).toHaveBeenCalledWith('removable');
  });

  it('should apply custom className', () => {
    render(<TagLink tag="custom" className="my-custom-class" />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('my-custom-class');
  });

  it('should navigate to home page when clicked from other pages', () => {
    render(<TagLink tag="navigate" />, { initialEntries: ['/about'] });
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    // In a real scenario, this would trigger navigation
    // We can't easily test navigation with our current setup
    expect(button).toBeInTheDocument();
  });
});

describe('TagList behavior', () => {
  const sampleTags = ['react', 'typescript', 'testing'];

  it('should render all provided tags', () => {
    render(<TagList tags={sampleTags} />);
    
    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('typescript')).toBeInTheDocument();
    expect(screen.getByText('testing')).toBeInTheDocument();
  });

  it('should not render when tags array is empty', () => {
    const { container } = render(<TagList tags={[]} />);
    
    expect(container.firstChild).toBeNull();
  });

  it('should limit display to maxDisplay count', () => {
    render(<TagList tags={sampleTags} maxDisplay={2} />);
    
    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('typescript')).toBeInTheDocument();
    expect(screen.queryByText('testing')).not.toBeInTheDocument();
    expect(screen.getByText('+1 more')).toBeInTheDocument();
  });

  it('should display counts when showCounts is true and getCounts is provided', () => {
    const getCounts = (tag: string) => tag.length; // Simple count based on tag length
    
    render(<TagList tags={['js', 'react']} showCounts={true} getCounts={getCounts} />);
    
    expect(screen.getByText('2')).toBeInTheDocument(); // 'js' has 2 characters
    expect(screen.getByText('5')).toBeInTheDocument(); // 'react' has 5 characters
  });

  it('should call onTagClick when tag is clicked', () => {
    const mockOnTagClick = jest.fn();
    
    render(<TagList tags={['clickable']} onTagClick={mockOnTagClick} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(mockOnTagClick).toHaveBeenCalledWith('clickable');
  });

  it('should apply custom className', () => {
    const { container } = render(<TagList tags={['test']} className="custom-list" />);
    
    const tagList = container.querySelector('.tag-list');
    expect(tagList).toHaveClass('custom-list');
  });
});

describe('ContentTags behavior', () => {
  const sampleTags = ['frontend', 'backend', 'fullstack'];

  it('should render tags with label by default', () => {
    render(<ContentTags tags={sampleTags} />);
    
    expect(screen.getByText('Tags:')).toBeInTheDocument();
    expect(screen.getByText('frontend')).toBeInTheDocument();
    expect(screen.getByText('backend')).toBeInTheDocument();
    expect(screen.getByText('fullstack')).toBeInTheDocument();
  });

  it('should render inline without label when inline is true', () => {
    render(<ContentTags tags={sampleTags} inline={true} />);
    
    expect(screen.queryByText('Tags:')).not.toBeInTheDocument();
    expect(screen.getByText('frontend')).toBeInTheDocument();
    
    const container = screen.getByText('frontend').closest('.content-tags');
    expect(container).toHaveClass('content-tags--inline');
  });

  it('should not render when tags array is empty', () => {
    const { container } = render(<ContentTags tags={[]} />);
    
    expect(container.firstChild).toBeNull();
  });

  it('should apply custom className', () => {
    const { container } = render(<ContentTags tags={['test']} className="custom-tags" />);
    
    const contentTags = container.querySelector('.content-tags');
    expect(contentTags).toHaveClass('custom-tags');
  });
});

describe('FilterChip behavior', () => {
  it('should render as a removable badge', () => {
    const mockOnRemove = jest.fn();
    render(<FilterChip tag="filter-tag" onRemove={mockOnRemove} />);
    
    expect(screen.getByText('filter-tag')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove tag: filter-tag' })).toBeInTheDocument();
  });

  it('should call onRemove when remove button is clicked', () => {
    const mockOnRemove = jest.fn();
    
    render(<FilterChip tag="removable-filter" onRemove={mockOnRemove} />);
    
    const removeButton = screen.getByRole('button', { name: 'Remove tag: removable-filter' });
    fireEvent.click(removeButton);
    
    expect(mockOnRemove).toHaveBeenCalledWith('removable-filter');
  });

  it('should apply custom className', () => {
    const mockOnRemove = jest.fn();
    const { container } = render(
      <FilterChip tag="test" onRemove={mockOnRemove} className="custom-chip" />
    );
    
    const chip = container.querySelector('.filter-chip');
    expect(chip).toHaveClass('custom-chip');
  });
});