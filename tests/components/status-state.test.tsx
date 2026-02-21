import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { StatusState } from '@/components/shared/StatusState';

describe('StatusState', () => {
  it('renders nothing when message is null', () => {
    const { container } = render(<StatusState message={null} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders the message text', () => {
    render(<StatusState message="Loading weather..." />);

    expect(screen.getByText('Loading weather...')).toBeInTheDocument();
  });

  it('sets aria-live="polite" on non-error messages', () => {
    render(<StatusState message="Searching cities..." />);

    expect(screen.getByText('Searching cities...')).toHaveAttribute('aria-live', 'polite');
  });

  it('sets role="alert" on error messages for immediate screen reader announcement', () => {
    render(<StatusState message="No city found." isError />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('No city found.');
  });

  it('applies status-message-error class on error messages', () => {
    render(<StatusState message="Failed to load weather." isError />);

    expect(screen.getByRole('alert')).toHaveClass('status-message-error');
  });

  it('does not apply status-message-error class on non-error messages', () => {
    render(<StatusState message="Multiple matches found." />);

    const element = screen.getByText('Multiple matches found.');
    expect(element).not.toHaveClass('status-message-error');
  });

  it('forwards the className prop to the rendered element', () => {
    render(<StatusState message="Loading..." className="sidebar-status-message" />);

    expect(screen.getByText('Loading...')).toHaveClass('sidebar-status-message');
  });
});
