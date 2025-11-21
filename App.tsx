import React, { useState, useEffect } from 'react';
import { ReactLenis, useLenis } from 'lenis/react';
import ChatDrawer from './components/ChatDrawer';
import FeaturesSection from './components/FeaturesSection';
import PricingSection from './components/PricingSection';
import TransformationDemo from './components/TransformationDemo';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import ProductSection from './components/ProductSection';
import Footer from './components/Footer';
import PricingPage from './components/PricingPage';
import { UserProvider, useUser } from './contexts/UserContext';
import PaywallModal from './components/PaywallModal';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useUser as useClerkUser } from '@clerk/clerk-react';
import { LoginPage, SignupPage } from './components/Auth';
import ErrorBoundary from './components/ErrorBoundary';

const CheckoutSuccessSection = ({ onDismiss }: { onDismiss: () => void }) => (
  <section className="relative isolate overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-green-500/10 via-slate-900 to-slate-900 px-6 py-12 sm:px-12 sm:py-16 mb-10">
    <div className="absolute inset-y-0 right-0 w-1/2 bg-green-500/5 blur-3xl" aria-hidden />
    <div className="relative grid gap-8 md:grid-cols-2 items-center">
      <div className="space-y-4">
        <span className="inline-flex items-center gap-2 rounded-full bg-green-500/20 px-3 py-1 text-xs font-semibold text-green-300 uppercase tracking-widest">
          <span className="flex h-2 w-2 rounded-full bg-green-300" /> Success
        </span>
        <h3 className="text-3xl font-semibold text-white">Welcome to RecruitBox Pro</h3>
        <p className="text-neutral-300 text-sm leading-relaxed">
          Your payment is confirmed and we’ve unlocked Pro features on your account. Explore new automations, invite teammates, and get priority reasoning speeds right away.
        </p>
        <div className="grid gap-3 text-sm text-neutral-200">
          <div className="flex items-start gap-3">
            <svg className="mt-1 h-4 w-4 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 13l4 4L19 7" />
            </svg>
            Unlimited AI generations & ATS exports
          </div>
          <div className="flex items-start gap-3">
            <svg className="mt-1 h-4 w-4 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 13l4 4L19 7" />
            </svg>
            Advanced tone controls + Gemini 3 Pro reasoning
          </div>
          <div className="flex items-start gap-3">
            <svg className="mt-1 h-4 w-4 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 13l4 4L19 7" />
            </svg>
            Team sharing and API hooks for your workflows
          </div>
        </div>
        <div className="flex flex-wrap gap-3 pt-4">
          <button
            onClick={() => document.querySelector('#features')?.scrollIntoView({ behavior: 'smooth' })}
            className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-neutral-200"
          >
            See what’s new
          </button>
          <button
            onClick={onDismiss}
            className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
          >
            Dismiss
          </button>
        </div>
      </div>
      <div className="rounded-2xl border border-white/10 bg-black/40 p-6">
        <h4 className="text-lg font-medium text-white mb-4">Next steps</h4>
        <ol className="space-y-3 text-sm text-neutral-300 list-decimal list-inside">
          <li>Invite your team to collaborate on briefs.</li>
          <li>Create templates for your top reqs.</li>
          <li>Connect ATS exports for instant publishing.</li>
        </ol>
      </div>
    </div>
  </section>
);

const AuthenticatedApp: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { openPaywall, isPro, refreshSubscription, openCustomerPortal } = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  const [showCheckoutSuccess, setShowCheckoutSuccess] = useState(false);

  // Use Lenis hook for scroll callbacks
  const lenis = useLenis((lenis) => {
    // Called on every scroll - can be used for scroll-based animations
    // console.log('Scroll position:', lenis.scroll);
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('checkout') === 'success') {
      setShowCheckoutSuccess(true);
    }
  }, [location.search]);

  useEffect(() => {
    if (showCheckoutSuccess) {
      refreshSubscription();
    }
  }, [showCheckoutSuccess, refreshSubscription]);

  const dismissSuccess = () => {
    const params = new URLSearchParams(location.search);
    params.delete('checkout');
    navigate({ pathname: location.pathname, search: params.toString() ? `?${params.toString()}` : '' }, { replace: true });
    setShowCheckoutSuccess(false);
  };

  const scrollToSection = (e: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>, id: string) => {
    e.preventDefault();

    const target = document.querySelector(id);
    if (!target || !lenis) return;

    const headerOffset = 80;
    const elementPosition = target.getBoundingClientRect().top + lenis.scroll;
    const offsetPosition = elementPosition - headerOffset;

    // Use Lenis scrollTo method for smooth scrolling
    lenis.scrollTo(offsetPosition, {
      duration: 1.2,
      easing: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t, // easeInOutQuad
    });
  };

  return (
    <ReactLenis root options={{ duration: 1.2, smoothWheel: true }}>
      <div className="min-h-screen w-full bg-[#050505] text-white font-sans selection:bg-sky-500/30 selection:text-sky-200">
        <div className="bg-noise" />

        {/* FIXED ELEMENTS */}
        <Navbar
          isPro={isPro}
          openPaywall={openPaywall}
          onChatOpen={() => setIsChatOpen(true)}
          scrollToSection={scrollToSection}
          openCustomerPortal={openCustomerPortal}
        />

        <ChatDrawer isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
        <PaywallModal />

        {/* SCROLLABLE CONTENT */}
        <div className="relative w-full">
          <div className="min-h-screen flex flex-col">
            {showCheckoutSuccess && <CheckoutSuccessSection onDismiss={dismissSuccess} />}
            <HeroSection scrollToSection={scrollToSection} />

            {/* Tool Section - The Product */}
            <ProductSection />

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
    </ReactLenis>
  );
};

// Enhanced loading component
const LoadingScreen: React.FC = () => (
  <div className="h-screen w-screen bg-[#050505] flex items-center justify-center">
    <div className="flex flex-col items-center gap-6">
      {/* Animated spinner */}
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-sky-500/20 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-transparent border-t-sky-500 rounded-full animate-spin"></div>
      </div>

      {/* Loading text */}
      <div className="text-center">
        <p className="text-xl font-semibold text-white mb-2">Loading RecruitBox</p>
        <p className="text-sm text-gray-400">Preparing your experience...</p>
      </div>
    </div>
  </div>
);

// Create an inner component to use the hook context
const AppContent: React.FC = () => {
  const { isLoading } = useUser();
  const { isLoaded } = useClerkUser();

  if (!isLoaded || isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      <Route path="/sign-in/*" element={<LoginPage />} />
      <Route path="/sign-up/*" element={<SignupPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/" element={<AuthenticatedApp />} />
    </Routes>
  );
};

const App: React.FC = () => {
  console.log("App.tsx: App component rendering");
  return (
    <ErrorBoundary>
      <UserProvider>
        <AppContent />
      </UserProvider>
    </ErrorBoundary>
  );
};

export default App;