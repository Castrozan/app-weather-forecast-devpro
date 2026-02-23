'use client';

import { AnimatePresence, motion } from 'framer-motion';

import { valueSwapAnimation } from './variants';

type AnimatedValueProps = {
  value: string;
};

export const AnimatedValue = ({ value }: AnimatedValueProps) => {
  return (
    <AnimatePresence mode="popLayout">
      <motion.span key={value} {...valueSwapAnimation}>
        {value}
      </motion.span>
    </AnimatePresence>
  );
};
