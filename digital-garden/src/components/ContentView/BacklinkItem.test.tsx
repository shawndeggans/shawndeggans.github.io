import { screen, fireEvent, waitFor } from '@testing-library/react';
import { render } from '../../test-utils/test-utils';
import { BacklinkItem } from './BacklinkItem';
import { getMockBacklinkInfo, getMockParsedContent } from '../../test-utils/factories';

// Mock the BacklinkPreview component
jest.mock('./BacklinkPreview', () => ({
  __esModule: true,
  default: ({ content, position, onClose }: { content: any; position: any; onClose: () => void }) => (
    <div data-testid="backlink-preview" data-position={`${position.x},${position.y}`}>
      <button onClick={onClose}>Close Preview</button>
      <div>Preview: {content.metadata.title}</div>
    </div>
  ),
}));

describe('BacklinkItem behavior', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display backlink title as a link', () => {
    const backlink = getMockBacklinkInfo({
      title: 'Related Article',
      slug: 'related-article',
    });

    render(<BacklinkItem backlink={backlink} />);

    const titleLink = screen.getByRole('link', { name: 'Related Article' });
    expect(titleLink).toBeInTheDocument();
    expect(titleLink).toHaveAttribute('href', expect.stringContaining('/content/related-article'));
  });

  it('should display backlink excerpt', () => {
    const backlink = getMockBacklinkInfo({
      excerpt: 'This is an interesting excerpt from the linked content.',
    });

    render(<BacklinkItem backlink={backlink} />);

    expect(screen.getByText('This is an interesting excerpt from the linked content.')).toBeInTheDocument();
  });

  it('should display formatted date', () => {
    const backlink = getMockBacklinkInfo({
      date: new Date('2024-03-15'),
    });

    render(<BacklinkItem backlink={backlink} />);

    expect(screen.getByText('Mar 14, 2024')).toBeInTheDocument();
  });

  it('should not display context by default', () => {
    const backlink = getMockBacklinkInfo({
      contextSnippet: 'Here is some context around the link.',
    });

    render(<BacklinkItem backlink={backlink} />);

    expect(screen.queryByText('Context:')).not.toBeInTheDocument();
    expect(screen.queryByText(/Here is some context/)).not.toBeInTheDocument();
  });

  it('should display context when showContext is true', () => {
    const backlink = getMockBacklinkInfo({
      contextSnippet: 'Here is some context around the link.',
    });

    render(<BacklinkItem backlink={backlink} showContext={true} />);

    expect(screen.getByText('Context:')).toBeInTheDocument();
    expect(screen.getByText('...Here is some context around the link...', { exact: false })).toBeInTheDocument();
  });

  it('should not display context section when contextSnippet is not provided', () => {
    const backlink = getMockBacklinkInfo({
      contextSnippet: undefined,
    });

    render(<BacklinkItem backlink={backlink} showContext={true} />);

    expect(screen.queryByText('Context:')).not.toBeInTheDocument();
  });

  it('should display tags when provided', () => {
    const backlink = getMockBacklinkInfo({
      tags: ['javascript', 'react', 'testing'],
    });

    render(<BacklinkItem backlink={backlink} />);

    expect(screen.getByText('javascript')).toBeInTheDocument();
    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('testing')).toBeInTheDocument();
  });

  it('should not display tags section when no tags provided', () => {
    const backlink = getMockBacklinkInfo({
      tags: [],
    });

    const { container } = render(<BacklinkItem backlink={backlink} />);

    const tagsSection = container.querySelector('.backlink-item-tags');
    expect(tagsSection).not.toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const backlink = getMockBacklinkInfo();

    const { container } = render(<BacklinkItem backlink={backlink} className="custom-backlink" />);

    const backlinkItem = container.querySelector('.backlink-item');
    expect(backlinkItem).toHaveClass('custom-backlink');
  });

  it('should not show preview initially', () => {
    const backlink = getMockBacklinkInfo();
    const content = getMockParsedContent();

    render(<BacklinkItem backlink={backlink} content={content} />);

    expect(screen.queryByTestId('backlink-preview')).not.toBeInTheDocument();
  });

  it('should show preview on mouse enter with content', async () => {
    const backlink = getMockBacklinkInfo();
    const content = getMockParsedContent({ metadata: { ...getMockParsedContent().metadata, title: 'Preview Content' } });

    const { container } = render(<BacklinkItem backlink={backlink} content={content} />);

    const backlinkItem = container.querySelector('.backlink-item')!;
    fireEvent.mouseEnter(backlinkItem);

    // Wait for the 500ms delay
    await waitFor(() => {
      expect(screen.getByTestId('backlink-preview')).toBeInTheDocument();
    }, { timeout: 600 });

    expect(screen.getByText('Preview: Preview Content')).toBeInTheDocument();
  });

  it('should hide preview on mouse leave', async () => {
    const backlink = getMockBacklinkInfo();
    const content = getMockParsedContent();

    const { container } = render(<BacklinkItem backlink={backlink} content={content} />);

    const backlinkItem = container.querySelector('.backlink-item')!;
    
    // Enter to show preview
    fireEvent.mouseEnter(backlinkItem);
    
    // Wait for preview to appear
    await waitFor(() => {
      expect(screen.getByTestId('backlink-preview')).toBeInTheDocument();
    }, { timeout: 600 });

    // Leave to hide preview
    fireEvent.mouseLeave(backlinkItem);

    await waitFor(() => {
      expect(screen.queryByTestId('backlink-preview')).not.toBeInTheDocument();
    });
  });

  it('should not show preview without content', async () => {
    const backlink = getMockBacklinkInfo();

    const { container } = render(<BacklinkItem backlink={backlink} />);

    const backlinkItem = container.querySelector('.backlink-item')!;
    fireEvent.mouseEnter(backlinkItem);

    // Wait longer than the delay to ensure no preview appears
    await new Promise(resolve => setTimeout(resolve, 600));

    expect(screen.queryByTestId('backlink-preview')).not.toBeInTheDocument();
  });

  it('should handle preview close action', async () => {
    const backlink = getMockBacklinkInfo();
    const content = getMockParsedContent();

    const { container } = render(<BacklinkItem backlink={backlink} content={content} />);

    const backlinkItem = container.querySelector('.backlink-item')!;
    fireEvent.mouseEnter(backlinkItem);

    // Wait for preview to appear
    await waitFor(() => {
      expect(screen.getByTestId('backlink-preview')).toBeInTheDocument();
    }, { timeout: 600 });

    // Close the preview
    fireEvent.click(screen.getByText('Close Preview'));

    await waitFor(() => {
      expect(screen.queryByTestId('backlink-preview')).not.toBeInTheDocument();
    });
  });

  it('should have proper semantic structure', () => {
    const backlink = getMockBacklinkInfo({
      title: 'Accessible Link',
    });

    render(<BacklinkItem backlink={backlink} />);

    expect(screen.getByRole('link', { name: 'Accessible Link' })).toBeInTheDocument();
  });

  it('should format different dates correctly', () => {
    const testCases = [
      { date: new Date('2024-01-01'), expected: 'Dec 31, 2023' },
      { date: new Date('2024-12-25'), expected: 'Dec 24, 2024' },
      { date: new Date('2023-06-15'), expected: 'Jun 14, 2023' },
    ];

    testCases.forEach(({ date, expected }) => {
      const backlink = getMockBacklinkInfo({ date });
      const { unmount } = render(<BacklinkItem backlink={backlink} />);
      
      expect(screen.getByText(expected)).toBeInTheDocument();
      unmount();
    });
  });

  it('should handle all optional features together', () => {
    const backlink = getMockBacklinkInfo({
      title: 'Complete Backlink',
      excerpt: 'Full excerpt text',
      tags: ['complete', 'test'],
      contextSnippet: 'Context around the link',
    });
    const content = getMockParsedContent();

    render(<BacklinkItem backlink={backlink} content={content} showContext={true} className="full-test" />);

    expect(screen.getByRole('link', { name: 'Complete Backlink' })).toBeInTheDocument();
    expect(screen.getByText('Full excerpt text')).toBeInTheDocument();
    expect(screen.getByText('complete')).toBeInTheDocument();
    expect(screen.getByText('test')).toBeInTheDocument();
    expect(screen.getByText('Context:')).toBeInTheDocument();
  });
});