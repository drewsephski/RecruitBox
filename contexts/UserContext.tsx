
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
  checkoutLoading: boolean;
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
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const syncUser = useCallback(async () => {
    if (!user) {
      console.log('[UserSync] No user available for backend sync');
      return;
    }

    console.log('[UserSync] Syncing user to backend...', {
      userId: user.id,
      email: user.primaryEmailAddress?.emailAddress,
    });

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
        console.error('[UserSync] Failed to sync user, status:', syncResponse.status);
        const errorText = await syncResponse.text().catch(() => 'No error details');
        console.error('[UserSync] Error details:', errorText);
      } else {
        console.log('[UserSync] User synced successfully');
      }
    } catch (error) {
      console.error('[UserSync] Error while syncing user to backend', error);
      // Don't throw - allow the app to continue even if sync fails
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
    if (!user) {
      console.error('[Checkout] No user available');
      return;
    }

    if (checkoutLoading) {
      console.log('[Checkout] Already processing checkout, ignoring duplicate click');
      return;
    }

    setCheckoutLoading(true);
    console.log('[Checkout] Starting checkout flow', {
      tier,
      userId: user.id,
      email: user.primaryEmailAddress?.emailAddress,
    });

    try {
      // Call backend to create Polar checkout session
      console.log('[Checkout] Calling /api/checkout...');

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tier,
          email: user.primaryEmailAddress?.emailAddress,
          clerkId: user.id
        })
      });

      console.log('[Checkout] Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('[Checkout] API error:', errorData);

        if (errorData.code === 'ALREADY_SUBSCRIBED') {
          console.log('[Checkout] User already subscribed, redirecting to portal');
          setCheckoutLoading(false);
          await openCustomerPortal();
          return;
        }

        throw new Error(errorData.error || errorData.detail || 'Failed to create checkout session');
      }

      const data = await response.json();
      console.log('[Checkout] Checkout session created:', data);

      if (!data.url) {
        throw new Error('No checkout URL received from server');
      }

      // Redirect to Polar Checkout
      console.log('[Checkout] Redirecting to:', data.url);
      window.location.href = data.url;
      // Don't reset loading state - we're navigating away
    } catch (error) {
      console.error('[Checkout] Failed to start checkout:', error);
      setCheckoutLoading(false);

      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to start checkout: ${errorMessage}\n\nPlease try again or contact support if the issue persists.`);
    }
  };

  const openCustomerPortal = async () => {
    if (!user) {
      console.log('[CustomerPortal] No user found, opening sign-up');
      setIsSignUpOpen(true);
      return;
    }

    console.log('[CustomerPortal] Opening customer portal for user:', user.id);

    try {
      await syncUser();

      console.log('[CustomerPortal] Calling /api/customer-portal/session...');
      const response = await fetch('/api/customer-portal/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clerkId: user.id })
      });

      console.log('[CustomerPortal] Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('[CustomerPortal] API error:', errorData);
        throw new Error(errorData.error || errorData.detail || 'Failed to start customer portal session');
      }

      const data = await response.json();
      console.log('[CustomerPortal] Portal session created');

      if (!data.url) {
        throw new Error('Customer portal URL missing in response');
      }

      console.log('[CustomerPortal] Redirecting to portal');
      window.location.href = data.url;
    } catch (error) {
      console.error('[CustomerPortal] Failed to open customer portal', error);

      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Unable to open the billing portal: ${errorMessage}\n\nIf this persists, please contact support.`);
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
    <UserContext.Provider value={{ isPro, upgradeToPro, isPaywallOpen, openPaywall, closePaywall, isLoading, checkoutLoading, refreshSubscription, openCustomerPortal }}>
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
