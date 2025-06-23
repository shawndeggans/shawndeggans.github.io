import { screen } from '@testing-library/react';
import { render } from '../../test-utils/test-utils';
import { TimelineGroup } from './TimelineGroup';
import { TimelineGroup as TimelineGroupType } from '../../types/timeline';
import { getMockTimelineEntry } from '../../test-utils/factories';

// Mock react-router-dom for TimelineEntry navigation
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

describe('TimelineGroup behavior', () => {
  const createMockGroup = (overrides?: Partial<TimelineGroupType>): TimelineGroupType => {
    return {
      period: '2024',
      entries: [
        getMockTimelineEntry({ id: 'entry-1', title: 'First Entry' }),
        getMockTimelineEntry({ id: 'entry-2', title: 'Second Entry' }),
        getMockTimelineEntry({ id: 'entry-3', title: 'Third Entry' }),
      ],
      ...overrides,
    };
  };

  it('should display group period as title', () => {
    const group = createMockGroup({
      period: 'March 2024',
    });

    render(<TimelineGroup group={group} />);

    expect(screen.getByRole('heading', { level: 2, name: 'March 2024' })).toBeInTheDocument();
  });

  it('should display correct entry count for multiple entries', () => {
    const group = createMockGroup({
      entries: [
        getMockTimelineEntry({ id: 'entry-1' }),
        getMockTimelineEntry({ id: 'entry-2' }),
        getMockTimelineEntry({ id: 'entry-3' }),
      ],
    });

    render(<TimelineGroup group={group} />);

    expect(screen.getByText('3 entries')).toBeInTheDocument();
  });

  it('should display correct entry count for single entry', () => {
    const group = createMockGroup({
      entries: [getMockTimelineEntry({ id: 'single-entry' })],
    });

    render(<TimelineGroup group={group} />);

    expect(screen.getByText('1 entry')).toBeInTheDocument();
  });

  it('should display zero entries when no entries provided', () => {
    const group = createMockGroup({
      entries: [],
    });

    render(<TimelineGroup group={group} />);

    expect(screen.getByText('0 entries')).toBeInTheDocument();
  });

  it('should render timeline entries container', () => {
    const group = createMockGroup({
      entries: [
        getMockTimelineEntry({ id: 'entry-1', title: 'First Entry' }),
        getMockTimelineEntry({ id: 'entry-2', title: 'Second Entry' }),
      ],
    });

    const { container } = render(<TimelineGroup group={group} />);

    const entriesContainer = container.querySelector('.timeline-group-entries');
    expect(entriesContainer).toBeInTheDocument();
  });

  it('should render correct number of timeline entries', () => {
    const group = createMockGroup({
      entries: [
        getMockTimelineEntry({ id: 'entry-1' }),
        getMockTimelineEntry({ id: 'entry-2' }),
        getMockTimelineEntry({ id: 'entry-3' }),
      ],
    });

    const { container } = render(<TimelineGroup group={group} />);

    // TimelineEntry components will be rendered but we're testing the container behavior
    const entriesContainer = container.querySelector('.timeline-group-entries');
    expect(entriesContainer?.children).toHaveLength(3);
  });

  it('should have proper semantic structure', () => {
    const group = createMockGroup({
      period: 'Test Period',
    });

    render(<TimelineGroup group={group} />);

    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
  });

  it('should apply correct CSS classes', () => {
    const group = createMockGroup();

    const { container } = render(<TimelineGroup group={group} />);

    expect(container.querySelector('.timeline-group')).toBeInTheDocument();
    expect(container.querySelector('.timeline-group-header')).toBeInTheDocument();
    expect(container.querySelector('.timeline-group-title')).toBeInTheDocument();
    expect(container.querySelector('.timeline-group-count')).toBeInTheDocument();
    expect(container.querySelector('.timeline-group-entries')).toBeInTheDocument();
  });

  it('should handle empty entries list', () => {
    const group = createMockGroup({
      entries: [],
    });

    const { container } = render(<TimelineGroup group={group} />);

    const entriesContainer = container.querySelector('.timeline-group-entries');
    expect(entriesContainer).toBeInTheDocument();
    expect(entriesContainer?.children).toHaveLength(0);
  });

  it('should handle various period formats', () => {
    const testCases = [
      { period: '2024', expected: '2024' },
      { period: 'January 2024', expected: 'January 2024' },
      { period: 'Q1 2024', expected: 'Q1 2024' },
      { period: 'Week of March 15', expected: 'Week of March 15' },
    ];

    testCases.forEach(({ period, expected }) => {
      const group = createMockGroup({ period });
      const { unmount } = render(<TimelineGroup group={group} />);
      
      expect(screen.getByRole('heading', { level: 2, name: expected })).toBeInTheDocument();
      unmount();
    });
  });
});