import type { CityCandidate } from '@/features/weather/types';

import { CityCandidatesList } from './CityCandidatesList';
import { SearchForm } from './SearchForm';
import { SidebarDisclaimer } from './SidebarDisclaimer';

type WeatherSidebarProps = {
  cityQuery: string;
  onCityQueryChange: (value: string) => void;
  onSearch: () => void;
  candidateCities: CityCandidate[];
  onCitySelect: (city: CityCandidate) => void;
  controlsDisabled: boolean;
};

export const WeatherSidebar = ({
  cityQuery,
  onCityQueryChange,
  onSearch,
  candidateCities,
  onCitySelect,
  controlsDisabled,
}: WeatherSidebarProps) => {
  return (
    <aside className="sidebar">
      <header className="sidebar-header">
        <h1 className="sidebar-title">Search</h1>
      </header>
      <SearchForm
        value={cityQuery}
        onChange={onCityQueryChange}
        onSubmit={onSearch}
        disabled={controlsDisabled}
      />
      <CityCandidatesList cities={candidateCities} onSelect={onCitySelect} />
      <SidebarDisclaimer />
    </aside>
  );
};
