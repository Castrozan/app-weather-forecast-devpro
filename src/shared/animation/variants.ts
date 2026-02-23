import { smoothDecelerationEasing } from './easings';

export const weatherContentEnterAnimation = {
  initial: { opacity: 0, y: 10, scale: 0.994, filter: 'blur(2px) saturate(0.92)' },
  animate: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px) saturate(1)' },
  exit: { opacity: 0, y: -6, filter: 'blur(1px)' },
  transition: { duration: 0.52, ease: smoothDecelerationEasing },
};

export const skeletonLayerEnterAnimation = {
  initial: { opacity: 0, y: 8, filter: 'saturate(0.92)' },
  animate: { opacity: 1, y: 0, filter: 'saturate(1)' },
  exit: { opacity: 0, y: -4 },
  transition: { duration: 0.52, ease: smoothDecelerationEasing },
};

export const forecastGridStaggerVariants = {
  animate: {
    transition: { staggerChildren: 0.06 },
  },
};

export const forecastCardEntryVariants = {
  initial: { opacity: 0, y: 12, scale: 0.96 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.38, ease: smoothDecelerationEasing },
  },
};

export const candidateListStaggerVariants = {
  animate: {
    transition: { staggerChildren: 0.04 },
  },
};

export const candidateItemEntryVariants = {
  initial: { opacity: 0, x: -8 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 8 },
};

export const candidateItemTransition = {
  duration: 0.24,
  ease: smoothDecelerationEasing,
};
