import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 4C7.5 4 4 7.5 4 12V21H20V12C20 7.5 16.5 4 12 4Z" />
    <path d="M12 2V4" />
    <path d="M12 16V21" />
    <path d="M10 21V16C10 14.9 10.9 14 12 14C13.1 14 14 14.9 14 16V21" />
    <path d="M19 6C19 7.65 17.65 9 16 9C15.6 9 15.2 8.9 14.9 8.7C15.2 9.4 15.8 10 16.5 10C17.9 10 19 8.9 19 7.5C19 6.9 18.8 6.4 18.5 6C18.7 6 18.8 6 19 6Z" fill="currentColor" stroke="none" />
  </svg>
);
