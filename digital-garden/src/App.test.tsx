import { render, screen } from '@testing-library/react';
import App from './App';

describe('App behavior', () => {
  it('should render without crashing', () => {
    render(<App />);
    // App shows loading state initially, so check for loading text
    expect(screen.getByText('Loading your digital garden...')).toBeInTheDocument();
  });
});
