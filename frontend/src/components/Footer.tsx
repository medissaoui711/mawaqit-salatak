import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-gray-800 bg-dark mt-auto">
      <div className="max-w-7xl mx-auto py-6 px-4 overflow-hidden sm:px-6 lg:px-8">
        <p className="mt-8 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Neon Stack. Built with FastAPI & React.
        </p>
      </div>
    </footer>
  );
};

export default Footer;