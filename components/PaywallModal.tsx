
import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { Button } from './ui/Button';

const PaywallModal: React.FC = () => {
  const { isPaywallOpen, closePaywall, upgradeToPro } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  if (!isPaywallOpen) return null;

  const handleUpgrade = async () => {
    setIsLoading(true);
    await upgradeToPro();
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300" onClick={closePaywall} />
      
      <div className="relative w-full max-w-lg bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-slide-up flex flex-col">
         {/* Decorative gradients */}
         <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-sky-500/10 to-transparent pointer-events-none"></div>
         <div className="absolute -top-24 -right-24 w-48 h-48 bg-sky-500/20 blur-[80px] rounded-full pointer-events-none"></div>

         <div className="p-8 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-sky-600 flex items-center justify-center text-white mb-6 shadow-lg shadow-sky-500/20">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            </div>

            <h3 className="text-2xl font-semibold text-white mb-2">Unlock Enterprise Intelligence</h3>
            <p className="text-neutral-400 leading-relaxed mb-8">
                You've reached the limit of the free tier. Upgrade to RecruitBox Pro to generate unlimited assets, access advanced reasoning models, and export to ATS.
            </p>

            <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-sky-500/10 flex items-center justify-center text-sky-500">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <span className="text-sm text-neutral-200">Unlimited AI Generations (JD, Guide, Screening)</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-sky-500/10 flex items-center justify-center text-sky-500">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <span className="text-sm text-neutral-200">Access to Gemini 3 Pro Reasoning Model</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-sky-500/10 flex items-center justify-center text-sky-500">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <span className="text-sm text-neutral-200">Commercial License & Export</span>
                </div>
            </div>

            <div className="space-y-3">
                <Button 
                    onClick={handleUpgrade} 
                    isLoading={isLoading} 
                    className="w-full h-12 text-base bg-white text-black hover:bg-neutral-200"
                >
                    Upgrade to Pro - $149/mo
                </Button>
                <button 
                    onClick={closePaywall}
                    className="w-full py-2 text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
                >
                    Maybe later
                </button>
            </div>
         </div>
         
         <div className="bg-[#0F0F0F] p-4 border-t border-white/5 text-center">
             <p className="text-[10px] text-neutral-600 uppercase tracking-wide">
                 Secure payment via Stripe • Cancel anytime
             </p>
         </div>
      </div>
    </div>
  );
};

export default PaywallModal;
