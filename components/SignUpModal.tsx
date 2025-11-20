import React, { useMemo, useState, useEffect } from 'react';
import { SignUp, SignIn, useUser as useClerkUser } from '@clerk/clerk-react';
import { X } from 'lucide-react';

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const SignUpModal: React.FC<SignUpModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user, isLoaded } = useClerkUser();
  const [mode, setMode] = useState<'signup' | 'signin'>('signup');
  const currentUrl = useMemo(
    () => (typeof window !== 'undefined' ? window.location.href : '/'),
    []
  );

  useEffect(() => {
    if (!isOpen) {
      setMode('signup');
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && isLoaded && user) {
      onSuccess();
    }
  }, [isOpen, isLoaded, user, onSuccess]);

  if (!isOpen) return null;

  const toggleButtonClass = (target: 'signup' | 'signin') =>
    `flex-1 rounded-full py-2 text-sm font-medium transition-colors ${
      mode === target ? 'bg-white text-black' : 'text-white/70 hover:text-white'
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4">
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white/60 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <div className="bg-black border border-white/10 rounded-2xl p-6 shadow-2xl">
          <div className="text-center mb-6">
            <p className="text-white/60 text-sm mb-3">Secure checkout requires an account</p>
            <div className="flex items-center gap-2 bg-white/10 rounded-full p-1">
              <button
                type="button"
                className={toggleButtonClass('signup')}
                onClick={() => setMode('signup')}
              >
                Create account
              </button>
              <button
                type="button"
                className={toggleButtonClass('signin')}
                onClick={() => setMode('signin')}
              >
                Sign in
              </button>
            </div>
          </div>

          <div className="transform scale-95 origin-top">
            {mode === 'signup' ? (
              <SignUp
                routing="virtual"
                signInUrl="/sign-in"
                redirectUrl={currentUrl}
                afterSignUpUrl={currentUrl}
                appearance={{ elements: { footer: 'hidden' } }}
              />
            ) : (
              <SignIn
                routing="virtual"
                signUpUrl="/sign-up"
                redirectUrl={currentUrl}
                afterSignInUrl={currentUrl}
                appearance={{ elements: { footer: 'hidden' } }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpModal;
