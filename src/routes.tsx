import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { AccountPage, OrderDetailPage } from './pages/AccountPage';
import { AuthCallbackPage, LoginPage, ResetPasswordPage } from './pages/AuthPages';
import { BasketBuilderPage } from './pages/BasketBuilderPage';
import { CartPage } from './pages/CartPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { FarmerDetailPage, FarmersPage } from './pages/FarmersPage';
import { HomePage } from './pages/HomePage';
import { BecomeSellerPage, CommunityBuyingPage, ContactPage } from './pages/InquiryPages';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { ShopPage } from './pages/ShopPage';
import {
  AboutPage,
  DeliverySchedulePage,
  FaqPage,
  FreshnessGuaranteePage,
  NotFoundPage,
  RefundReturnPage,
  TraceabilityPage,
} from './pages/StaticPages';
import { WishlistPage } from './pages/WishlistPage';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/category/:slug" element={<ShopPage />} />
        <Route path="/product/:slug" element={<ProductDetailPage />} />
        <Route path="/farmers" element={<FarmersPage />} />
        <Route path="/farmers/:slug" element={<FarmerDetailPage />} />
        <Route path="/traceability" element={<TraceabilityPage />} />
        <Route path="/basket-builder" element={<BasketBuilderPage />} />
        <Route path="/community-buying" element={<CommunityBuyingPage />} />
        <Route path="/sell" element={<BecomeSellerPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-confirmation/:id" element={<OrderConfirmationPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/account/orders" element={<AccountPage />} />
        <Route path="/account/orders/:id" element={<OrderDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/delivery-schedule" element={<DeliverySchedulePage />} />
        <Route path="/freshness-guarantee" element={<FreshnessGuaranteePage />} />
        <Route path="/refund-return" element={<RefundReturnPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}
