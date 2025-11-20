import React from 'react';
import { SignIn, SignUp } from '@clerk/clerk-react';

export const LoginPage = () => (
    <div className="min-h-screen flex items-center justify-center bg-black">
        <SignIn routing="path" path="/sign-in" />
    </div>
);

export const SignupPage = () => (
    <div className="min-h-screen flex items-center justify-center bg-black">
        <SignUp routing="path" path="/sign-up" />
    </div>
);
