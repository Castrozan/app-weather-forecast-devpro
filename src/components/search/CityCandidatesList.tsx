'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { MapPin } from 'lucide-react';

import type { CityCandidate } from '@/types/weather';

const candidateItemEntryVariants = {
  initial: { opacity: 0, x: -8 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 8 },
};

const candidateListStaggerVariants = {
  animate: {
    transition: { staggerChildren: 0.04 },
  },
};

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
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
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
