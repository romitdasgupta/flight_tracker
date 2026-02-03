import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../App';

describe('App integration', () => {
  it('renders the map container', () => {
    render(<App />);
    expect(screen.getByTestId('map-root')).toBeInTheDocument();
  });
});
