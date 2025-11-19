import React, { useState, useRef, useEffect } from 'react';
// @ts-ignore
import Scrollbar from 'smooth-scrollbar';
import ChatDrawer from './components/ChatDrawer';
import FeaturesSection from './components/FeaturesSection';
import PricingSection from './components/PricingSection';
import TransformationDemo from './components/TransformationDemo';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import ProductSection from './components/ProductSection';
import Footer from './components/Footer';
import { UserProvider, useUser } from './contexts/UserContext';
import PaywallModal from './components/PaywallModal';

// Create an inner component to use the hook context
const AppContent: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { openPaywall, isPro } = useUser();
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollbar, setScrollbar] = useState<any>(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      const sb = Scrollbar.init(scrollContainerRef.current, {
        damping: 0.06,
        renderByPixels: true,
        continuousScrolling: false,
        alwaysShowTracks: true,
      });

      setScrollbar(sb);

      return () => {
        if (sb) sb.destroy();
      };
    }
  }, []);

  const scrollToSection = (e: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>, id: string) => {
    e.preventDefault();
    if (!scrollbar) return;

    const target = document.querySelector(id);
    if (target) {
      scrollbar.scrollIntoView(target, {
        offsetTop: -80, // Offset for header
        timeLeft: 1000,
      });
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#050505] text-white font-sans selection:bg-sky-500/30 selection:text-sky-200">
      
      {/* FIXED ELEMENTS (Outside Scroll Container) */}
      <Navbar 
        isPro={isPro}
        openPaywall={openPaywall}
        onChatOpen={() => setIsChatOpen(true)}
        scrollToSection={scrollToSection}
      />

      <ChatDrawer isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      <PaywallModal />

      {/* SCROLLABLE CONTENT */}
      <div ref={scrollContainerRef} className="h-full w-full overflow-hidden" id="main-scroll-wrapper">
        <div className="min-h-screen flex flex-col">
            
            <HeroSection scrollToSection={scrollToSection} />

            {/* Tool Section - The Product */}
            <ProductSection scrollbar={scrollbar} />

            <div id="features">
                <FeaturesSection />
            </div>

            {/* Demo Section */}
            <div id="demo">
              <TransformationDemo />
            </div>

            <div id="pricing">
                <PricingSection />
            </div>

            <Footer />
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
};

export default App;