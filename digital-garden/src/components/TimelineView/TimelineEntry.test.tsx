import { screen, fireEvent } from '@testing-library/react';
import { render } from '../../test-utils/test-utils';
import { TimelineEntry } from './TimelineEntry';
import { getMockTimelineEntry } from '../../test-utils/factories';

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('TimelineEntry behavior', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display entry title and formatted date', () => {
    const entry = getMockTimelineEntry({
      title: 'My Test Entry',
      date: '2024-03-15',
    });

    render(<TimelineEntry entry={entry} />);

    expect(screen.getByText('My Test Entry')).toBeInTheDocument();
    expect(screen.getByText('Mar 14, 2024')).toBeInTheDocument();
  });

  it('should display excerpt when provided', () => {
    const entry = getMockTimelineEntry({
      excerpt: 'This is an interesting excerpt about the content.',
    });

    render(<TimelineEntry entry={entry} />);

    expect(screen.getByText('This is an interesting excerpt about the content.')).toBeInTheDocument();
  });

  it('should not display excerpt when not provided', () => {
    const entry = getMockTimelineEntry({
      excerpt: undefined,
    });

    const { container } = render(<TimelineEntry entry={entry} />);
    
    const excerptElement = container.querySelector('.timeline-entry-excerpt');
    expect(excerptElement).not.toBeInTheDocument();
  });

  it('should display reading time when provided', () => {
    const entry = getMockTimelineEntry({
      readingTime: 7,
    });

    render(<TimelineEntry entry={entry} />);

    expect(screen.getByText('7 min read')).toBeInTheDocument();
  });

  it('should display word count when provided', () => {
    const entry = getMockTimelineEntry({
      wordCount: 1500,
    });

    render(<TimelineEntry entry={entry} />);

    expect(screen.getByText('1,500 words')).toBeInTheDocument();
  });

  it('should not display reading time or word count when not provided', () => {
    const entry = getMockTimelineEntry({
      readingTime: undefined,
      wordCount: undefined,
    });

    render(<TimelineEntry entry={entry} />);

    expect(screen.queryByText(/min read/)).not.toBeInTheDocument();
    expect(screen.queryByText(/words/)).not.toBeInTheDocument();
  });

  it('should display tags with hash symbols', () => {
    const entry = getMockTimelineEntry({
      tags: ['react', 'typescript', 'testing'],
    });

    render(<TimelineEntry entry={entry} />);

    expect(screen.getByText('#react')).toBeInTheDocument();
    expect(screen.getByText('#typescript')).toBeInTheDocument();
    expect(screen.getByText('#testing')).toBeInTheDocument();
  });

  it('should not display tags section when no tags provided', () => {
    const entry = getMockTimelineEntry({
      tags: [],
    });

    const { container } = render(<TimelineEntry entry={entry} />);
    
    const tagsElement = container.querySelector('.timeline-entry-tags');
    expect(tagsElement).not.toBeInTheDocument();
  });

  it('should navigate to content when clicked', () => {
    const entry = getMockTimelineEntry({
      id: 'my-content-id',
    });

    render(<TimelineEntry entry={entry} />);

    const contentArea = screen.getByText(entry.title).closest('.timeline-entry-content');
    fireEvent.click(contentArea!);

    expect(mockNavigate).toHaveBeenCalledWith('/content/my-content-id');
  });

  it('should apply first class when isFirst is true', () => {
    const entry = getMockTimelineEntry();

    const { container } = render(<TimelineEntry entry={entry} isFirst={true} />);
    
    const entryElement = container.querySelector('.timeline-entry');
    expect(entryElement).toHaveClass('first');
  });

  it('should apply last class when isLast is true', () => {
    const entry = getMockTimelineEntry();

    const { container } = render(<TimelineEntry entry={entry} isLast={true} />);
    
    const entryElement = container.querySelector('.timeline-entry');
    expect(entryElement).toHaveClass('last');
  });

  it('should not show timeline line when isLast is true', () => {
    const entry = getMockTimelineEntry();

    const { container } = render(<TimelineEntry entry={entry} isLast={true} />);
    
    const lineElement = container.querySelector('.timeline-entry-line');
    expect(lineElement).not.toBeInTheDocument();
  });

  it('should show timeline line when isLast is false', () => {
    const entry = getMockTimelineEntry();

    const { container } = render(<TimelineEntry entry={entry} isLast={false} />);
    
    const lineElement = container.querySelector('.timeline-entry-line');
    expect(lineElement).toBeInTheDocument();
  });

  it('should have proper semantic structure', () => {
    const entry = getMockTimelineEntry({
      title: 'Accessible Entry',
    });

    render(<TimelineEntry entry={entry} />);

    expect(screen.getByRole('heading', { level: 3, name: 'Accessible Entry' })).toBeInTheDocument();
  });

  it('should format dates correctly', () => {
    const testCases = [
      { date: '2024-01-02', expected: 'Jan 1, 2024' },
      { date: '2024-12-26', expected: 'Dec 25, 2024' },
      { date: '2023-06-16', expected: 'Jun 15, 2023' },
    ];

    testCases.forEach(({ date, expected }) => {
      const entry = getMockTimelineEntry({ date });
      const { unmount } = render(<TimelineEntry entry={entry} />);
      
      expect(screen.getByText(expected)).toBeInTheDocument();
      unmount();
    });
  });

  it('should handle entries with all optional fields', () => {
    const entry = getMockTimelineEntry({
      title: 'Complete Entry',
      date: '2024-01-01',
      excerpt: 'Full excerpt text',
      readingTime: 10,
      wordCount: 2500,
      tags: ['comprehensive', 'test'],
    });

    render(<TimelineEntry entry={entry} />);

    expect(screen.getByText('Complete Entry')).toBeInTheDocument();
    expect(screen.getByText('Full excerpt text')).toBeInTheDocument();
    expect(screen.getByText('10 min read')).toBeInTheDocument();
    expect(screen.getByText('2,500 words')).toBeInTheDocument();
    expect(screen.getByText('#comprehensive')).toBeInTheDocument();
    expect(screen.getByText('#test')).toBeInTheDocument();
  });

  it('should handle entries with minimal fields', () => {
    const entry = getMockTimelineEntry({
      title: 'Minimal Entry',
      date: '2024-01-02',
      tags: [],
      excerpt: undefined,
      readingTime: undefined,
      wordCount: undefined,
    });

    render(<TimelineEntry entry={entry} />);

    expect(screen.getByText('Minimal Entry')).toBeInTheDocument();
    expect(screen.getByText('Jan 1, 2024')).toBeInTheDocument();
    expect(screen.queryByText(/min read/)).not.toBeInTheDocument();
    expect(screen.queryByText(/words/)).not.toBeInTheDocument();
  });
});