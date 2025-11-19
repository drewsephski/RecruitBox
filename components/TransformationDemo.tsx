
import React, { useState, useEffect } from 'react';

const RAW_INPUT = `// slack_dump_hiring_manager.txt
need a sr frontend eng ASAP.
stack: React, TS, Tailwind (must know standard config).
remote is ok but mostly EST hours.
pay: 150-180k base.
vibes: no ego, we ship daily, high agency.
interview needs: 
1. check for perf optimization (react renders)
2. a11y knowledge is a plus.
3. system design for component libs.`;

const OUTPUT_DATA = {
  jd: {
    title: "Senior Frontend Engineer",
    tags: ["Remote (EST Pref)", "$150k - $180k", "React/TS"],
    content: (
      <div className="space-y-4">
        <p className="text-sm text-neutral-400 leading-relaxed">
          We are looking for a high-agency Senior Engineer to join our shipping-focused team. You will own the architecture of our core product design system.
        </p>
        <div className="space-y-2">
          <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">Key Responsibilities</div>
          <ul className="text-sm text-neutral-300 space-y-2">
            <li className="flex gap-2">
              <span className="text-sky-500">→</span> Architect scalable component libraries using Tailwind.
            </li>
            <li className="flex gap-2">
              <span className="text-sky-500">→</span> Optimize React rendering performance for high-traffic views.
            </li>
            <li className="flex gap-2">
              <span className="text-sky-500">→</span> Ensure WCAG accessibility compliance.
            </li>
          </ul>
        </div>
      </div>
    )
  },
  guide: {
    title: "Technical Interview Guide",
    tags: ["Competency Based", "Duration: 60m"],
    content: (
      <div className="space-y-4">
         <div className="p-3 rounded bg-neutral-900/50 border border-white/5">
            <div className="flex justify-between mb-1">
                <span className="text-[10px] font-mono text-sky-400 uppercase">Q1 :: Performance</span>
                <span className="text-[10px] text-neutral-500">15 min</span>
            </div>
            <p className="text-sm text-neutral-200">"Describe a time you diagnosed a significant rendering bottleneck in a React application. What tools did you use?"</p>
         </div>
         <div className="p-3 rounded bg-neutral-900/50 border border-white/5">
            <div className="flex justify-between mb-1">
                <span className="text-[10px] font-mono text-sky-400 uppercase">Q2 :: System Design</span>
                <span className="text-[10px] text-neutral-500">20 min</span>
            </div>
            <p className="text-sm text-neutral-200">"How would you architect a multi-theme component library using Tailwind to ensure long-term maintainability?"</p>
         </div>
      </div>
    )
  },
  screening: {
    title: "Pre-Screening Protocol",
    tags: ["Auto-Reject Criteria", "Keywords"],
    content: (
      <div className="space-y-3">
         <div className="flex items-start gap-3 p-3 rounded border border-white/5 bg-white/[0.02]">
             <div className="mt-0.5 w-4 h-4 rounded-full border border-sky-500/30 flex items-center justify-center text-[8px] text-sky-400">1</div>
             <div>
                <p className="text-sm text-neutral-300 mb-1">Are you comfortable working primarily during EST business hours?</p>
                <span className="text-[10px] text-green-500/80 font-mono bg-green-500/10 px-1.5 py-0.5 rounded">Must confirm</span>
             </div>
         </div>
         <div className="flex items-start gap-3 p-3 rounded border border-white/5 bg-white/[0.02]">
             <div className="mt-0.5 w-4 h-4 rounded-full border border-sky-500/30 flex items-center justify-center text-[8px] text-sky-400">2</div>
             <div>
                <p className="text-sm text-neutral-300 mb-1">Briefly explain your experience with WAI-ARIA standards.</p>
                <div className="flex gap-1 mt-1">
                   <span className="text-[10px] text-sky-500/80 bg-sky-500/10 px-1.5 py-0.5 rounded">Keywords: semantic, roles, contrast</span>
                </div>
             </div>
         </div>
      </div>
    )
  }
};

const TransformationDemo = () => {
  const [activeTab, setActiveTab] = useState<'jd' | 'guide' | 'screening'>('jd');

  return (
    <section className="py-20 md:py-24 bg-[#050505] relative overflow-hidden border-t border-white/5">
      {/* Background Decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] md:w-[800px] h-[400px] bg-sky-500/5 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="max-w-screen-xl mx-auto px-4 md:px-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16 gap-6">
           <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[10px] font-mono uppercase tracking-wider mb-4">
                    Live Transformation
                </div>
                <h2 className="text-3xl md:text-4xl font-medium text-white mb-4 tracking-tight">From Chaos to Clarity.</h2>
                <p className="text-base md:text-lg text-neutral-500 font-light leading-relaxed">
                    See how RecruitBox interprets unstructured hiring notes and instantly compiles them into specific, actionable recruitment assets.
                </p>
           </div>
           
           {/* Tab Switcher for Demo */}
           <div className="flex bg-[#0A0A0A] p-1 rounded-lg border border-white/10 w-full md:w-auto overflow-x-auto no-scrollbar">
                {(['jd', 'guide', 'screening'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-md text-xs font-medium transition-all duration-300 whitespace-nowrap flex-1 md:flex-none ${
                            activeTab === tab 
                            ? 'bg-white text-black shadow-lg' 
                            : 'text-neutral-500 hover:text-white'
                        }`}
                    >
                        {tab === 'jd' ? 'Job Description' : tab === 'guide' ? 'Interview Guide' : 'Screening'}
                    </button>
                ))}
           </div>
        </div>

        {/* The Demo Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-11 gap-8 items-start">
            
            {/* Left: Raw Input */}
            <div className="lg:col-span-5 relative group order-1">
                <div className="absolute -inset-0.5 bg-gradient-to-br from-white/10 to-transparent rounded-2xl blur opacity-50 transition duration-500 group-hover:opacity-75"></div>
                <div className="relative bg-[#080808] rounded-xl border border-white/5 p-6 flex flex-col shadow-2xl">
                    <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-4">
                        <div className="w-3 h-3 rounded-full bg-neutral-700"></div>
                        <span className="text-xs font-mono text-neutral-500">hiring_notes.txt</span>
                    </div>
                    <div className="font-mono text-xs md:text-sm text-neutral-400 leading-relaxed whitespace-pre-wrap opacity-80">
                        {RAW_INPUT}
                    </div>
                    <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-neutral-600">
                        <span>248 chars</span>
                        <span>Unstructured</span>
                    </div>
                </div>
            </div>

            {/* Center: Processing Visualization */}
            <div className="lg:col-span-1 flex lg:flex-col items-center justify-center gap-2 relative py-4 lg:py-0 self-stretch order-2">
                <div className="hidden lg:block w-px h-full bg-gradient-to-b from-transparent via-white/10 to-transparent absolute left-1/2 -translate-x-1/2"></div>
                <div className="block lg:hidden w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent absolute top-1/2 -translate-y-1/2"></div>
                
                <div className="w-10 h-10 rounded-full bg-[#0A0A0A] border border-sky-500/30 flex items-center justify-center z-10 shadow-[0_0_20px_rgba(14,165,233,0.15)]">
                     <svg className="w-5 h-5 text-sky-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                     </svg>
                </div>
            </div>

            {/* Right: Structured Output */}
            <div className="lg:col-span-5 relative group order-3">
                <div className="absolute -inset-0.5 bg-gradient-to-bl from-sky-500/20 to-transparent rounded-2xl blur opacity-50 transition duration-500 group-hover:opacity-75"></div>
                <div className="relative bg-[#0A0A0A] rounded-xl border border-white/10 p-1 flex flex-col shadow-2xl overflow-hidden">
                    {/* Window Bar */}
                    <div className="h-9 bg-[#0F0F0F] border-b border-white/5 flex items-center justify-between px-4 rounded-t-lg">
                        <span className="text-[10px] font-medium text-sky-500 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                            RecruitBox Output
                        </span>
                        <div className="flex gap-1.5">
                             <div className="w-2 h-2 rounded-full bg-neutral-700"></div>
                             <div className="w-2 h-2 rounded-full bg-neutral-700"></div>
                        </div>
                    </div>

                    {/* Content Body */}
                    <div className="p-6 flex flex-col transition-all duration-500 animate-slide-up key={activeTab}">
                         <div className="mb-6 pb-6 border-b border-white/5">
                             <h3 className="text-xl font-semibold text-white mb-2">{OUTPUT_DATA[activeTab].title}</h3>
                             <div className="flex flex-wrap gap-2">
                                 {OUTPUT_DATA[activeTab].tags.map((tag, i) => (
                                     <span key={i} className="px-2 py-1 rounded bg-white/5 border border-white/5 text-[10px] text-neutral-400 font-mono">
                                         {tag}
                                     </span>
                                 ))}
                             </div>
                         </div>
                         
                         <div className="flex-1">
                             {OUTPUT_DATA[activeTab].content}
                         </div>

                         <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                             <div className="flex items-center gap-2">
                                 <button className="p-1.5 rounded hover:bg-white/5 text-neutral-500 hover:text-white transition-colors">
                                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                 </button>
                                 <button className="p-1.5 rounded hover:bg-white/5 text-neutral-500 hover:text-white transition-colors">
                                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                 </button>
                             </div>
                             <div className="text-[10px] font-mono text-sky-500/70 flex items-center gap-1">
                                 <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                 Verified
                             </div>
                         </div>
                    </div>
                </div>
            </div>

        </div>
      </div>
    </section>
  );
};

export default TransformationDemo;
