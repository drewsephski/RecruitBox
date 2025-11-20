import React, { useState, useEffect } from 'react';
import { generateRecruitmentAssets } from '../services/geminiService';
import { RecruitmentResult, GenerationConfig, SavedTemplate } from '../types';
import { Button } from './ui/Button';
import { Select } from './ui/Select';
import { Tooltip } from './ui/Tooltip';
import { useUser } from '../contexts/UserContext';

const EXAMPLE_TEMPLATES: SavedTemplate[] = [
  {
    id: 'template_ex_1',
    name: 'Example: Sr. React Engineer',
    notes: "Role: Senior Frontend Engineer\nStack: React, TypeScript, Tailwind\nExperience: 5+ years\nFocus: Design Systems, Performance, Accessibility\nVibe: High-growth startup, fast-paced.",
    config: { tone: 'startup', seniority: 'senior' },
    timestamp: Date.now(),
    result: {
      jobDescription: {
        title: "Senior Frontend Engineer",
        summary: "We are looking for a battle-tested Frontend Engineer to lead our Design System architecture. You will work at the intersection of design and engineering, building the foundational components that power our entire product suite.",
        responsibilities: [
            "Architect and maintain a multi-brand design system using React, TypeScript, and Tailwind CSS.",
            "Collaborate with product designers to define API contracts for UI components.",
            "Optimize application performance, ensuring 90+ Lighthouse scores.",
            "Mentor junior engineers on accessibility (WCAG 2.1) and modern CSS patterns."
        ],
        requirements: [
            "5+ years of experience with modern JavaScript ecosystems.",
            "Deep understanding of React internals (hooks, context, reconciliation).",
            "Experience building component libraries in a team environment.",
            "Strong opinion on testing strategies (Jest, Cypress, Playwright)."
        ],
        benefits: [
            "Competitive Equity Package",
            "Remote-First Culture",
            "Home Office Stipend",
            "Annual Retreats"
        ]
      },
      interviewGuide: [
        {
            question: "Describe a time you had to refactor a legacy component. How did you ensure no regressions?",
            competency: "Technical Execution",
            evaluationCriteria: "Look for mentions of testing strategies, incremental migration, and feature flags."
        },
        {
            question: "How do you approach state management in a complex application?",
            competency: "System Design",
            evaluationCriteria: "Should discuss trade-offs between local state, context, and server state (e.g., React Query)."
        }
      ],
      screeningQuestions: [
        {
            question: "How many years of React experience do you have?",
            idealAnswerKeywords: ["5+", "5 years", "Senior"]
        },
        {
            question: "Have you worked with Tailwind CSS in production?",
            idealAnswerKeywords: ["Yes", "Production", "Config"]
        }
      ]
    }
  },
  {
    id: 'template_ex_2',
    name: 'Example: Product Marketing Mgr',
    notes: "Role: Product Marketing Manager\nFocus: B2B SaaS, Go-to-Market\nKey Skills: Positioning, Sales Enablement, Copywriting\nExperience: 3-5 years",
    config: { tone: 'corporate', seniority: 'mid' },
    timestamp: Date.now(),
    result: {
      jobDescription: {
        title: "Product Marketing Manager",
        summary: "We are seeking a strategic Product Marketing Manager to drive the go-to-market strategy for our enterprise SaaS solutions. You will craft compelling messaging, enable our sales team, and orchestrate product launches.",
        responsibilities: [
            "Develop clear, differentiated positioning and messaging for new products.",
            "Create high-impact sales enablement assets (decks, one-pagers, battle cards).",
            "Lead cross-functional GTM teams for feature launches.",
            "Conduct competitive analysis and market research."
        ],
        requirements: [
            "3+ years of Product Marketing experience in B2B SaaS.",
            "Exceptional copywriting and storytelling skills.",
            "Proven ability to translate technical features into business value.",
            "Experience working closely with Sales and Product teams."
        ],
        benefits: [
            "Comprehensive Health Coverage",
            "401(k) Matching",
            "Professional Development Budget",
            "Hybrid Work Model"
        ]
      },
      interviewGuide: [
         {
            question: "Walk me through a product launch you managed. What went well and what didn't?",
            competency: "Project Management",
            evaluationCriteria: "Look for cross-functional coordination, metric tracking, and lessons learned."
         },
         {
            question: "How do you handle a situation where Sales disagrees with your messaging?",
            competency: "Stakeholder Management",
            evaluationCriteria: "Assess ability to listen, use data to support decisions, and find common ground."
         }
      ],
      screeningQuestions: [
        {
            question: "Do you have experience with B2B Enterprise SaaS?",
            idealAnswerKeywords: ["Yes", "Enterprise", "B2B"]
        },
        {
            question: "Share a link to a piece of content you wrote.",
            idealAnswerKeywords: ["Portfolio", "Link", "Writing"]
        }
      ]
    }
  }
];

const encodeState = (data: any) => {
    try {
        return btoa(unescape(encodeURIComponent(JSON.stringify(data))));
    } catch (e) {
        return "";
    }
};

const decodeState = (str: string) => {
    try {
        return JSON.parse(decodeURIComponent(escape(window.atob(str))));
    } catch (e) {
        return null;
    }
};

const RecruitmentSandbox: React.FC = () => {
  const { isPro, openPaywall } = useUser();
  const [notes, setNotes] = useState('');
  const [config, setConfig] = useState<GenerationConfig>({ tone: 'corporate', seniority: 'mid' });
  const [result, setResult] = useState<RecruitmentResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'jd' | 'guide' | 'screening'>('jd');
  const [copied, setCopied] = useState(false);

  // Template State
  const [templates, setTemplates] = useState<SavedTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [isNamingTemplate, setIsNamingTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');
  
  // Sharing State
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);

  // Initialize and Check URL Params
  useEffect(() => {
    // 1. Load Saved Assets
    const saved = localStorage.getItem('recruitbox_templates');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTemplates(parsed);
        } else {
          setTemplates(EXAMPLE_TEMPLATES);
          localStorage.setItem('recruitbox_templates', JSON.stringify(EXAMPLE_TEMPLATES));
        }
      } catch (e) {
        console.error("Failed to load templates", e);
        setTemplates(EXAMPLE_TEMPLATES);
      }
    } else {
      setTemplates(EXAMPLE_TEMPLATES);
      localStorage.setItem('recruitbox_templates', JSON.stringify(EXAMPLE_TEMPLATES));
    }

    // 2. Check for Shared Link
    const params = new URLSearchParams(window.location.search);
    const shareData = params.get('share');
    if (shareData) {
        const decoded = decodeState(shareData);
        if (decoded && decoded.result) {
            setNotes(decoded.notes || '');
            setConfig(decoded.config || { tone: 'corporate', seniority: 'mid' });
            setResult(decoded.result);
            // Optional: Clean URL without reloading
            window.history.replaceState({}, '', window.location.pathname);
        }
    }
  }, []);

  const handleGenerate = async () => {
    if (!notes.trim()) return;
    
    // PAYWALL CHECK
    if (!isPro) {
        openPaywall();
        return;
    }

    setLoading(true);
    setResult(null);
    setSelectedTemplateId(''); // Clear template selection on new generation
    try {
      const data = await generateRecruitmentAssets(notes, config);
      setResult(data);
    } catch (e) {
      alert("Generation failed. Please check your API configuration.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTemplate = () => {
    if (!templateName.trim() || !result) return;
    
    const newTemplate: SavedTemplate = {
      id: Date.now().toString(),
      name: templateName,
      notes,
      config,
      result,
      timestamp: Date.now()
    };

    const updatedTemplates = [newTemplate, ...templates];
    setTemplates(updatedTemplates);
    localStorage.setItem('recruitbox_templates', JSON.stringify(updatedTemplates));
    
    setSelectedTemplateId(newTemplate.id);
    setIsNamingTemplate(false);
    setTemplateName('');
  };

  const handleLoadTemplate = (id: string) => {
    if (!id) {
      setSelectedTemplateId('');
      setNotes('');
      setResult(null);
      return;
    }

    const template = templates.find(t => t.id === id);
    if (template) {
      setSelectedTemplateId(id);
      setNotes(template.notes);
      setConfig(template.config);
      setResult(template.result);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    let textToCopy = "";
    if (activeTab === 'jd') {
      textToCopy = `${result.jobDescription.title}\n\n${result.jobDescription.summary}\n\nResponsibilities:\n${result.jobDescription.responsibilities.map(r => `- ${r}`).join('\n')}\n\nRequirements:\n${result.jobDescription.requirements.map(r => `- ${r}`).join('\n')}`;
    } else if (activeTab === 'guide') {
      textToCopy = result.interviewGuide.map((q, i) => `Q${i+1}: ${q.question}\nCriteria: ${q.evaluationCriteria}`).join('\n\n');
    } else {
      textToCopy = result.screeningQuestions.map((q, i) => `Q${i+1}: ${q.question}\nKeywords: ${q.idealAnswerKeywords.join(', ')}`).join('\n\n');
    }

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
      if (!isPro) {
          openPaywall();
          return;
      }
      if (!result) return;

      const payload = { notes, config, result };
      const encoded = encodeState(payload);
      const url = `${window.location.origin}${window.location.pathname}?share=${encoded}`;
      
      setShareLink(url);
      setIsShareModalOpen(true);
      setLinkCopied(false);
  };

  const copyShareLink = () => {
      navigator.clipboard.writeText(shareLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
  };

  // Generate fake line numbers based on content
  const lineCount = Math.max(15, notes.split('\n').length);
  const lines = Array.from({ length: lineCount }, (_, i) => i + 1);

  const toneOptions = [
    { value: 'corporate', label: 'Corporate Enterprise' },
    { value: 'startup', label: 'Startup / Modern' },
    { value: 'executive', label: 'Executive Search' }
  ];

  const seniorityOptions = [
    { value: 'entry', label: 'Entry Level' },
    { value: 'mid', label: 'Mid-Senior' },
    { value: 'senior', label: 'Senior Staff' },
    { value: 'lead', label: 'Lead / Principal' }
  ];

  const templateOptions = [
    { value: '', label: 'New / Custom Workspace' },
    ...templates.map(t => ({ value: t.id, label: t.name }))
  ];

  return (
    <div className="flex flex-col h-auto min-h-[700px] lg:h-[800px] w-full max-w-full bg-[#080808] rounded-xl border border-white/10 overflow-hidden shadow-2xl transition-all duration-500 group relative z-10">
      {/* Toolbar / Header */}
      <div className="h-14 border-b border-white/5 flex items-center justify-between px-4 bg-[#0A0A0A] overflow-hidden">
        <div className="flex items-center gap-4 shrink-0">
           <div className="flex gap-2 shrink-0">
             <div className="w-2.5 h-2.5 rounded-full bg-neutral-700/50 group-hover:bg-[#FF5F56] transition-colors"></div>
             <div className="w-2.5 h-2.5 rounded-full bg-neutral-700/50 group-hover:bg-[#FFBD2E] transition-colors"></div>
             <div className="w-2.5 h-2.5 rounded-full bg-neutral-700/50 group-hover:bg-[#27C93F] transition-colors"></div>
           </div>
           <div className="h-5 w-px bg-white/5 mx-2 hidden sm:block"></div>
           <div className="hidden sm:flex items-center gap-2 text-[12px] font-medium text-white whitespace-nowrap">
             <svg className="w-4 h-4 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
             </svg>
             <span>RecruitBox Studio</span>
             {!isPro && <span className="ml-2 px-1.5 py-0.5 rounded bg-neutral-800 text-[10px] text-neutral-400 uppercase tracking-wide hidden md:inline-block">Free Tier</span>}
             {isPro && <span className="ml-2 px-1.5 py-0.5 rounded bg-sky-500/10 border border-sky-500/20 text-[10px] text-sky-400 uppercase tracking-wide hidden md:inline-block">Pro Active</span>}
           </div>
        </div>
        
        <div className="flex items-center gap-3 shrink-0">
             {loading && (
               <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20">
                 <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse"></span>
                 <span className="text-[10px] font-mono text-sky-400 animate-pulse uppercase tracking-wider">Reasoning</span>
               </div>
             )}
             
             {result && !isNamingTemplate && (
               <div className="flex items-center gap-2">
                 <Tooltip content="Shareable read-only link">
                    <button 
                        onClick={handleShare}
                        className="h-8 w-8 flex items-center justify-center rounded hover:bg-white/5 text-neutral-400 hover:text-white transition-colors border border-transparent hover:border-white/10"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                    </button>
                 </Tooltip>

                 <Tooltip content="Save as new version">
                    <button 
                      onClick={() => setIsNamingTemplate(true)}
                      className="h-8 w-8 flex items-center justify-center rounded hover:bg-white/5 text-neutral-400 hover:text-white transition-colors border border-transparent hover:border-white/10"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                    </button>
                 </Tooltip>
                 <Button variant="ghost" size="sm" className="h-8 text-[10px] uppercase tracking-wider" onClick={handleCopy}>
                    {copied ? 'Copied' : 'Copy'}
                 </Button>
               </div>
             )}

             {isNamingTemplate && (
               <div className="absolute right-4 top-3 z-50 bg-[#0A0A0A] p-1 border border-white/10 rounded-md shadow-xl flex items-center gap-2 animate-slide-in">
                 <input 
                    autoFocus
                    type="text" 
                    placeholder="Version Name..." 
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    className="h-8 bg-[#050505] border border-white/10 rounded px-3 text-xs text-white focus:outline-none focus:border-sky-500/50 w-32 md:w-40"
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveTemplate()}
                 />
                 <button onClick={handleSaveTemplate} disabled={!templateName} className="h-8 px-3 bg-sky-600 hover:bg-sky-500 text-white rounded text-xs font-medium transition-colors disabled:opacity-50">Save</button>
                 <button onClick={() => setIsNamingTemplate(false)} className="h-8 w-8 flex items-center justify-center text-neutral-400 hover:text-white"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
               </div>
             )}
        </div>
      </div>

      {/* Share Modal */}
      {isShareModalOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-slide-up">
             <div className="w-full max-w-md bg-[#0F0F0F] border border-white/10 rounded-xl shadow-2xl p-6">
                 <div className="flex justify-between items-center mb-4">
                     <h3 className="text-white font-medium">Share Asset</h3>
                     <button onClick={() => setIsShareModalOpen(false)} className="text-neutral-500 hover:text-white">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                     </button>
                 </div>
                 <p className="text-sm text-neutral-400 mb-4">
                     Anyone with this link can view this Job Description and Interview Guide. The link contains all asset data.
                 </p>
                 <div className="flex gap-2">
                     <input 
                        type="text" 
                        readOnly 
                        value={shareLink} 
                        className="flex-1 bg-black border border-white/10 rounded px-3 py-2 text-xs text-neutral-300 font-mono focus:outline-none"
                     />
                     <Button onClick={copyShareLink} size="sm" className={linkCopied ? "bg-green-600 text-white border-green-600" : ""}>
                        {linkCopied ? "Copied" : "Copy"}
                     </Button>
                 </div>
             </div>
          </div>
      )}

      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        {/* Sidebar (Inputs) */}
        <div className="w-full lg:w-[35%] h-[450px] lg:h-auto border-b lg:border-b-0 lg:border-r border-white/5 bg-[#050505] flex flex-col relative transition-all duration-300 z-10 order-1 lg:order-1">
           
           {/* Configuration Panel */}
           <div className="p-4 border-b border-white/5 flex flex-col gap-4 relative z-20 bg-[#050505]">
              <div className="w-full">
                <Select 
                  label="Saved Assets Library"
                  value={selectedTemplateId}
                  options={templateOptions}
                  onChange={handleLoadTemplate}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Select 
                  label="Tone"
                  value={config.tone}
                  options={toneOptions}
                  onChange={(val) => setConfig({...config, tone: val as any})}
                />
                <Select 
                  label="Seniority"
                  value={config.seniority}
                  options={seniorityOptions}
                  onChange={(val) => setConfig({...config, seniority: val as any})}
                />
              </div>
           </div>

           {/* Editor Area */}
           <div className="flex-1 flex relative group/editor bg-[#050505] z-10 overflow-hidden">
              {/* Line Numbers */}
              <div className="w-12 flex flex-col items-end pr-3 pt-4 bg-transparent text-neutral-800 font-mono text-xs select-none border-r border-white/[0.02] h-full overflow-hidden shrink-0">
                {lines.map(line => (
                  <div key={line} className="h-6 leading-6">{line}</div>
                ))}
              </div>

              {/* Textarea */}
              <div className="flex-1 relative h-full min-w-0">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  onWheel={(e) => e.stopPropagation()}
                  placeholder="// Paste raw role requirements, hiring manager notes, or Slack dumps here..."
                  className="w-full h-full bg-transparent border-none resize-none focus:ring-0 text-xs font-mono text-neutral-300 placeholder:text-neutral-700 leading-6 p-0 pt-4 pl-4 selection:bg-sky-500/20 focus:outline-none transition-opacity"
                  spellCheck="false"
                />
              </div>
           </div>

           {/* Action Bar */}
           <div className="p-4 bg-[#080808] border-t border-white/5 flex flex-wrap justify-between items-center z-20 relative gap-4">
              <div className="flex flex-col shrink-0">
                 <span className="text-[10px] font-mono text-neutral-500 uppercase">Context Buffer</span>
                 <span className="text-[10px] font-mono text-neutral-300">{notes.length} chars</span>
              </div>
              
              {/* Generate Button - Wrapped with logic */}
              <div className="relative group shrink-0">
                  {!isPro && (
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-sky-500 text-black text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                          Upgrade to Generate
                      </div>
                  )}
                  <Button 
                     onClick={handleGenerate} 
                     isLoading={loading} 
                     disabled={!notes.trim()} 
                     size="sm"
                     className={`relative overflow-hidden group shadow-[0_0_25px_-5px_rgba(14,165,233,0.5)] hover:shadow-[0_0_40px_-10px_rgba(14,165,233,0.8)] cursor-pointer border border-sky-400/30 bg-size-[200%_100%] hover:bg-[position:100%_0] transition-all duration-500 text-white font-bold font-mono text-[10px] uppercase tracking-widest px-4 md:px-6 h-9 ${!isPro ? 'opacity-90' : ''}`}
                   >
                      <span className="relative z-10 flex items-center gap-2 whitespace-nowrap">
                        {isPro ? 'Generate' : 'Generate (Pro)'}
                        {!loading && <svg className="size-4 text-sky-400 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                      </span>
                      <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-0 pointer-events-none"></div>
                   </Button>
               </div>
           </div>
        </div>

        {/* Main Content (Output) */}
        <div className="flex-1 flex flex-col bg-[#0A0A0A] relative order-2 lg:order-2 min-h-[500px] lg:min-h-0 overflow-hidden">
           {/* Tabs */}
           <div className="h-10 border-b border-white/5 flex items-center bg-[#080808] overflow-x-auto no-scrollbar">
              <Tooltip content="View generated job description" className="h-full shrink-0">
                <button 
                  onClick={() => result && setActiveTab('jd')}
                  disabled={!result}
                  className={`px-4 h-full text-[11px] font-mono border-r border-white/5 transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${activeTab === 'jd' && result ? 'bg-[#0A0A0A] text-sky-400 border-t-2 border-t-sky-500' : 'text-neutral-600 hover:text-neutral-400'}`}
                >
                  job_description.md
                </button>
              </Tooltip>
              
              <Tooltip content="View structured interview questions" className="h-full shrink-0">
                <button 
                  onClick={() => result && setActiveTab('guide')}
                  disabled={!result}
                  className={`px-4 h-full text-[11px] font-mono border-r border-white/5 transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${activeTab === 'guide' && result ? 'bg-[#0A0A0A] text-sky-400 border-t-2 border-t-sky-500' : 'text-neutral-600 hover:text-neutral-400'}`}
                >
                  interview_guide.json
                </button>
              </Tooltip>

              <Tooltip content="View candidate screening logic" className="h-full shrink-0">
                <button 
                  onClick={() => result && setActiveTab('screening')}
                  disabled={!result}
                  className={`px-4 h-full text-[11px] font-mono border-r border-white/5 transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${activeTab === 'screening' && result ? 'bg-[#0A0A0A] text-sky-400 border-t-2 border-t-sky-500' : 'text-neutral-600 hover:text-neutral-400'}`}
                >
                  screening.ts
                </button>
              </Tooltip>
           </div>

           {/* Content Area */}
           <div 
             className="flex-1 overflow-y-auto custom-scrollbar relative bg-[#0A0A0A]"
             onWheel={(e) => e.stopPropagation()}
           >
              {!result && !loading && (
                 <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30 pointer-events-none select-none p-6 text-center">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-b from-white/5 to-transparent border border-white/10 flex items-center justify-center mb-6">
                        <svg className="w-10 h-10 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2">Awaiting Context</h3>
                    <p className="text-xs font-mono text-neutral-500 uppercase tracking-widest max-w-xs text-center leading-relaxed">
                        Input your rough notes or load a saved asset to generate comprehensive recruitment packs.
                    </p>
                 </div>
              )}

              {loading && (
                 <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0A0A0A]/80 backdrop-blur-sm z-10">
                    <div className="font-mono text-xs text-sky-500 mb-3">gemini-3-pro :: thinking</div>
                    <div className="w-48 h-0.5 bg-neutral-800 rounded-full overflow-hidden">
                       <div className="h-full bg-sky-500 animate-shimmer w-1/3 rounded-full"></div>
                    </div>
                 </div>
              )}

              {result && (
                 <div className="relative p-6 md:p-8 lg:p-12">
                   {/* Enhanced glow effects for the result container */}
                   <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-sky-500/50 to-transparent opacity-50 animate-slide-up"></div>
                   <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-sky-500/[0.02] to-transparent mix-blend-overlay animate-slide-up"></div>
                   
                   {activeTab === 'jd' && (
                      <div key="jd" className="max-w-3xl mx-auto space-y-10 relative z-10 animate-slide-up" style={{ animationDuration: '0.4s' }}>
                         <div className="space-y-4 pb-8 border-b border-white/5">
                            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{result.jobDescription.title}</h1>
                            <p className="text-neutral-400 text-sm leading-relaxed">{result.jobDescription.summary}</p>
                         </div>
                         
                         <div className="grid gap-8">
                            <div className="bg-white/[0.02] p-6 rounded-lg border border-white/5 hover:border-white/10 transition-colors duration-500">
                               <h3 className="text-xs font-mono text-sky-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                 <span className="w-1.5 h-1.5 bg-sky-500 rounded-full shadow-[0_0_10px_rgba(14,165,233,0.5)]"></span> Responsibilities
                               </h3>
                               <ul className="space-y-3">
                                 {result.jobDescription.responsibilities.map((item, i) => (
                                    <li key={i} className="flex gap-4 text-sm text-neutral-300 group">
                                       <span className="text-neutral-600 font-mono text-xs mt-1 shrink-0 transition-colors group-hover:text-sky-500">0{i+1}</span>
                                       <span className="leading-relaxed group-hover:text-neutral-200 transition-colors">{item}</span>
                                    </li>
                                 ))}
                               </ul>
                            </div>

                            <div className="bg-white/[0.02] p-6 rounded-lg border border-white/5 hover:border-white/10 transition-colors duration-500">
                               <h3 className="text-xs font-mono text-sky-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                 <span className="w-1.5 h-1.5 bg-sky-500 rounded-full shadow-[0_0_10px_rgba(14,165,233,0.5)]"></span> Requirements
                               </h3>
                               <ul className="space-y-3">
                                 {result.jobDescription.requirements.map((item, i) => (
                                    <li key={i} className="flex gap-4 text-sm text-neutral-300 group">
                                       <span className="text-neutral-600 font-mono text-xs mt-1 shrink-0 transition-colors group-hover:text-sky-500">::</span>
                                       <span className="leading-relaxed group-hover:text-neutral-200 transition-colors">{item}</span>
                                    </li>
                                 ))}
                               </ul>
                            </div>
                         </div>

                         <div className="pt-6">
                            <h3 className="text-xs font-mono text-neutral-500 uppercase tracking-wider mb-3">Compensation & Perks</h3>
                            <div className="flex flex-wrap gap-2">
                               {result.jobDescription.benefits.map((item, i) => (
                                  <span key={i} className="px-3 py-1.5 rounded border border-white/10 bg-white/5 text-[11px] text-neutral-300 hover:border-sky-500/30 hover:bg-sky-500/5 transition-all cursor-default">
                                     {item}
                                  </span>
                               ))}
                            </div>
                         </div>
                      </div>
                   )}

                   {activeTab === 'guide' && (
                      <div key="guide" className="max-w-3xl mx-auto grid gap-4 relative z-10 animate-slide-up" style={{ animationDuration: '0.4s' }}>
                        <div className="text-sm text-neutral-500 mb-4 font-mono flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full bg-sky-500"></span>
                            Structured Interview Guide generated for {config.seniority} level assessment.
                        </div>
                        {result.interviewGuide.map((q, i) => (
                           <div key={i} className="bg-neutral-900/50 border border-white/5 p-6 rounded-lg hover:border-sky-500/30 transition-all duration-300 group relative overflow-hidden hover:shadow-[0_0_30px_-10px_rgba(14,165,233,0.1)]">
                              <div className="absolute top-0 left-0 w-0.5 h-full bg-sky-500/0 group-hover:bg-sky-500/50 transition-colors duration-300"></div>
                              <div className="flex flex-col gap-3">
                                 <div className="flex justify-between items-start">
                                     <span className="font-mono text-xs text-neutral-500 group-hover:text-sky-500/70 transition-colors">Question {i+1}</span>
                                     <span className="text-[10px] uppercase tracking-wider text-sky-400 bg-sky-500/10 px-2 py-1 rounded border border-sky-500/20">{q.competency}</span>
                                 </div>
                                 <p className="text-base text-neutral-200 font-medium leading-snug">{q.question}</p>
                                 <div className="mt-3 pt-3 border-t border-white/5">
                                    <p className="text-xs text-neutral-400 leading-relaxed flex gap-2">
                                       <span className="uppercase text-[10px] font-mono text-neutral-600 mt-0.5">Eval:</span>
                                       {q.evaluationCriteria}
                                    </p>
                                 </div>
                              </div>
                           </div>
                        ))}
                      </div>
                   )}

                   {activeTab === 'screening' && (
                       <div key="screening" className="max-w-3xl mx-auto space-y-6 relative z-10 animate-slide-up" style={{ animationDuration: '0.4s' }}>
                           <div className="text-sm text-neutral-500 mb-4 font-mono flex items-center gap-2">
                               <span className="w-1 h-1 rounded-full bg-sky-500"></span>
                               Pre-screening questions for initial candidate filtering.
                           </div>
                           {result.screeningQuestions.map((q, i) => (
                               <div key={i} className="bg-white/[0.02] border border-white/5 rounded-lg p-5 hover:bg-white/[0.04] transition-colors duration-300">
                                   <div className="flex items-start gap-3 mb-3">
                                       <div className="w-6 h-6 rounded bg-white/5 flex items-center justify-center text-xs font-mono text-neutral-400 border border-white/5">{i+1}</div>
                                       <p className="text-sm text-white pt-0.5">{q.question}</p>
                                   </div>
                                   <div className="ml-9 bg-black/30 rounded p-3 border border-white/5 hover:border-white/10 transition-colors">
                                       <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider block mb-2">Ideal Keywords</span>
                                       <div className="flex flex-wrap gap-1.5">
                                           {q.idealAnswerKeywords.map((k, idx) => (
                                               <span key={idx} className="text-xs text-sky-500/80 bg-sky-500/5 px-1.5 py-0.5 rounded border border-sky-500/10">{k}</span>
                                           ))}
                                       </div>
                                   </div>
                               </div>
                           ))}
                       </div>
                   )}
                 </div>
              )}
           </div>

           {/* Status Bar */}
           <div className="h-8 bg-[#080808] border-t border-white/5 flex items-center justify-between px-4 text-[10px] font-mono text-neutral-600 select-none">
               <div className="flex gap-4">
                  <span className="flex items-center gap-1.5">
                     <span className={`w-1.5 h-1.5 rounded-full ${loading ? 'bg-sky-500 animate-pulse' : 'bg-green-500'}`}></span>
                     {loading ? 'Processing...' : 'System Ready'}
                  </span>
                  <span className="hidden sm:inline">Model: gemini-3-pro-preview</span>
               </div>
               <div className="flex gap-4">
                   <span className="hidden sm:inline">Output: Structured JSON</span>
                   <span>{selectedTemplateId ? 'Saved Version Loaded' : 'Unsaved Session'}</span>
               </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default RecruitmentSandbox;