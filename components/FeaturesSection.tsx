
import React from 'react';

const FeatureCard = ({ title, description, icon, children, className = "" }: { title: string, description: string, icon: React.ReactNode, children?: React.ReactNode, className?: string }) => (
  <div className={`group relative overflow-hidden rounded-2xl bg-[#0A0A0A] border border-white/5 p-6 md:p-8 hover:border-white/10 transition-colors duration-500 ${className}`}>
    <div className="relative z-10 h-full flex flex-col">
      <div className="mb-6 w-12 h-12 rounded-lg bg-white/[0.03] border border-white/5 flex items-center justify-center text-white group-hover:text-sky-400 transition-colors duration-300">
        {icon}
      </div>
      <h3 className="text-lg font-medium text-white mb-2 tracking-tight">{title}</h3>
      <p className="text-sm text-neutral-400 leading-relaxed">{description}</p>
      {children && <div className="mt-auto pt-6">{children}</div>}
    </div>
    <div className="absolute inset-0 bg-gradient-to-br from-sky-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
  </div>
);

const FeaturesSection = () => {
  return (
    <section className="py-20 md:py-32 relative z-20 bg-[#050505] border-t border-white/5">
      <div className="max-w-screen-xl mx-auto px-4 md:px-6">
        <div className="max-w-2xl mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-medium text-white mb-6 tracking-tight">The Agency Operating System</h2>
          <p className="text-base md:text-lg text-neutral-500 font-light leading-relaxed">
            RecruitBox is built for high-volume recruitment agencies and startups that need speed without sacrificing quality.
            Stop writing JDs from scratch. Start operating at scale.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {/* Card 1: Speed */}
          <FeatureCard
            title="Instant Asset Generation"
            description="Turn a 30-second voice note or messy Slack dump into a polished Job Description and Interview Guide in under 5 seconds."
            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
            className="md:col-span-2"
          >
            <div className="mt-6 h-32 w-full bg-[#050505] border border-white/5 rounded-lg p-4 font-mono text-[10px] text-neutral-500 overflow-hidden relative flex items-center gap-4">
              <div className="w-1/3 h-full bg-[#0A0A0A] rounded border border-white/5 p-3 flex flex-col gap-2 opacity-50">
                <div className="h-2 w-12 bg-white/10 rounded"></div>
                <div className="h-1 w-full bg-white/5 rounded"></div>
                <div className="h-1 w-3/4 bg-white/5 rounded"></div>
              </div>
              <div className="text-sky-500 animate-pulse">-&gt;</div>
              <div className="flex-1 h-full bg-[#0A0A0A] rounded border border-sky-500/20 p-3 flex flex-col gap-2 shadow-[0_0_30px_-10px_rgba(14,165,233,0.15)]">
                <div className="flex justify-between">
                  <div className="h-2 w-24 bg-white/20 rounded"></div>
                  <div className="h-2 w-8 bg-sky-500/20 rounded"></div>
                </div>
                <div className="h-1 w-full bg-white/10 rounded"></div>
                <div className="h-1 w-full bg-white/10 rounded"></div>
                <div className="h-1 w-5/6 bg-white/10 rounded"></div>
                <div className="mt-auto flex gap-2">
                  <div className="h-4 w-12 bg-white/5 rounded border border-white/5"></div>
                  <div className="h-4 w-12 bg-white/5 rounded border border-white/5"></div>
                </div>
              </div>
            </div>
          </FeatureCard>

          {/* Card 2: Tone Control */}
          <FeatureCard
            title="Brand Voice Control"
            description="Configure the engine to match your client's culture. Switch between 'Corporate Enterprise', 'Fast-Paced Startup', or 'Executive Search' modes."
            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>}
          >
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] text-neutral-400">Professional</span>
              <span className="px-2 py-1 rounded bg-sky-500/10 border border-sky-500/20 text-[10px] text-sky-400">Startup</span>
              <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] text-neutral-400">Technical</span>
            </div>
          </FeatureCard>

          {/* Card 3: Structure */}
          <FeatureCard
            title="Structured Output"
            description="Stop fighting with formatting. Get clean Markdown and valid JSON ready for direct ATS integration or API consumption."
            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>}
          />

          {/* Card 4: Screening */}
          <FeatureCard
            title="Smart Screening"
            description="Auto-generated pre-screening questions with 'Ideal Answer' keywords to help junior recruiters filter candidates faster."
            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />

          {/* Card 5: Security */}
          <FeatureCard
            title="Enterprise Privacy"
            description="Your data is isolated. We are SOC2 Type II ready and provide zero-retention guarantees for sensitive hiring data."
            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
          />
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
