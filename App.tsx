
import React, { useState, useRef, useEffect } from 'react';
// @ts-ignore
import Scrollbar from 'smooth-scrollbar';
// @ts-ignore
import DitherBackground from './components/DitherBackground';
import RecruitmentSandbox from './components/RecruitmentSandbox';
import ChatDrawer from './components/ChatDrawer';
import FeedbackModal from './components/FeedbackModal';
import FeaturesSection from './components/FeaturesSection';
import PricingSection from './components/PricingSection';
import TransformationDemo from './components/TransformationDemo';
import { Button } from './components/ui/Button';
import { UserProvider, useUser } from './contexts/UserContext';
import PaywallModal from './components/PaywallModal';

// Create an inner component to use the hook context
const AppContent: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const { openPaywall, isPro } = useUser();
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollbarRef = useRef<any>(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      const scrollbar = Scrollbar.init(scrollContainerRef.current, {
        damping: 0.06,
        renderByPixels: true,
        continuousScrolling: false,
        alwaysShowTracks: true,
      });

      scrollbarRef.current = scrollbar;

      return () => {
        if (scrollbarRef.current) {
          scrollbarRef.current.destroy();
        }
      };
    }
  }, []);

  const scrollToSection = (e: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>, id: string) => {
    e.preventDefault();
    if (!scrollbarRef.current) return;

    const target = document.querySelector(id);
    if (target) {
      scrollbarRef.current.scrollIntoView(target, {
        offsetTop: -80, // Offset for header
        timeLeft: 1000,
      });
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#050505] text-white font-sans selection:bg-sky-500/30 selection:text-sky-200">
      
      {/* FIXED ELEMENTS (Outside Scroll Container) */}
      {/* Navigation */}
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
            <Button onClick={() => setIsChatOpen(true)} variant="primary" size="sm" className="h-8 text-[12px] px-4 gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] transition-shadow rounded">
               {isPro ? 'Assistant' : 'Get Started'}
            </Button>
          </div>
        </div>
      </nav>

      <ChatDrawer isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      <PaywallModal />

      {/* SCROLLABLE CONTENT */}
      <div ref={scrollContainerRef} className="h-full w-full overflow-hidden" id="main-scroll-wrapper">
        <div className="min-h-screen flex flex-col">
            
            {/* Hero Section */}
            <section id="hero" className="relative min-h-[100vh] flex flex-col pt-24 lg:pt-32 pb-20 overflow-hidden">
              <DitherBackground />
              
              <div className="relative z-20 max-w-screen-xl mx-auto px-4 md:px-6 w-full flex-grow flex flex-col items-center justify-center text-center mt-10 md:mt-16">
                  
                  {/* Announcement Pill */}
                  <div className="mb-8 md:mb-10 animate-slide-up opacity-0" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
                    <div className="inline-flex items-center gap-3 px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 text-[10px] md:text-[11px] font-mono text-neutral-400 hover:bg-white/[0.06] hover:text-neutral-300 transition-all cursor-default backdrop-blur-md">
                       <span className="flex h-1.5 w-1.5 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-sky-500"></span>
                       </span>
                       The AI Recruitment OS
                    </div>
                  </div>

                  {/* Main Heading */}
                  <h1 className="text-5xl md:text-7xl lg:text-9xl font-bold tracking-[-0.04em] text-white mb-6 md:mb-8 animate-slide-up opacity-0 leading-[0.9] md:leading-[0.85] drop-shadow-2xl mix-blend-screen" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
                    Hiring <br/>
                    <span className="text-neutral-600 font-serif italic font-light tracking-normal">on autopilot.</span>
                  </h1>

                  <p className="text-base md:text-xl text-neutral-400 max-w-xl leading-relaxed mb-10 md:mb-12 animate-slide-up opacity-0 font-light tracking-wide px-4" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
                     The complete studio for generating precision JDs, interview guides, and screening protocols. Designed for modern agencies.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 items-center animate-slide-up opacity-0 w-full sm:w-auto px-4 sm:px-0" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
                     <Button size="lg" onClick={(e) => scrollToSection(e, '#pricing')} className="h-12 px-8 text-sm font-semibold rounded-full bg-white text-black hover:bg-neutral-200 transition-all hover:scale-105 w-full sm:w-auto">Start Free Trial</Button>
                     <Button variant="ghost" size="lg" onClick={(e) => scrollToSection(e, '#demo')} className="h-12 px-8 text-sm text-neutral-400 hover:text-white rounded-full transition-all hover:scale-105 w-full sm:w-auto">
                        View Demo
                     </Button>
                  </div>

                  {/* 3D Interface Preview */}
                  <div className="mt-20 md:mt-32 w-full max-w-6xl relative animate-slide-up opacity-0 pointer-events-none px-2 md:px-0" style={{ animationDelay: '0.6s', animationFillMode: 'forwards' }}>
                      <div className="relative aspect-[16/10] w-full group perspective-1000">
                          {/* Glow Effect behind */}
                          <div className="absolute -inset-4 bg-gradient-to-t from-sky-500/20 via-neutral-800/0 to-transparent rounded-[2rem] blur-3xl opacity-40 group-hover:opacity-60 transition-opacity duration-700"></div>

                          {/* Main Interface Container with 3D tilt */}
                          <div className="absolute inset-0 bg-[#0A0A0A] rounded-xl shadow-2xl overflow-hidden transform transition-transform duration-1000 hover:scale-[1.01] hover:rotate-x-1 origin-bottom ring-1 ring-white/10"
                                  style={{ transformStyle: 'preserve-3d', transform: 'rotateX(2deg)' }}>
                                  
                                  {/* Window Controls */}
                                  <div className="h-8 md:h-10 bg-[#0F0F0F] border-b border-white/5 flex items-center px-4 justify-between z-20 relative">
                                      <div className="flex gap-2">
                                          <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-[#2F2F2F] border border-white/5 hover:bg-red-500/20 transition-colors"></div>
                                          <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-[#2F2F2F] border border-white/5 hover:bg-yellow-500/20 transition-colors"></div>
                                          <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-[#2F2F2F] border border-white/5 hover:bg-green-500/20 transition-colors"></div>
                                      </div>
                                      <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-black/40 border border-white/5">
                                          <svg className="w-3 h-3 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                          <span className="text-[10px] font-mono text-neutral-500 tracking-wide">studio.recruitbox.ai</span>
                                      </div>
                                      <div className="w-16"></div>
                                  </div>

                                  {/* App Content Layout - Simulated */}
                                  <div className="flex h-full relative">
                                      {/* Sidebar */}
                                      <div className="w-16 md:w-64 border-r border-white/5 bg-[#080808] flex flex-col p-2 md:p-4 gap-4 md:gap-6">
                                          <div className="h-8 w-full bg-white/5 rounded-md flex items-center justify-center md:justify-start px-0 md:px-3 gap-3 border border-white/5 hover:border-white/10 transition-colors">
                                              <div className="w-4 h-4 rounded-sm bg-sky-500/20 shrink-0"></div>
                                              <div className="hidden md:block h-2 w-20 bg-white/10 rounded-sm"></div>
                                          </div>
                                          <div className="space-y-2">
                                              <div className="hidden md:block text-[10px] font-mono text-neutral-600 uppercase tracking-wider mb-2">Active Roles</div>
                                              {[1,2,3].map(i => (
                                                  <div key={i} className="flex items-center justify-center md:justify-start gap-3 px-2 py-2 rounded-md hover:bg-white/5 transition-colors cursor-pointer">
                                                      <div className="w-2 h-2 rounded-full border border-white/20 shrink-0"></div>
                                                      <div className="hidden md:block h-2 w-24 bg-white/5 rounded-sm"></div>
                                                  </div>
                                              ))}
                                          </div>
                                      </div>

                                      {/* Main Canvas */}
                                      <div className="flex-1 bg-[#050505] relative overflow-hidden flex flex-col">
                                          {/* Canvas Header */}
                                          <div className="h-12 md:h-14 border-b border-white/5 flex items-center px-4 md:px-8 justify-between">
                                              <div className="flex flex-col gap-1">
                                                  <div className="h-3 md:h-4 w-32 md:w-48 bg-white/10 rounded-sm"></div>
                                                  <div className="h-2 w-16 md:w-24 bg-white/5 rounded-sm"></div>
                                              </div>
                                              <div className="flex gap-3">
                                                  <div className="hidden md:block h-8 w-24 rounded-md bg-white/5 border border-white/5 hover:border-white/10 transition-colors"></div>
                                                  <div className="h-8 w-8 rounded-md bg-sky-500 text-white flex items-center justify-center shadow-lg shadow-sky-900/20 hover:bg-sky-400 transition-colors cursor-pointer">
                                                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                  </div>
                                              </div>
                                          </div>

                                          {/* Dashboard Grid */}
                                          <div className="p-4 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 opacity-80 overflow-y-auto">
                                              {/* Chart Area */}
                                              <div className="col-span-1 md:col-span-2 h-48 md:h-64 rounded-xl bg-[#0A0A0A] border border-white/5 relative overflow-hidden group/card hover:border-white/10 transition-colors">
                                                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                                                  <div className="p-4 md:p-6 border-b border-white/5 flex justify-between">
                                                      <div className="h-3 w-32 bg-white/10 rounded-sm"></div>
                                                      <div className="h-3 w-16 bg-green-500/20 rounded-sm"></div>
                                                  </div>
                                                  <div className="p-4 md:p-6 mt-4 md:mt-8 flex items-end gap-2 h-24 md:h-32">
                                                      {[40, 65, 45, 80, 55, 70, 90, 60, 75, 50, 85, 95].map((h, i) => (
                                                          <div key={i} className="flex-1 bg-neutral-800 hover:bg-sky-500/50 transition-all rounded-t-sm relative group/bar cursor-pointer" style={{ height: `${h}%` }}>
                                                          </div>
                                                      ))}
                                                  </div>
                                              </div>

                                              {/* Stats Card */}
                                              <div className="col-span-1 h-32 md:h-64 rounded-xl bg-[#0A0A0A] border border-white/5 relative overflow-hidden p-4 md:p-6 space-y-4 md:space-y-6 hover:border-white/10 transition-colors">
                                                  <div className="space-y-2">
                                                      <div className="text-[10px] text-neutral-500 uppercase tracking-wider">Candidate Match</div>
                                                      <div className="text-3xl md:text-4xl font-light text-white tracking-tight">92.4<span className="text-sm text-neutral-600 ml-1">%</span></div>
                                                  </div>
                                                  <div className="hidden md:block h-px w-full bg-white/5"></div>
                                                  <div className="hidden md:block space-y-2">
                                                      <div className="text-[10px] text-neutral-500 uppercase tracking-wider">Sourced</div>
                                                      <div className="text-4xl font-light text-white tracking-tight">1,204</div>
                                                  </div>
                                                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 to-sky-300"></div>
                                              </div>
                                          </div>
                                      </div>
                                  </div>
                                  
                                  {/* Reflection Overlay */}
                                  <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none"></div>
                          </div>
                      </div>
                  </div>
              </div>
            </section>

            {/* Tool Section - The Product */}
            <section id="product" className="relative z-20 py-20 lg:py-32 bg-[#050505] border-t border-white/5">
               <div className="max-w-screen-2xl mx-auto px-4 md:px-6">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
                     <div className="lg:col-span-4 space-y-10">
                        <div>
                          <h2 className="text-4xl md:text-5xl font-semibold tracking-tighter text-white mb-6">The Recruitment <br/>Studio</h2>
                          <p className="text-neutral-400 leading-relaxed text-base md:text-lg font-light">
                           RecruitBox provides a dedicated environment for rapid asset generation. 
                           Define unstructured requirements and receive structured, production-ready documentation instantly.
                          </p>
                        </div>
                        
                        <div className="hidden lg:block space-y-px bg-white/10 border border-white/10 rounded-xl overflow-hidden">
                           <div className="p-6 bg-[#0A0A0A] flex items-start gap-4 hover:bg-[#0F0F0F] transition-colors cursor-default">
                              <div className="mt-1 w-8 h-8 rounded flex items-center justify-center bg-white/5 text-white text-sm">1</div>
                              <div>
                                 <h4 className="text-white font-medium">Input Context</h4>
                                 <p className="text-neutral-500 text-sm mt-1">Paste raw, messy notes from hiring managers or Slack threads.</p>
                              </div>
                           </div>
                           <div className="p-6 bg-[#0A0A0A] flex items-start gap-4 hover:bg-[#0F0F0F] transition-colors cursor-default">
                              <div className="mt-1 w-8 h-8 rounded flex items-center justify-center bg-white/5 text-white text-sm">2</div>
                              <div>
                                 <h4 className="text-white font-medium">Model Reasoning</h4>
                                 <p className="text-neutral-500 text-sm mt-1">Gemini 3 Pro identifies gaps in seniority and skills.</p>
                              </div>
                           </div>
                           <div className="p-6 bg-[#0A0A0A] flex items-start gap-4 hover:bg-[#0F0F0F] transition-colors cursor-default">
                              <div className="mt-1 w-8 h-8 rounded flex items-center justify-center bg-white/5 text-white text-sm">3</div>
                              <div>
                                 <h4 className="text-white font-medium">Asset Generation</h4>
                                 <p className="text-neutral-500 text-sm mt-1">Get JDs, Interview Guides, and Screening Questions instantly.</p>
                              </div>
                           </div>
                        </div>
                     </div>

                     <div className="lg:col-span-8">
                        <RecruitmentSandbox />
                     </div>
                  </div>
               </div>
            </section>

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

            {/* Footer */}
            <footer className="bg-[#050505] border-t border-white/5 py-12 md:py-20 text-neutral-500 text-sm relative z-20">
               <div className="max-w-screen-2xl mx-auto px-6 flex flex-col md:flex-row justify-between gap-10">
                  <div className="max-w-xs">
                     <div className="flex items-center gap-3 mb-6">
                        <div className="w-5 h-5 bg-neutral-800 rounded-[2px]"></div>
                        <span className="font-mono text-neutral-300 text-xs">RECRUITBOX</span>
                     </div>
                     <p className="leading-relaxed mb-6">
                        Pioneering the future of automated recruitment. 
                        <br/>© 2024 RecruitBox Inc. All rights reserved.
                     </p>
                     
                     <button 
                        onClick={() => setIsFeedbackOpen(true)}
                        className="flex items-center gap-2 text-xs text-neutral-500 hover:text-white transition-colors group"
                     >
                         <svg className="w-4 h-4 text-neutral-600 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                         </svg>
                         Feedback & Bug Report
                     </button>
                  </div>
                  <div className="flex gap-12 md:gap-20">
                     <div className="space-y-4">
                        <h4 className="text-white text-xs font-mono uppercase tracking-wider">Platform</h4>
                        <ul className="space-y-2">
                           <li><a href="#" className="hover:text-white transition-colors">Overview</a></li>
                           <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
                           <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                        </ul>
                     </div>
                     <div className="space-y-4">
                        <h4 className="text-white text-xs font-mono uppercase tracking-wider">Company</h4>
                        <ul className="space-y-2">
                           <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                           <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                           <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                        </ul>
                     </div>
                  </div>
               </div>

               <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
            </footer>
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
