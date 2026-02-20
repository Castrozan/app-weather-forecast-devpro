'use client';

import type { CityCandidate } from '@/types/weather';

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
      <p className="candidate-list-title">Select city</p>
      <ul className="candidate-list">
        {cities.map((city) => (
          <li key={city.id}>
            <button type="button" className="candidate-button" onClick={() => onSelect(city)}>
              {city.displayName}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
