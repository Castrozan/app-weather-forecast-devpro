import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { SearchForm } from '@/features/search/components/SearchForm';

describe('SearchForm', () => {
  it('renders the search input and submit button', () => {
    render(<SearchForm value="" onChange={vi.fn()} onSubmit={vi.fn()} />);

    expect(screen.getByLabelText('Search')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Find' })).toBeInTheDocument();
  });

  it('calls onChange when user types in the input', async () => {
    const handleChange = vi.fn();
    render(<SearchForm value="" onChange={handleChange} onSubmit={vi.fn()} />);

    await userEvent.type(screen.getByLabelText('Search'), 'Paris');

    expect(handleChange).toHaveBeenCalledTimes(5);
    expect(handleChange).toHaveBeenLastCalledWith('s');
  });

  it('calls onSubmit when the form is submitted', async () => {
    const handleSubmit = vi.fn();
    render(<SearchForm value="Berlin" onChange={vi.fn()} onSubmit={handleSubmit} />);

    await userEvent.click(screen.getByRole('button', { name: 'Find' }));

    expect(handleSubmit).toHaveBeenCalledOnce();
  });

  it('disables input and button when disabled prop is true', () => {
    render(<SearchForm value="" onChange={vi.fn()} onSubmit={vi.fn()} disabled />);

    expect(screen.getByLabelText('Search')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Find' })).toBeDisabled();
  });
});
