import { MapPin } from 'lucide-react';

import type { CityCandidate } from '@/features/weather/types';

type CityCandidatesListProps = {
  cities: CityCandidate[];
  onSelect: (city: CityCandidate) => void;
};

export const CityCandidatesList = ({ cities, onSelect }: CityCandidatesListProps) => {
  if (cities.length === 0) {
    return null;
  }

  return (
    <div className="candidate-list-wrapper">
      <p className="candidate-list-title">Select a city</p>
      <ul className="candidate-list">
        {cities.map((city) => (
          <li key={city.id}>
            <button type="button" className="candidate-button" onClick={() => onSelect(city)}>
              <span className="candidate-name">
                <MapPin size={14} aria-hidden="true" />
                {city.name}
              </span>
              <span className="candidate-meta">
                {city.state ? `${city.state}, ` : ''}
                {city.country}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
