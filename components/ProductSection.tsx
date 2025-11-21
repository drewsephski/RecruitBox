import React, { useRef, useEffect } from 'react';
import RecruitmentSandbox from './RecruitmentSandbox';

interface ProductSectionProps {
  scrollbar: any; // Using any because smooth-scrollbar types are not strictly available in this env
}

const ProductSection: React.FC<ProductSectionProps> = ({ scrollbar }) => {
  const productWrapperRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scrollbar || !productWrapperRef.current || !sidebarRef.current) return;

    const listener = () => {
      const isDesktop = window.innerWidth >= 1024;
      // @ts-ignore
      if (!isDesktop && sidebarRef.current) {
        // @ts-ignore
        sidebarRef.current.style.transform = '';
        return;
      }

      // @ts-ignore
      if (productWrapperRef.current && sidebarRef.current) {
        const wrapperRect = productWrapperRef.current.getBoundingClientRect();
        const sidebarHeight = sidebarRef.current.offsetHeight;
        const wrapperHeight = wrapperRect.height;

        // Target top position (e.g. 128px from viewport top, approx matching top-32)
        const stickyTop = 128;

        let y = 0;
        // If wrapper top is above sticky point (scrolling down), we push sidebar down relative to wrapper
        if (wrapperRect.top < stickyTop) {
          y = stickyTop - wrapperRect.top;
        }

        // Clamp to bottom of wrapper so it doesn't overflow
        const maxY = wrapperHeight - sidebarHeight;
        y = Math.min(y, maxY);
        y = Math.max(y, 0);

        sidebarRef.current.style.transform = `translate3d(0, ${y}px, 0)`;
      }
    };

    scrollbar.addListener(listener);

    return () => {
      scrollbar.removeListener(listener);
    };
  }, [scrollbar]);

  return (
    <section id="product" className="relative z-20 py-20 lg:py-32 bg-[#050505] border-t border-white/5">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6">
        <div ref={productWrapperRef} className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          <div className="lg:col-span-4 relative">
            <div ref={sidebarRef} className="space-y-10 will-change-transform">
              <div>
                <h2 className="text-4xl md:text-5xl font-semibold tracking-tighter text-white mb-6">The Recruitment <br />Studio</h2>
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
          </div>

          <div className="lg:col-span-8">
            <RecruitmentSandbox />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductSection;