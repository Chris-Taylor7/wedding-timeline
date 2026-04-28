'use client';

import React from 'react';

interface LoaderProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Loader: React.FC<LoaderProps> = ({ message = 'Loading...', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className={`${sizeClasses[size]} border-4 border-[#cbaacb] border-t-[#ffb7b2] rounded-full animate-spin`}></div>
        </div>
        <p className="text-gray-700 font-medium text-sm">{message}</p>
      </div>
    </div>
  );
};
