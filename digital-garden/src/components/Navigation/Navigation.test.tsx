import { screen, fireEvent } from '@testing-library/react';
import { render } from '../../test-utils/test-utils';
import Navigation from './Navigation';

describe('Navigation behavior', () => {
  it('should display the site brand', () => {
    render(<Navigation />, { initialEntries: ['/'] });
    
    expect(screen.getByText('Curiouser and Curiouser!')).toBeInTheDocument();
  });

  it('should display all navigation links', () => {
    render(<Navigation />, { initialEntries: ['/'] });
    
    expect(screen.getByRole('link', { name: 'Graph' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Timeline' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Tag Network' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'About' })).toBeInTheDocument();
  });

  it('should highlight the active navigation item on home page', () => {
    render(<Navigation />, { initialEntries: ['/'] });
    
    const graphLink = screen.getByRole('link', { name: 'Graph' });
    const timelineLink = screen.getByRole('link', { name: 'Timeline' });
    
    expect(graphLink).toHaveClass('active');
    expect(timelineLink).not.toHaveClass('active');
  });

  it('should highlight the active navigation item on timeline page', () => {
    render(<Navigation />, { initialEntries: ['/timeline'] });
    
    const graphLink = screen.getByRole('link', { name: 'Graph' });
    const timelineLink = screen.getByRole('link', { name: 'Timeline' });
    
    expect(timelineLink).toHaveClass('active');
    expect(graphLink).not.toHaveClass('active');
  });

  it('should highlight the active navigation item on tag graph page', () => {
    render(<Navigation />, { initialEntries: ['/tag-graph'] });
    
    const tagGraphLink = screen.getByRole('link', { name: 'Tag Network' });
    const graphLink = screen.getByRole('link', { name: 'Graph' });
    
    expect(tagGraphLink).toHaveClass('active');
    expect(graphLink).not.toHaveClass('active');
  });

  it('should highlight the active navigation item on about page', () => {
    render(<Navigation />, { initialEntries: ['/about'] });
    
    const aboutLink = screen.getByRole('link', { name: 'About' });
    const graphLink = screen.getByRole('link', { name: 'Graph' });
    
    expect(aboutLink).toHaveClass('active');
    expect(graphLink).not.toHaveClass('active');
  });

  it('should navigate to correct pages when links are clicked', () => {
    render(<Navigation />, { initialEntries: ['/'] });
    
    const timelineLink = screen.getByRole('link', { name: 'Timeline' });
    fireEvent.click(timelineLink);
    
    // Since we're using MemoryRouter, we verify the link href
    expect(timelineLink).toHaveAttribute('href', expect.stringContaining('/timeline'));
  });

  it('should navigate home when brand is clicked', () => {
    render(<Navigation />, { initialEntries: ['/timeline'] });
    
    const brandLink = screen.getByRole('link', { name: 'Curiouser and Curiouser!' });
    fireEvent.click(brandLink);
    
    // Since we're using MemoryRouter, we verify the link href
    expect(brandLink).toHaveAttribute('href', expect.stringContaining('/'));
  });

  it('should apply custom className when provided', () => {
    const { container } = render(<Navigation className="custom-nav" />, { initialEntries: ['/'] });
    
    const navElement = container.querySelector('.navigation');
    expect(navElement).toHaveClass('custom-nav');
  });

  it('should handle sub-routes correctly for active state', () => {
    render(<Navigation />, { initialEntries: ['/timeline/2024'] });
    
    const timelineLink = screen.getByRole('link', { name: 'Timeline' });
    expect(timelineLink).toHaveClass('active');
  });

  it('should only highlight home link for exact root path', () => {
    render(<Navigation />, { initialEntries: ['/about/details'] });
    
    const graphLink = screen.getByRole('link', { name: 'Graph' });
    const aboutLink = screen.getByRole('link', { name: 'About' });
    
    expect(graphLink).not.toHaveClass('active');
    expect(aboutLink).toHaveClass('active');
  });
});