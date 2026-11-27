import React, { useId, useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { useAuth } from '../hooks/useAuth';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import { Button } from './Button';
import { Icon } from './Icon';

export function AuthPanel({
  reason,
  onSuccess,
}: {
  reason?: string | null;
  onSuccess?: () => void;
}) {
  const { t } = useAppContext();
  const {
    isGuest,
    signInAsGuest,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    sendPasswordReset,
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const formId = useId();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);
    setSubmitting(true);

    try {
      if (mode === 'login') {
        await signInWithEmail(email.trim(), password);
        onSuccess?.();
      } else if (mode === 'register') {
        const res = await signUpWithEmail(email.trim(), password, fullName.trim());
        if (res.needsEmailConfirm) {
          setInfoMsg('Check your inbox to confirm your email address, then sign in.');
        } else {
          onSuccess?.();
        }
      } else {
        await sendPasswordReset(email.trim());
        setInfoMsg('Password reset link sent! Please check your email inbox.');
      }
    } catch (err) {
      setErrorMsg((err as Error).message || 'Authentication failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGuest = async () => {
    setGuestLoading(true);
    setErrorMsg(null);
    const ok = await signInAsGuest();
    setGuestLoading(false);
    if (ok) onSuccess?.();
  };

  return (
    <div className="space-y-4">
      {reason && (
        <div className="bg-cream ghost-border rounded-btn px-3.5 py-2.5 text-xs sm:text-sm text-ink flex items-start gap-2">
          <Icon name="info" className="!text-[17px] text-primary shrink-0 mt-0.5" />
          <span>{reason}</span>
        </div>
      )}

      {!isSupabaseConfigured && (
        <div className="bg-tertiary-container/80 text-on-tertiary-container rounded-btn px-3.5 py-2.5 text-xs leading-relaxed">
          <strong>Demo Preview Mode:</strong> Click <strong>Continue as Guest</strong> below to shop, build your basket, and place demonstration orders right away. Google and Email sign-in activate once Supabase credentials are added.
        </div>
      )}

      {isGuest && (
        <div className="bg-secondary-container text-on-secondary-container rounded-btn px-3.5 py-2.5 text-xs font-medium flex items-start gap-2">
          <Icon name="verified_user" className="!text-[17px] shrink-0 mt-0.5" />
          <span>
            Guest session active. Sign in with Google or create an email account anytime to link and keep your basket and order history.
          </span>
        </div>
      )}

      {/* Quick Access Options */}
      <div className="space-y-2.5">
        {!isGuest && (
          <button
            type="button"
            disabled={guestLoading}
            onClick={handleGuest}
            className="w-full rounded-card border-2 border-primary/25 bg-cream/70 hover:bg-cream hover:border-primary/45 px-4 py-3 text-left transition-all cursor-pointer flex items-center justify-between gap-3 group disabled:opacity-60"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shrink-0">
                <Icon name="shopping_basket" className="!text-[20px]" />
              </div>
              <div className="min-w-0">
                <span className="font-display font-bold text-sm text-ink block">
                  {guestLoading ? 'Starting Guest Session...' : t('continueAsGuest')}
                </span>
                <span className="text-[11px] text-on-surface-variant block truncate">
                  Shop, fill your basket & test checkout with zero sign-up
                </span>
              </div>
            </div>
            <Icon
              name="arrow_forward"
              className="!text-[18px] text-primary group-hover:translate-x-0.5 transition-transform shrink-0"
            />
          </button>
        )}

        <Button
          variant="outline"
          fullWidth
          onClick={signInWithGoogle}
          className="!justify-center !h-12 !bg-white hover:!bg-cream/60"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
            />
          </svg>
          <span>{t('continueWithGoogle')}</span>
        </Button>
      </div>

      <div className="flex items-center gap-3 text-[11px] uppercase tracking-wider font-semibold text-outline">
        <div className="h-px bg-primary/15 flex-1" />
        <span>or use email</span>
        <div className="h-px bg-primary/15 flex-1" />
      </div>

      {/* Mode tabs */}
      <div className="flex rounded-btn bg-cream p-1 ghost-border text-xs font-semibold">
        <button
          type="button"
          onClick={() => {
            setMode('login');
            setErrorMsg(null);
            setInfoMsg(null);
          }}
          className={`flex-1 py-2 rounded-[6px] cursor-pointer transition-colors ${
            mode === 'login' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant'
          }`}
        >
          {t('signIn')}
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('register');
            setErrorMsg(null);
            setInfoMsg(null);
          }}
          className={`flex-1 py-2 rounded-[6px] cursor-pointer transition-colors ${
            mode === 'register' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant'
          }`}
        >
          {t('createAccount')}
        </button>
      </div>

      {errorMsg && (
        <div role="alert" className="bg-error-container text-on-error-container rounded-btn px-3 py-2 text-xs font-medium">
          {errorMsg}
        </div>
      )}
      {infoMsg && (
        <div role="status" className="bg-secondary-container text-on-secondary-container rounded-btn px-3 py-2 text-xs font-medium">
          {infoMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        {mode === 'register' && (
          <div>
            <label htmlFor={`${formId}-name`} className="block text-xs font-semibold text-ink mb-1">
              Full Name
            </label>
            <input
              id={`${formId}-name`}
              type="text"
              required
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Nusrat Jahan"
              className="w-full h-11 px-3.5 rounded-btn ghost-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary"
            />
          </div>
        )}

        <div>
          <label htmlFor={`${formId}-email`} className="block text-xs font-semibold text-ink mb-1">
            Email Address
          </label>
          <input
            id={`${formId}-email`}
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full h-11 px-3.5 rounded-btn ghost-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary"
          />
        </div>

        {mode !== 'forgot' && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor={`${formId}-password`} className="block text-xs font-semibold text-ink">
                Password
              </label>
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot');
                    setErrorMsg(null);
                  }}
                  className="text-xs font-medium text-primary hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <input
                id={`${formId}-password`}
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full h-11 pl-3.5 pr-11 rounded-btn ghost-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary"
              />
              <button
                type="button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-btn text-on-surface-variant hover:bg-cream flex items-center justify-center cursor-pointer"
              >
                <Icon name={showPassword ? 'visibility_off' : 'visibility'} className="!text-[18px]" />
              </button>
            </div>
          </div>
        )}

        <Button
          type="submit"
          fullWidth
          size="lg"
          loading={submitting}
          disabled={!isSupabaseConfigured}
        >
          {mode === 'login'
            ? t('signInWithEmail')
            : mode === 'register'
            ? t('createAccount')
            : 'Send Reset Link'}
        </Button>

        {mode === 'forgot' && (
          <button
            type="button"
            onClick={() => setMode('login')}
            className="w-full text-center text-xs font-semibold text-primary hover:underline cursor-pointer pt-1"
          >
            Back to Sign In
          </button>
        )}
      </form>
    </div>
  );
}
