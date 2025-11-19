import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from './ui/Button';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [type, setType] = useState('performance');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate network request
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setSubmitted(true);
    setTimeout(() => {
        setSubmitted(false);
        setMessage('');
        onClose();
    }, 2000);
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-[#0A0A0A] border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-slide-up">
         {/* Header */}
         <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between bg-[#0F0F0F]">
            <h3 className="text-sm font-medium text-white">Submit Feedback</h3>
            <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
         </div>

         {/* Content */}
         <div className="p-5">
            {submitted ? (
                <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 mb-2 border border-green-500/20">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <h4 className="text-white font-medium">Feedback Sent</h4>
                    <p className="text-sm text-neutral-500">Thank you for helping us improve RecruitBox.</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">Feedback Type</label>
                        <div className="grid grid-cols-3 gap-2">
                            {['performance', 'feature', 'bug'].map((t) => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => setType(t)}
                                    className={`px-3 py-2 rounded-md text-xs font-medium border transition-all ${type === t ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'bg-[#050505] text-neutral-400 border-white/10 hover:border-white/20 hover:text-neutral-200'}`}
                                >
                                    {t.charAt(0).toUpperCase() + t.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                         <label className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">Description</label>
                         <textarea 
                            required
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Tell us about your experience..."
                            className="w-full h-32 bg-[#050505] border border-white/10 rounded-md p-3 text-sm text-neutral-200 placeholder:text-neutral-700 focus:outline-none focus:border-white/20 focus:ring-0 resize-none transition-colors"
                         />
                    </div>

                    <div className="pt-2">
                        <Button type="submit" isLoading={isSubmitting} className="w-full justify-center">
                            Submit Report
                        </Button>
                    </div>
                </form>
            )}
         </div>
      </div>
    </div>,
    document.body
  );
};

export default FeedbackModal;