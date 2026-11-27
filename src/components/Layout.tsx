import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import { useAuth } from '../hooks/useAuth';
import { useCart, useHealth, useWishlist } from '../hooks/useStore';
import { DHAKA_AREAS, formatBdt, formatNumber } from '../lib/format';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import { AuthPanel } from './AuthPanel';
import { Button } from './Button';
import { CartDrawer } from './CartDrawer';
import { DemoBanner } from './DemoBanner';
import { Icon } from './Icon';
import { LanguageToggle } from './LanguageToggle';
import { Modal } from './Modal';
import { ToastContainer } from './ToastContainer';

export function Layout({ children }: { children: React.ReactNode }) {
  const { lang, t, area, setArea, openCartDrawer } = useAppContext();
  const { isAuthenticated, isGuest, authPromptOpen, authPromptReason, closeAuthPrompt, signOut } =
    useAuth();
  const { data: cart } = useCart();
  const { data: wishlist = [] } = useWishlist();
  const { data: health } = useHealth();
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [guestSignOutOpen, setGuestSignOutOpen] = useState(false);
  const navigate = useNavigate();

  const itemCount = cart?.item_count ?? 0;
  const cartTotal = cart?.total_bdt ?? 0;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchTerm.trim();
    setMobileSearchOpen(false);
    navigate(q ? `/shop?q=${encodeURIComponent(q)}` : '/shop');
  };

  const handleSignOutRequest = () => {
    if (isGuest) {
      setGuestSignOutOpen(true);
      return;
    }
    signOut().then(() => navigate('/'));
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-ink pb-16 lg:pb-0">
      {/* Persistent Demo Mode Banner when Supabase isn't configured */}
      <DemoBanner />

      {/* Desktop Announcement Strip (dismissible, non-sticky) */}
      {!bannerDismissed && (
        <div className="hidden lg:block bg-primary text-white text-xs py-2 px-4">
          <div className="max-w-[1280px] mx-auto flex items-center justify-center relative">
            <span className="font-medium truncate px-8">{t('announcement')}</span>
            <button
              type="button"
              aria-label="Dismiss announcement"
              onClick={() => setBannerDismissed(true)}
              className="absolute right-0 top-1/2 -translate-y-1/2 text-white/75 hover:text-white p-1 cursor-pointer"
            >
              <Icon name="close" className="!text-[16px]" />
            </button>
          </div>
        </div>
      )}

      {/* Main Sticky Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-primary/10">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2.5 sm:gap-5">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center shadow-xs">
              <Icon name="eco" filled className="!text-[20px] text-secondary" />
            </div>
            <div className="leading-tight">
              <span className="font-display font-extrabold text-base sm:text-lg text-primary block whitespace-nowrap">
                {t('brandEn')}{' '}
                <span className="font-bengali font-bold text-xs sm:text-sm text-ink hidden xs:inline">
                  | {t('brandBn')}
                </span>
              </span>
            </div>
          </Link>

          {/* Desktop Deliver-to Selector */}
          <div className="hidden xl:flex items-center gap-1.5 text-xs bg-cream px-3 py-2 rounded-btn ghost-border shrink-0">
            <Icon name="location_on" className="!text-[16px] text-primary" />
            <span className="text-on-surface-variant">{t('deliverTo')}:</span>
            <select
              aria-label="Select Dhaka delivery area"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="bg-transparent font-semibold text-ink focus:outline-none cursor-pointer"
            >
              {DHAKA_AREAS.map((a) => (
                <option key={a} value={a}>
                  Dhaka ({a})
                </option>
              ))}
            </select>
          </div>

          {/* Desktop Search Bar */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md relative">
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full h-10 pl-4 pr-11 rounded-btn ghost-border bg-cream/60 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
            />
            <button
              type="submit"
              aria-label="Search harvest"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-btn text-primary hover:bg-primary/10 flex items-center justify-center cursor-pointer"
            >
              <Icon name="search" className="!text-[19px]" />
            </button>
          </form>

          {/* Right Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Mobile Search Toggle */}
            <button
              type="button"
              aria-label={mobileSearchOpen ? 'Close search' : 'Search produce'}
              aria-expanded={mobileSearchOpen}
              onClick={() => setMobileSearchOpen((prev) => !prev)}
              className="md:hidden w-9 h-9 rounded-btn hover:bg-cream flex items-center justify-center text-ink cursor-pointer"
            >
              <Icon name={mobileSearchOpen ? 'close' : 'search'} className="!text-[20px]" />
            </button>

            <LanguageToggle compact />

            <Link
              to="/sell"
              className="hidden xl:inline-flex items-center text-xs font-semibold text-primary hover:underline whitespace-nowrap"
            >
              {t('becomeSeller')}
            </Link>

            <Link
              to="/wishlist"
              aria-label="Wishlist"
              className="hidden sm:inline-flex relative w-10 h-10 rounded-btn hover:bg-cream items-center justify-center text-ink"
            >
              <Icon name="favorite_border" className="!text-[20px]" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-alert text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Auth / Account */}
            {isAuthenticated ? (
              <Link
                to="/account"
                className="inline-flex items-center gap-1.5 h-9 sm:h-10 px-2.5 sm:px-3 rounded-btn ghost-border bg-cream/60 hover:bg-cream text-xs font-semibold text-ink whitespace-nowrap"
              >
                <Icon name="account_circle" className="!text-[19px] text-primary" />
                <span className="hidden sm:inline">{t('account')}</span>
                {isGuest && (
                  <span className="px-1.5 py-0.5 rounded bg-tertiary-container text-on-tertiary-container text-[10px] font-bold">
                    {t('guestBadge')}
                  </span>
                )}
              </Link>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 h-9 sm:h-10 px-2.5 sm:px-3 rounded-btn ghost-border hover:bg-cream text-xs font-semibold text-primary whitespace-nowrap"
              >
                <Icon name="login" className="!text-[18px]" />
                <span className="hidden sm:inline">{t('signIn')}</span>
              </Link>
            )}

            {/* Cart trigger: drawer on desktop, page on mobile */}
            <button
              type="button"
              onClick={() => {
                if (window.innerWidth >= 1024) {
                  openCartDrawer();
                } else {
                  navigate('/cart');
                }
              }}
              aria-label="Open basket"
              className="inline-flex items-center gap-1.5 sm:gap-2 h-9 sm:h-10 px-2.5 sm:px-3.5 rounded-btn bg-primary text-white hover:bg-[#1d4b2f] text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap"
            >
              <Icon name="shopping_basket" className="!text-[18px]" />
              <span className="hidden sm:inline tabular-nums">
                {formatBdt(cartTotal, lang)} · {formatNumber(itemCount, lang)}
              </span>
              <span className="sm:hidden tabular-nums">{formatNumber(itemCount, lang)}</span>
            </button>
          </div>
        </div>

        {/* Collapsible Mobile Search Drawer */}
        {mobileSearchOpen && (
          <form
            onSubmit={handleSearchSubmit}
            className="md:hidden px-4 pb-3 pt-1 border-t border-primary/10 bg-white flex gap-2"
          >
            <input
              type="search"
              autoFocus
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="flex-1 h-10 px-3.5 rounded-btn ghost-border bg-cream/60 text-sm focus:bg-white focus:outline-none"
            />
            <Button type="submit" size="sm">
              Search
            </Button>
          </form>
        )}

        {/* Desktop Nav Row */}
        <nav
          aria-label="Main navigation"
          className="hidden lg:block border-t border-primary/10 bg-cream/35"
        >
          <div className="max-w-[1280px] mx-auto px-8 h-10 flex items-center justify-between text-xs font-semibold text-ink">
            <div className="flex items-center gap-7">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `hover:text-primary transition-colors whitespace-nowrap ${isActive ? 'text-primary underline underline-offset-4' : ''}`
                }
              >
                {t('navHome')}
              </NavLink>
              <NavLink
                to="/shop"
                className={({ isActive }) =>
                  `hover:text-primary transition-colors whitespace-nowrap ${isActive ? 'text-primary underline underline-offset-4' : ''}`
                }
              >
                {t('navShop')}
              </NavLink>
              <NavLink
                to="/basket-builder"
                className={({ isActive }) =>
                  `hover:text-primary transition-colors whitespace-nowrap ${isActive ? 'text-primary underline underline-offset-4' : ''}`
                }
              >
                {t('buildYourBasket')}
              </NavLink>
              <NavLink
                to="/farmers"
                className={({ isActive }) =>
                  `hover:text-primary transition-colors whitespace-nowrap ${isActive ? 'text-primary underline underline-offset-4' : ''}`
                }
              >
                {t('navFarmers')}
              </NavLink>
              <NavLink
                to="/traceability"
                className={({ isActive }) =>
                  `hover:text-primary transition-colors whitespace-nowrap ${isActive ? 'text-primary underline underline-offset-4' : ''}`
                }
              >
                {t('navTraceability')}
              </NavLink>
              <NavLink
                to="/about"
                className={({ isActive }) =>
                  `hover:text-primary transition-colors whitespace-nowrap ${isActive ? 'text-primary underline underline-offset-4' : ''}`
                }
              >
                {t('navAbout')}
              </NavLink>
              <NavLink
                to="/contact"
                className={({ isActive }) =>
                  `hover:text-primary transition-colors whitespace-nowrap ${isActive ? 'text-primary underline underline-offset-4' : ''}`
                }
              >
                {t('navContact')}
              </NavLink>
            </div>

            {isAuthenticated && (
              <button
                type="button"
                onClick={handleSignOutRequest}
                className="text-on-surface-variant hover:text-error cursor-pointer whitespace-nowrap"
              >
                {t('signOut')}
              </button>
            )}
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-ink text-white mt-16">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-secondary text-ink flex items-center justify-center">
                  <Icon name="eco" filled className="!text-[18px]" />
                </div>
                <span className="font-display font-bold text-lg">KrishiKotha | কৃষিকথা</span>
              </div>
              <p className="text-xs text-white/75 leading-relaxed mb-4">
                Connecting Bangladeshi smallholder farmers directly with Dhaka households. Harvested at dawn, dispatched same-day.
              </p>
              <div className="space-y-1 text-xs text-white/85">
                <p className="font-semibold">Hotline: +880 9612-445566</p>
                <p>Dispatch Hubs: Tejgaon & Uttara, Dhaka</p>
              </div>
            </div>

            <div>
              <h3 className="font-display font-semibold text-sm mb-3 text-secondary">Harvest & Farmers</h3>
              <ul className="space-y-2 text-xs text-white/80">
                <li><Link to="/shop" className="hover:text-white">Shop All Harvest</Link></li>
                <li><Link to="/basket-builder" className="hover:text-white">Weekly Basket Builder</Link></li>
                <li><Link to="/farmers" className="hover:text-white">Meet Our Farmers</Link></li>
                <li><Link to="/traceability" className="hover:text-white">QR Traceability Protocol</Link></li>
                <li><Link to="/community-buying" className="hover:text-white">Community Group Buying</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-display font-semibold text-sm mb-3 text-secondary">Customer Care</h3>
              <ul className="space-y-2 text-xs text-white/80">
                <li><Link to="/delivery-schedule" className="hover:text-white">Delivery Schedule</Link></li>
                <li><Link to="/freshness-guarantee" className="hover:text-white">Freshness Guarantee</Link></li>
                <li><Link to="/refund-return" className="hover:text-white">Refund & Return Policy</Link></li>
                <li><Link to="/faq" className="hover:text-white">Frequently Asked Questions</Link></li>
                <li><Link to="/contact" className="hover:text-white">Contact Us</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-display font-semibold text-sm mb-3 text-secondary">Partner & Trust</h3>
              <ul className="space-y-2 text-xs text-white/80 mb-4">
                <li><Link to="/sell" className="hover:text-white">Become a Seller (Farmer Onboarding)</Link></li>
                <li><Link to="/about" className="hover:text-white">Our Fair-Share Promise</Link></li>
              </ul>
              <div className="flex flex-wrap gap-1.5 text-[11px] font-semibold">
                <span className="px-2 py-1 rounded bg-white/10">bKash</span>
                <span className="px-2 py-1 rounded bg-white/10">Nagad</span>
                <span className="px-2 py-1 rounded bg-white/10">Cards</span>
                <span className="px-2 py-1 rounded bg-white/10">Cash on Delivery</span>
              </div>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/70">
            <p>© {new Date().getFullYear()} KrishiKotha (কৃষিকথা). Demonstration marketplace · BSTI Monitored · Lab Tested.</p>
            <div className="flex items-center gap-2 text-[11px] font-medium text-white/80">
              <span
                className={`w-2 h-2 rounded-full ${
                  !isSupabaseConfigured
                    ? 'bg-tertiary'
                    : health?.databaseReachable
                    ? 'bg-secondary'
                    : 'bg-white/50'
                }`}
              />
              <span>
                {!isSupabaseConfigured
                  ? 'Demo preview (sample data)'
                  : health?.databaseReachable
                  ? 'Connected to Supabase'
                  : 'Connecting to Supabase...'}
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Tab Bar */}
      <nav
        aria-label="Mobile navigation"
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-primary/15 h-16 px-2 grid grid-cols-5 items-center"
      >
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-0.5 text-[11px] font-semibold ${
              isActive ? 'text-primary' : 'text-on-surface-variant'
            }`
          }
        >
          <Icon name="home" className="!text-[21px]" />
          <span>{t('navHome')}</span>
        </NavLink>
        <NavLink
          to="/shop"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-0.5 text-[11px] font-semibold ${
              isActive ? 'text-primary' : 'text-on-surface-variant'
            }`
          }
        >
          <Icon name="storefront" className="!text-[21px]" />
          <span>Shop</span>
        </NavLink>
        <NavLink
          to="/categories"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-0.5 text-[11px] font-semibold ${
              isActive ? 'text-primary' : 'text-on-surface-variant'
            }`
          }
        >
          <Icon name="grid_view" className="!text-[21px]" />
          <span>{t('navCategories')}</span>
        </NavLink>
        <NavLink
          to="/farmers"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-0.5 text-[11px] font-semibold ${
              isActive ? 'text-primary' : 'text-on-surface-variant'
            }`
          }
        >
          <Icon name="agriculture" className="!text-[21px]" />
          <span>Farmers</span>
        </NavLink>
        <NavLink
          to="/cart"
          className={({ isActive }) =>
            `relative flex flex-col items-center justify-center gap-0.5 text-[11px] font-semibold ${
              isActive ? 'text-primary' : 'text-on-surface-variant'
            }`
          }
        >
          <div className="relative">
            <Icon name="shopping_basket" className="!text-[21px]" />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-alert text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
                {itemCount}
              </span>
            )}
          </div>
          <span>{t('navCart')}</span>
        </NavLink>
      </nav>

      {/* Global Overlays */}
      <CartDrawer />
      <ToastContainer />
      <Modal
        open={authPromptOpen}
        onClose={closeAuthPrompt}
        title="Sign in or Continue as Guest"
      >
        <AuthPanel reason={authPromptReason} onSuccess={closeAuthPrompt} />
      </Modal>

      <Modal
        open={guestSignOutOpen}
        onClose={() => setGuestSignOutOpen(false)}
        title="Leave Guest Session?"
        maxWidth="max-w-sm"
      >
        <div className="space-y-4">
          <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            Signing out of a guest session will clear access to this guest basket unless you link an email or Google account first.
          </p>
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setGuestSignOutOpen(false)}>
              Stay Signed In
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                setGuestSignOutOpen(false);
                signOut().then(() => navigate('/'));
              }}
            >
              Sign Out Anyway
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
