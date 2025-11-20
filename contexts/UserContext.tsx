
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useUser as useClerkUser } from '@clerk/clerk-react';
import SignUpModal from '../components/SignUpModal';

type PlanTier = 'starter' | 'agency';

interface UserContextType {
  isPro: boolean;
  upgradeToPro: (tier?: PlanTier) => Promise<void>;
  isPaywallOpen: boolean;
  openPaywall: () => void;
  closePaywall: () => void;
  isLoading: boolean;
  refreshSubscription: () => Promise<void>;
  openCustomerPortal: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const { user, isLoaded: isUserLoaded } = useClerkUser();
  const [isPro, setIsPro] = useState(false);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [pendingCheckout, setPendingCheckout] = useState(false);
  const [pendingCheckoutTier, setPendingCheckoutTier] = useState<PlanTier>('agency');

  const syncUser = useCallback(async () => {
    if (!user) {
      console.log('UserContext: No user available for backend sync');
      return;
    }

    console.log('UserContext: Syncing user to backend...');
    try {
      const syncResponse = await Promise.race([
        fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clerkId: user.id,
            email: user.primaryEmailAddress?.emailAddress,
            name: user.fullName,
          }),
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('User sync timeout')), 5000)),
      ]) as Response;

      if (!syncResponse.ok) {
        console.error('UserContext: Failed to sync user, status:', syncResponse.status);
      } else {
        console.log('UserContext: User synced successfully');
      }
    } catch (error) {
      console.error('UserContext: Error while syncing user to backend', error);
      throw error;
    }
  }, [user]);

  const checkSubscription = useCallback(async () => {
    if (!isUserLoaded) {
      console.log('UserContext: User not loaded yet, skipping subscription check');
      return;
    }

    if (!user) {
      console.log('UserContext: No user, setting isLoading to false');
      setIsPro(false);
      setIsLoading(false);
      return;
    }

    console.log('UserContext: Checking subscription for user:', user.id);

    try {
      await syncUser();

      console.log('UserContext: Checking subscription status...');
      const res = await Promise.race([
        fetch(`/api/subscription/${user.id}`),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Subscription check timeout')), 5000)),
      ]) as Response;

      if (res.ok) {
        const data = await res.json();
        if (data.subscription && data.subscription.status === 'active') {
          console.log('UserContext: User has active subscription');
          setIsPro(true);
        } else {
          console.log('UserContext: User has no active subscription');
          setIsPro(false);
        }
      } else {
        console.log('UserContext: Subscription check failed, status:', res.status);
        setIsPro(false);
      }
    } catch (error) {
      console.error('UserContext: Failed to check subscription', error);
      setIsPro(false);
    } finally {
      console.log('UserContext: Setting isLoading to false');
      setIsLoading(false);
    }
  }, [isUserLoaded, user, syncUser]);

  useEffect(() => {
    if (isUserLoaded) {
      console.log('UserContext: User loaded, checking subscription');
      checkSubscription();
    } else {
      console.log('UserContext: Waiting for user to load...');
    }
  }, [isUserLoaded, checkSubscription]);

  const refreshSubscription = useCallback(async () => {
    console.log('UserContext: Manually refreshing subscription...');
    setIsLoading(true);
    await checkSubscription();
  }, [checkSubscription]);

  // Handle pending checkout after sign-up
  useEffect(() => {
    if (pendingCheckout && user && isUserLoaded) {
      console.log('User available after sign-up, proceeding with checkout');
      setPendingCheckout(false);
      proceedToCheckout(pendingCheckoutTier);
    }
  }, [user, isUserLoaded, pendingCheckout, pendingCheckoutTier]);

  const proceedToCheckout = async (tier: PlanTier) => {
    if (!user) return;

    try {
      // Call backend to create Polar checkout session
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier,
          email: user.primaryEmailAddress?.emailAddress,
          clerkId: user.id
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.code === 'ALREADY_SUBSCRIBED') {
          console.log('User already subscribed, redirecting to portal');
          await openCustomerPortal();
          return;
        }
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();

      // Redirect to Polar Checkout
      window.location.href = url;
    } catch (error) {
      console.error('Failed to start checkout:', error);
      alert('Failed to start checkout. Please try again.');
    }
  };

  const openCustomerPortal = async () => {
    if (!user) {
      console.log('No user found, opening sign-up before portal access');
      setIsSignUpOpen(true);
      return;
    }

    try {
      await syncUser();

      const response = await fetch('/api/customer-portal/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clerkId: user.id })
      });

      if (!response.ok) {
        throw new Error('Failed to start customer portal session');
      }

      const data = await response.json();
      if (!data.url) {
        throw new Error('Customer portal URL missing in response');
      }

      window.location.href = data.url;
    } catch (error) {
      console.error('Failed to open customer portal', error);
      alert('Unable to open the billing portal. If this persists, please contact support.');
    }
  };

  const upgradeToPro = async (tier: PlanTier = 'agency') => {
    if (!user) {
      console.log('No user found, showing sign-up modal');
      setPendingCheckoutTier(tier);
      setPendingCheckout(true);
      setIsSignUpOpen(true);
      return;
    }

    proceedToCheckout(tier);
  };

  const openPaywall = () => setIsPaywallOpen(true);
  const closePaywall = () => setIsPaywallOpen(false);

  const openSignUp = () => setIsSignUpOpen(true);
  const closeSignUp = () => setIsSignUpOpen(false);

  const handleSignUpSuccess = () => {
    closeSignUp();
    // The useEffect will handle the checkout when user becomes available
    console.log('Sign-up modal closed, pending checkout will proceed when user is available');
  };

  return (
    <UserContext.Provider value={{ isPro, upgradeToPro, isPaywallOpen, openPaywall, closePaywall, isLoading, refreshSubscription, openCustomerPortal }}>
      {children}
      <SignUpModal
        isOpen={isSignUpOpen}
        onClose={closeSignUp}
        onSuccess={handleSignUpSuccess}
      />
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
