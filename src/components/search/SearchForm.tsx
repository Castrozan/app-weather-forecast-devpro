'use client';

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
      <label className="search-label" htmlFor="city-search">
        Search
      </label>
      <input
        id="city-search"
        name="city"
        type="text"
        placeholder="Try New York"
        autoComplete="off"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className="search-input"
      />
      <button type="submit" className="button" disabled={disabled}>
        Find
      </button>
    </form>
  );
};
