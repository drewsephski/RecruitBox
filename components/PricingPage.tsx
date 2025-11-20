import React from 'react';
import PricingSection from './PricingSection';
import Navbar from './Navbar';
import Footer from './Footer';
import { useUser } from '../contexts/UserContext';

const PricingPage = () => {
    const { isPro, openPaywall, openCustomerPortal } = useUser();
    return (
        <div className="min-h-screen bg-black text-white">
            <Navbar 
                isPro={isPro}
                openPaywall={openPaywall}
                openCustomerPortal={openCustomerPortal}
            />
            <div id="hero" className="pt-24" />
            <PricingSection />
            <Footer />
        </div>
    );
};

export default PricingPage;