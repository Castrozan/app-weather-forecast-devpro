'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { MapPin } from 'lucide-react';

import {
  candidateItemEntryVariants,
  candidateItemTransition,
  candidateListStaggerVariants,
} from '@/shared/animation/variants';
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
      <p className="candidate-list-title">Select a city</p>
      <motion.ul
        className="candidate-list"
        variants={candidateListStaggerVariants}
        initial="initial"
        animate="animate"
      >
        <AnimatePresence>
          {cities.map((city) => (
            <motion.li
              key={city.id}
              variants={candidateItemEntryVariants}
              transition={candidateItemTransition}
            >
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
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
    </div>
  );
};
