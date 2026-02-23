'use client';

import { Search } from 'lucide-react';

type SearchFormProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
};

export const SearchForm = ({ value, onChange, onSubmit, disabled }: SearchFormProps) => {
  return (
    <form
      className="search-form"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <input
        id="city-search"
        name="city"
        type="text"
        placeholder="Search by city"
        autoComplete="off"
        aria-label="Search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className="search-input"
      />
      <button type="submit" className="button" disabled={disabled}>
        <Search size={16} aria-hidden="true" />
        Find
      </button>
    </form>
  );
};
