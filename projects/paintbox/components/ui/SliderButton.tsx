import React from 'react';

export const SliderButton = ({ children, onClick, active }: any) => {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-3 rounded-full transition-all ${
        active
          ? 'bg-blue-600 text-white scale-105'
          : 'bg-gray-200 hover:bg-gray-300'
      }`}
    >
      {children}
    </button>
  );
};

export const SliderButtonGroup = ({ children }: any) => {
  return <div className="flex gap-4">{children}</div>;
};