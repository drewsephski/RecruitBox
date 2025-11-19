import React, { useState } from 'react';
import FeedbackModal from './FeedbackModal';

const Footer: React.FC = () => {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  return (
    <footer className="bg-[#050505] border-t border-white/5 py-12 md:py-20 text-neutral-500 text-sm relative z-20">
       <div className="max-w-screen-2xl mx-auto px-6 flex flex-col md:flex-row justify-between gap-10">
          <div className="max-w-xs">
             <div className="flex items-center gap-3 mb-6">
                <div className="w-5 h-5 bg-neutral-800 rounded-[2px]"></div>
                <span className="font-mono text-neutral-300 text-xs">RECRUITBOX</span>
             </div>
             <p className="leading-relaxed mb-6">
                Pioneering the future of automated recruitment. 
                <br/>© 2025 RecruitBox Inc. All rights reserved.
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
  );
};

export default Footer;