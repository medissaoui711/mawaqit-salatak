
import React from 'react';
import { Logo } from './Logo';

const Navbar: React.FC = () => {
  return (
    <nav className="border-b border-gray-800 bg-surface/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="bg-neon/10 p-2 rounded-lg border border-neon/20 shadow-[0_0_10px_rgba(83,255,76,0.2)]">
              <Logo className="h-6 w-6 text-neon" />
            </div>
            <span className="text-xl font-bold tracking-wider text-white font-sans">
              مواقيت <span className="text-neon drop-shadow-[0_0_5px_rgba(83,255,76,0.8)]">صلاتك</span>
            </span>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <a href="#" className="text-gray-300 hover:text-neon px-3 py-2 rounded-md text-sm font-medium transition-colors">الرئيسية</a>
              <a href="#" className="text-gray-300 hover:text-neon px-3 py-2 rounded-md text-sm font-medium transition-colors">الملف الشخصي</a>
              <button className="bg-neon/10 text-neon hover:bg-neon hover:text-black border border-neon px-4 py-2 rounded-md text-sm font-bold transition-all shadow-neon">
                تسجيل الدخول
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;