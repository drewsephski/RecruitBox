
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface UserContextType {
  isPro: boolean;
  upgradeToPro: () => Promise<void>;
  isPaywallOpen: boolean;
  openPaywall: () => void;
  closePaywall: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  // Default to FALSE to simulate a new free user
  const [isPro, setIsPro] = useState(false);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);

  const upgradeToPro = async () => {
    // Simulate API call/Stripe Checkout
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setIsPro(true);
        setIsPaywallOpen(false);
        resolve();
      }, 2000);
    });
  };

  const openPaywall = () => setIsPaywallOpen(true);
  const closePaywall = () => setIsPaywallOpen(false);

  return (
    <UserContext.Provider value={{ isPro, upgradeToPro, isPaywallOpen, openPaywall, closePaywall }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
