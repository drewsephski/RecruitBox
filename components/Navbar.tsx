import React from 'react';
import { Button } from './ui/Button';

interface NavbarProps {
  isPro: boolean;
  openPaywall: () => void;
  onChatOpen: () => void;
  scrollToSection: (e: React.MouseEvent<HTMLElement>, id: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ isPro, openPaywall, onChatOpen, scrollToSection }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-white/5 bg-[#050505]/80 backdrop-blur-md transition-all duration-300">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 h-full flex items-center justify-between">
        <div 
          className="flex items-center gap-3 group cursor-pointer" 
          onClick={(e) => scrollToSection(e, '#hero')}
        >
           <div className="w-6 h-6 bg-white rounded-[4px] flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-shadow group-hover:shadow-[0_0_25px_rgba(255,255,255,0.5)]">
              <div className="w-2 h-2 bg-black rounded-[1px]"></div>
           </div>
           <span className="font-medium tracking-tight text-sm font-mono text-neutral-300 group-hover:text-white transition-colors">RecruitBox</span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-[13px] font-medium text-neutral-500">
           <a href="#product" onClick={(e) => scrollToSection(e, '#product')} className="hover:text-white transition-colors cursor-pointer">Product</a>
           <a href="#features" onClick={(e) => scrollToSection(e, '#features')} className="hover:text-white transition-colors cursor-pointer">Features</a>
           <a href="#demo" onClick={(e) => scrollToSection(e, '#demo')} className="hover:text-white transition-colors cursor-pointer">Demo</a>
           <a href="#pricing" onClick={(e) => scrollToSection(e, '#pricing')} className="hover:text-white transition-colors cursor-pointer">Pricing</a>
        </div>

        <div className="flex items-center gap-3">
          {!isPro && (
              <button 
                  onClick={openPaywall}
                  className="text-[13px] font-medium text-sky-500 hover:text-white transition-colors hidden sm:block px-3"
              >
                  Upgrade to Pro
              </button>
          )}
          <Button onClick={onChatOpen} variant="primary" size="sm" className="h-8 text-[12px] px-4 gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] transition-shadow rounded">
             {isPro ? 'Assistant' : 'Get Started'}
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;