import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthPanel } from '../components/AuthPanel';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import { SafeImage } from '../components/SafeImage';
import { useAppContext } from '../hooks/useAppContext';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabaseClient';
import { usePageTitle } from '../lib/usePageTitle';

export function LoginPage() {
  const { isAuthenticated, isGuest } = useAuth();
  const navigate = useNavigate();
  usePageTitle('Sign In or Continue as Guest');

  useEffect(() => {
    if (isAuthenticated && !isGuest) {
      navigate('/account', { replace: true });
    }
  }, [isAuthenticated, isGuest, navigate]);

  return (
    <div className="bg-cream/40 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
        {/* Left Editorial Harvest Showcase */}
        <div className="lg:col-span-6 relative rounded-card overflow-hidden shadow-card min-h-[260px] sm:min-h-[340px] lg:min-h-[540px] flex flex-col justify-end">
          <SafeImage
            src="/src/assets/images/hero_harvest_bangladesh_1795777183291.jpg"
            alt="Fresh Bangladeshi morning harvest delivered directly from farms"
            lazy={false}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/55 to-ink/20" />

          <div className="relative z-10 p-6 sm:p-8 text-white space-y-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-secondary mb-2">
                KrishiKotha · কৃষিকথা
              </p>
              <h1 className="font-display font-extrabold text-2xl sm:text-3xl leading-tight">
                Morning Harvest, Straight to Your Dhaka Kitchen
              </h1>
              <p className="text-sm text-white/85 font-bengali mt-1.5">
                সরাসরি কৃষকের ক্ষেত থেকে আপনার ঘরে · প্রতিদিন ভোর ৫:৩০-এ সংগ্রহ
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-white/15 text-xs">
              <div className="flex items-start gap-2">
                <Icon name="verified" className="!text-[18px] text-secondary shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">1-Tap Guest Shopping</p>
                  <p className="text-white/75">Browse, fill your basket & test checkout without sign-up.</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Icon name="qr_code_2" className="!text-[18px] text-secondary shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">78% Goes to Farmers</p>
                  <p className="text-white/75">Every crate traced to verified Bogura & Rajshahi growers.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Authentication Card */}
        <div className="lg:col-span-6 bg-white rounded-card ghost-border shadow-card p-6 sm:p-8 flex flex-col justify-center">
          <div className="mb-5">
            <h2 className="font-display font-bold text-xl sm:text-2xl text-ink">
              {isGuest ? 'Guest Session Active' : 'Sign in or Continue as Guest'}
            </h2>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
              {isGuest
                ? 'You can keep shopping immediately or link Google/Email to save orders permanently.'
                : 'Start shopping instantly as a guest, or sign in with Google or Email.'}
            </p>
          </div>

          {isGuest && (
            <div className="mb-4 flex flex-wrap gap-2">
              <Button to="/shop" size="sm">
                Continue Shopping
              </Button>
              <Button to="/cart" variant="outline" size="sm">
                View Basket
              </Button>
            </div>
          )}

          <AuthPanel
            onSuccess={() => {
              navigate(isGuest ? '/account' : '/shop');
            }}
          />
        </div>
      </div>
    </div>
  );
}

export function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useAppContext();
  const navigate = useNavigate();
  usePageTitle('Reset Password');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setLoading(true);
    setError(null);
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    showToast('Password updated! You are signed in.', 'success');
    navigate('/account', { replace: true });
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white rounded-card ghost-border shadow-card p-6 sm:p-7">
        <h1 className="font-display font-bold text-xl text-ink mb-2">Choose a New Password</h1>
        <p className="text-xs text-on-surface-variant mb-4">
          Enter a new password of at least 6 characters for your KrishiKotha account.
        </p>
        {error && (
          <div role="alert" className="bg-error-container text-on-error-container rounded-btn p-3 text-xs mb-3">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password"
            className="w-full h-11 px-3.5 rounded-btn ghost-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/25"
          />
          <Button type="submit" fullWidth size="lg" loading={loading}>
            Update Password
          </Button>
        </form>
      </div>
    </div>
  );
}

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useAppContext();
  const { signInAsGuest } = useAuth();
  const [callbackError, setCallbackError] = useState<string | null>(null);
  usePageTitle('Completing Sign In');

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const hashParams = new URLSearchParams(location.hash.replace(/^#/, ''));
    const oauthError =
      searchParams.get('error_description') ||
      hashParams.get('error_description') ||
      searchParams.get('error') ||
      hashParams.get('error');

    if (oauthError) {
      setCallbackError(oauthError);
      return;
    }

    if (!supabase) {
      navigate('/', { replace: true });
      return;
    }

    let settled = false;
    const finish = (hasSession: boolean) => {
      if (settled) return;
      settled = true;
      if (hasSession) {
        showToast('Signed in successfully!', 'success');
        navigate('/account', { replace: true });
      } else {
        setCallbackError('We could not complete sign-in from the callback link. Please try again or continue as guest.');
      }
    };

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        finish(true);
      }
    });

    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        settled = true;
        setCallbackError(error.message);
        return;
      }
      if (data.session) {
        finish(true);
      }
    });

    const timeout = setTimeout(async () => {
      const { data } = await supabase!.auth.getSession();
      finish(Boolean(data.session));
    }, 3500);

    return () => {
      clearTimeout(timeout);
      sub.subscription.unsubscribe();
    };
  }, [location.hash, location.search, navigate, showToast]);

  if (callbackError) {
    return (
      <div className="max-w-md mx-auto px-4 py-14">
        <div className="bg-white rounded-card ghost-border shadow-card p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-error-container text-error flex items-center justify-center mx-auto">
            <Icon name="error_outline" className="!text-[26px]" />
          </div>
          <h1 className="font-display font-bold text-lg text-ink">Sign-in could not be completed</h1>
          <p className="text-xs sm:text-sm text-on-surface-variant">{callbackError}</p>
          <div className="flex flex-wrap justify-center gap-2.5 pt-1">
            <Button to="/login" variant="outline">
              Back to Sign In
            </Button>
            <Button
              onClick={async () => {
                const ok = await signInAsGuest();
                if (ok) navigate('/shop', { replace: true });
              }}
            >
              Continue as Guest
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="text-sm font-medium text-on-surface-variant">Completing your sign-in...</p>
    </div>
  );
}
