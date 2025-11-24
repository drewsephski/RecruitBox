
import React from 'react';
import { Button } from './ui/Button';
import { useUser } from '../contexts/UserContext';

const PricingCard = ({
    tier,
    price,
    description,
    features,
    highlight = false,
    onClick,
    buttonText
}: {
    tier: string,
    price: string,
    description: string,
    features: string[],
    highlight?: boolean,
    onClick?: () => void,
    buttonText?: string
}) => (
    <div className={`relative p-6 md:p-8 rounded-2xl border flex flex-col h-full transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] hover:-translate-y-0.5 ${highlight ? 'bg-[#0A0A0A] border-sky-500/30 shadow-[0_0_40px_-10px_rgba(14,165,233,0.15)] hover:shadow-[0_0_60px_-5px_rgba(14,165,233,0.2)] hover:border-sky-500/50' : 'bg-[#050505] border-white/5 hover:border-white/10 hover:shadow-2xl hover:shadow-black/50'}`}>
        {highlight && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-sky-500 text-black text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Most Popular
            </div>
        )}
        <div className="mb-8">
            <h3 className={`text-sm font-mono uppercase tracking-widest mb-4 ${highlight ? 'text-sky-400' : 'text-neutral-400'}`}>{tier}</h3>
            <div className="flex items-baseline gap-1 mb-2">
                <span className="text-3xl font-medium text-white">{price}</span>
                <span className="text-neutral-500 text-sm">/month</span>
            </div>
            <p className="text-sm text-neutral-400">{description}</p>
        </div>

        <div className="flex-1 mb-8 space-y-4">
            {features.map((feat, i) => (
                <div key={i} className="flex items-start gap-3 text-sm text-neutral-300">
                    <svg className={`w-4 h-4 mt-0.5 ${highlight ? 'text-sky-500' : 'text-neutral-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feat}
                </div>
            ))}
        </div>

        <Button
            variant={highlight ? 'primary' : 'secondary'}
            className="w-full"
            onClick={onClick}
        >
            {buttonText || (highlight ? 'Get Started' : 'Contact Sales')}
        </Button>
    </div>
);

const PricingSection = () => {
    const { upgradeToPro, isPro, openCustomerPortal, checkoutLoading } = useUser();

    return (
        <section className="py-20 md:py-32 bg-[#050505] border-t border-white/5 relative z-20">
            <div className="max-w-screen-xl mx-auto px-4 md:px-6">
                <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
                    <h2 className="text-3xl font-medium text-white mb-4">Simple, transparent pricing</h2>
                    <p className="text-neutral-500 font-light">
                        Choose the plan that fits your hiring volume. No hidden fees for generated tokens.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
                    <PricingCard
                        tier="Starter"
                        price="$49"
                        description="For individual recruiters and small startups."
                        onClick={() => {
                            console.log('[PricingSection] Starter button clicked');
                            if (!checkoutLoading) {
                                isPro ? openCustomerPortal() : upgradeToPro('starter');
                            }
                        }}
                        buttonText={checkoutLoading ? "Processing..." : (isPro ? "Current Plan" : "Get Started")}
                        features={[
                            "Unlimited Job Descriptions",
                            "10 Interview Guides / mo",
                            "Basic Tone Control",
                            "Markdown Export",
                            "Single User"
                        ]}
                    />
                    <PricingCard
                        tier="Agency"
                        price="$149"
                        description="Power for growing agencies and recruiting teams."
                        highlight={true}
                        onClick={() => {
                            console.log('[PricingSection] Agency button clicked');
                            if (!checkoutLoading) {
                                isPro ? openCustomerPortal() : upgradeToPro('agency');
                            }
                        }}
                        buttonText={checkoutLoading ? "Processing..." : (isPro ? "Manage Subscription" : "Get Started")}
                        features={[
                            "Unlimited Everything",
                            "Advanced Screening Questions",
                            "All Tone Models",
                            "API Access",
                            "Team Sharing (up to 5 users)",
                            "Priority Reasoning Speed"
                        ]}
                    />
                    <PricingCard
                        tier="Enterprise"
                        price="Custom"
                        description="For large organizations with compliance needs."
                        features={[
                            "SSO & Audit Logs",
                            "Custom Model Fine-tuning",
                            "Dedicated Success Manager",
                            "SLA Guarantees",
                            "Unlimited Seats",
                            "On-Premise Options"
                        ]}
                    />
                </div>
            </div>
        </section>
    );
};

export default PricingSection;
