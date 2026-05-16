
import React from 'react';
import { motion } from 'framer-motion';

const LoadingReport = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6 animate-pulse"
    >
      <div className="h-10 bg-gray-200 rounded-md w-3/4 mx-auto"></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="h-16 bg-gray-200 rounded-lg"></div>
        <div className="h-16 bg-gray-200 rounded-lg"></div>
        <div className="h-16 bg-gray-200 rounded-lg"></div>
        <div className="h-16 bg-gray-200 rounded-lg"></div>
      </div>
      <div className="space-y-4">
        <div className="h-12 bg-gray-200 rounded-lg"></div>
        <div className="h-24 bg-gray-200 rounded-lg"></div>
        <div className="h-12 bg-gray-200 rounded-lg"></div>
        <div className="h-24 bg-gray-200 rounded-lg"></div>
      </div>
    </motion.div>
  );
};

export default LoadingReport;
