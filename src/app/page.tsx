'use client';
import React, { useRef, useState, useEffect } from "react";
import { useSignIn, useUser } from "@clerk/nextjs";
import { useRouter } from 'next/navigation';
import Footer from '../components/Footer';
import { 
  getUserFriendlyErrorMessage, 
  logAuthError, 
  isNetworkError, 
  isRateLimitError,
  type ErrorContext 
} from '../utils/authErrorHandler';

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const howToApplyRef = useRef<HTMLDivElement>(null);

  // --- Clerk Hooks ---
  const { signIn, setActive, isLoaded: isSignInLoaded } = useSignIn();
  const { isSignedIn, isLoaded: isUserLoaded } = useUser(); // Hook to check user status
  const router = useRouter(); // Hook for client-side navigation

  // --- Form State ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [shouldRemember, setShouldRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // --- Redirect Effect for Logged-In Users ---
  useEffect(() => {
    // Wait for Clerk to determine the user's authentication state
    if (isUserLoaded && isSignedIn) {
      // If the user is signed in, redirect them to the dashboard
      router.push('/dashboard');
    }
  }, [isUserLoaded, isSignedIn, router]); // Re-run this effect if these values change

  // --- Other Effects and Handlers ---
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  
  const scrollToHowToApply = () => {
    howToApplyRef.current?.scrollIntoView({ behavior: 'smooth' });
  };


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignInLoaded) return;
    setError('');
    setLoading(true);


    const errorContext: ErrorContext = {
      email: email,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

      try {
      const attempt = await signIn.create({
        identifier: email,
        password,
      });

        if (attempt.status === 'complete') {
           setActive({ session: attempt.createdSessionId });
          setEmail('');
        setPassword('');
        setShowLoginModal(false);
        // Use router.push for a smoother navigation after login
        router.push('/dashboard');
      } 
      else {
        const incompleteMessage = 'Please complete additional verification steps.';
        setError(incompleteMessage);
          console.warn('⚠️ Incomplete authentication:', {
          status: attempt.status,
            email: email,
          });
      }

    } 
      catch (err: any) {
        const userFriendlyMessage = getUserFriendlyErrorMessage(err);
        setError(userFriendlyMessage);
        logAuthError(err, errorContext);
        if (isRateLimitError(err)) {
        console.warn('🚫 Rate limit detected.');
        } else if (isNetworkError(err)) {
        console.warn('🌐 Network error detected.');
      }
    } 
    finally {
      setLoading(false);
    }
  };

  // --- Conditional Rendering to Prevent Page Flash ---
  // While Clerk is loading the user session, or if the user is signed in (and about to be redirected),
  // show a loading screen. This prevents the landing page from briefly appearing.
  if (!isUserLoaded || isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg font-medium text-gray-600">Loading...</div>
      </div>
    );
  }

  // --- Render the full page only if the user is loaded and NOT signed in ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white flex flex-col">
      {/* Navbar */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">eM</span>
            </div>
            <span className="text-2xl font-bold text-gray-800">eMediCard</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowLoginModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-medium"
            >
              Login
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-transparent flex-1">
        <div className="max-w-7xl gap-x-16 mx-auto px-6 flex flex-col lg:flex-row items-center min-h-[70vh]">
          <div className="flex-1 flex-col justify-center items-start mb-10 lg:mb-0">
            <h1 className="text-5xl font-bold text-gray-900 mb-4 leading-tight">
              Your Health Card,<br />
              <span className="text-emerald-600">Digitized</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              A mobile health card system that puts your care in your pocket.
            </p>
            <div className="flex gap-4">
              <button
                className="bg-emerald-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-emerald-700"
                onClick={scrollToHowToApply}
              >
                Get Started
              </button>
              <button className="border-2 border-emerald-600 text-emerald-600 px-8 py-4 rounded-xl font-semibold hover:bg-emerald-600 hover:text-white">
                Learn More
              </button>
            </div>
          </div>
          <div className="flex-1 flex justify-center lg:justify-end w-full">
            <img
              src="/images/human_mobile-application_uc2q.svg"
              alt="App Illustration"
              className="max-w-md w-full h-96"
              draggable={false}
            />
          </div>
        </div>
      </section>

      {/* Spacer for scroll */}
      <section
        ref={howToApplyRef}
        className="pt-32 md:pt-3 bg-white"
        style={{ scrollMarginTop: '100px' }}
      ></section>

      {/* How to Apply */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">How to Apply</h2>
          <p className="text-xl text-gray-600 mb-12">Simple steps to get your digital health card</p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              ['Download App', 'Get the eMediCard app from the store', '1'],
              ['Complete Registration', 'Fill out your personal and health info', '2'],
              ['Get Verified', 'Verify your identity and activate your card', '3'],
            ].map(([title, desc, num]) => (
              <div key={num} className="text-center p-8 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 hover:shadow-lg">
                <div className="w-16 h-16 bg-emerald-500 rounded-2xl mx-auto mb-6 flex items-center justify-center text-white text-2xl font-bold">{num}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{title}</h3>
                <p className="text-gray-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Custom Admin Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-8 shadow-xl relative">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Admin Login</h2>
              <button
                onClick={() => setShowLoginModal(false)}
                className="text-gray-500 hover:text-gray-700 text-xl absolute right-4 top-4"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg"
                  placeholder="email@emedicard.com"
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg"
                  placeholder="••••••••"
                  required
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    checked={shouldRemember}
                    onChange={e => setShouldRemember(e.target.checked)}
                  />
                  <span className="ml-2 text-gray-600">Remember me</span>
                </label>
                <a href="#" className="text-emerald-600 hover:text-emerald-500">Forgot password?</a>
              </div>
              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  </div>
                </div>
              )}
              <div className="text-center mt-4 text-sm text-gray-500">
                Access restricted to authorized administrators only
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}