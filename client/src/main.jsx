/* eslint-disable react-refresh/only-export-components */
import { StrictMode, lazy, Suspense, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { MotionConfig } from 'framer-motion';
import './index.css';

import CustomerAuthGuard from './components/auth/CustomerAuthGuard';
import ProductSkeletonGrid from './components/product/ProductSkeletonGrid';
import ProductDetailSkeleton from './components/product/ProductDetailSkeleton';
import {
  WishlistSkeletonGrid,
  OrdersSkeleton,
  AddressSkeletonGrid,
  ProfileSkeleton,
  CheckoutSkeleton,
} from './components/common/Skeleton';

// Public Routes
const HomePage = lazy(() => import('./pages/home/HomePage'));
const ShopPage = lazy(() => import('./pages/shop/ShopPage'));
const LookbookPage = lazy(() => import('./pages/lookbook/LookbookPage'));
const AboutPage = lazy(() => import('./pages/about/AboutPage'));
const ContactPage = lazy(() => import('./pages/contact/ContactPage'));
const ProductDetailPage = lazy(() => import('./pages/product/ProductDetailPage'));
const CheckoutPage = lazy(() => import('./pages/checkout/CheckoutPage'));
const AuthPage = lazy(() => import('./pages/auth/AuthPage'));
const NotFoundPage = lazy(() => import('./pages/common/NotFoundPage'));

// Lazy Loaded Account Pages
const AccountLayout = lazy(() => import('./pages/account/AccountLayout'));
const ProfilePage = lazy(() => import('./pages/account/ProfilePage'));
const OrdersPage = lazy(() => import('./pages/account/OrdersPage'));
const AddressesPage = lazy(() => import('./pages/account/AddressesPage'));
const WishlistPage = lazy(() => import('./pages/account/WishlistPage'));
const PaymentMethodsTab = lazy(() => import('./pages/account/DashboardTabs').then(m => ({ default: m.PaymentMethodsTab })));
const RewardsTab = lazy(() => import('./pages/account/DashboardTabs').then(m => ({ default: m.RewardsTab })));
const LoyaltyPage = lazy(() => import('./pages/account/LoyaltyPage'));
const AccountSettingsTab = lazy(() => import('./pages/account/DashboardTabs').then(m => ({ default: m.AccountSettingsTab })));
const NotificationsPage = lazy(() => import('./pages/account/NotificationsPage'));

// Lazy Loaded Admin Pages
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const ProductManagement = lazy(() => import('./pages/admin/ProductManagement'));
const CategoryManagement = lazy(() => import('./pages/admin/CategoryManagement'));
const OrderManagement = lazy(() => import('./pages/admin/OrderManagement'));
const UserManagement = lazy(() => import('./pages/admin/UserManagement'));
const CouponManagement = lazy(() => import('./pages/admin/CouponManagement'));
const FeaturedProductsTab = lazy(() => import('./pages/admin/FeaturedProductsTab'));
const LoyaltyManagement = lazy(() => import('./pages/admin/LoyaltyManagement'));
const FlaggedAccounts = lazy(() => import('./pages/admin/FlaggedAccounts'));


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes cache
      refetchOnWindowFocus: false,
    },
  },
});

import PremiumEntranceLoader from './components/common/PremiumEntranceLoader';

const PageLoader = () => <PremiumEntranceLoader isFullPage={true} />;

const AppBootstrapper = ({ children }) => {
  useEffect(() => {
    const loader = document.getElementById('initial-loader');
    if (loader) {
      // Trigger curtain split reveal after initial mount
      const fadeTimer = setTimeout(() => {
        loader.classList.add('fade-out');
      }, 300);

      const removeTimer = setTimeout(() => {
        loader.remove();
      }, 1100);

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(removeTimer);
      };
    }
  }, []);
  return children;
};

const ScrollToHash = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const attemptScroll = () => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
          return true;
        }
        return false;
      };

      if (!attemptScroll()) {
        const intervalId = setInterval(() => {
          if (attemptScroll()) {
            clearInterval(intervalId);
          }
        }, 100);
        const timeoutId = setTimeout(() => clearInterval(intervalId), 3000);
        return () => {
          clearInterval(intervalId);
          clearTimeout(timeoutId);
        };
      }
    }
  }, [location.hash, location.pathname]);

  return null;
};


// Scroll to top on every route change (no hash)
const ScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    // Only scroll to top when navigating to a new path without a hash anchor
    if (!location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, [location.pathname, location.hash]);

  return null;
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppBootstrapper>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <MotionConfig reducedMotion="user">
          <BrowserRouter>
            <ScrollToHash />
            <ScrollToTop />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public Routes */}
                <Route
                  path="/"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <HomePage />
                    </Suspense>
                  }
                />
                <Route
                  path="/shop"
                  element={
                    <Suspense fallback={<ProductSkeletonGrid />}>
                      <ShopPage />
                    </Suspense>
                  }
                />
                <Route
                  path="/lookbook"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <LookbookPage />
                    </Suspense>
                  }
                />
                <Route
                  path="/about"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <AboutPage />
                    </Suspense>
                  }
                />
                <Route
                  path="/contact"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <ContactPage />
                    </Suspense>
                  }
                />
                <Route
                  path="/product/:slug"
                  element={
                    <Suspense fallback={<ProductDetailSkeleton />}>
                      <ProductDetailPage />
                    </Suspense>
                  }
                />
                <Route
                  path="/product/id/:id"
                  element={
                    <Suspense fallback={<ProductDetailSkeleton />}>
                      <ProductDetailPage />
                    </Suspense>
                  }
                />
                <Route
                  path="/auth"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <AuthPage />
                    </Suspense>
                  }
                />

                {/* Protected Customer Routes */}
                <Route
                  path="/checkout"
                  element={
                    <CustomerAuthGuard>
                      <Suspense fallback={<CheckoutSkeleton />}>
                        <CheckoutPage />
                      </Suspense>
                    </CustomerAuthGuard>
                  }
                />

                {/* Protected Account Routes */}
                <Route
                  path="/account"
                  element={
                    <CustomerAuthGuard>
                      <Suspense fallback={<PageLoader />}>
                        <AccountLayout />
                      </Suspense>
                    </CustomerAuthGuard>
                  }
                >
                  <Route
                    index
                    element={
                      <Suspense fallback={<ProfileSkeleton />}>
                        <ProfilePage />
                      </Suspense>
                    }
                  />
                  <Route
                    path="profile"
                    element={
                      <Suspense fallback={<ProfileSkeleton />}>
                        <ProfilePage />
                      </Suspense>
                    }
                  />
                  <Route
                    path="orders"
                    element={
                      <Suspense fallback={<OrdersSkeleton />}>
                        <OrdersPage />
                      </Suspense>
                    }
                  />
                  <Route
                    path="addresses"
                    element={
                      <Suspense fallback={<AddressSkeletonGrid />}>
                        <AddressesPage />
                      </Suspense>
                    }
                  />
                  <Route
                    path="wishlist"
                    element={
                      <Suspense fallback={<WishlistSkeletonGrid />}>
                        <WishlistPage />
                      </Suspense>
                    }
                  />
                  <Route
                    path="payments"
                    element={
                      <Suspense fallback={<PageLoader />}>
                        <PaymentMethodsTab />
                      </Suspense>
                    }
                  />
                  <Route
                    path="rewards"
                    element={
                      <Suspense fallback={<PageLoader />}>
                        <LoyaltyPage />
                      </Suspense>
                    }
                  />
                  <Route
                    path="loyalty"
                    element={
                      <Suspense fallback={<PageLoader />}>
                        <LoyaltyPage />
                      </Suspense>
                    }
                  />
                   <Route
                     path="notifications"
                     element={
                       <Suspense fallback={<PageLoader />}>
                         <NotificationsPage />
                       </Suspense>
                     }
                   />
                  <Route
                    path="settings"
                    element={
                      <Suspense fallback={<PageLoader />}>
                        <AccountSettingsTab />
                      </Suspense>
                    }
                  />
                </Route>

                {/* Admin Routes */}
                <Route
                  path="/admin/login"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <AdminLogin />
                    </Suspense>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <AdminLayout />
                    </Suspense>
                  }
                >
                  <Route
                    index
                    element={
                      <Suspense fallback={<PageLoader />}>
                        <AdminDashboard />
                      </Suspense>
                    }
                  />
                  <Route
                    path="dashboard"
                    element={
                      <Suspense fallback={<PageLoader />}>
                        <AdminDashboard />
                      </Suspense>
                    }
                  />
                  <Route
                    path="products"
                    element={
                      <Suspense fallback={<PageLoader />}>
                        <ProductManagement />
                      </Suspense>
                    }
                  />
                  <Route
                    path="categories"
                    element={
                      <Suspense fallback={<PageLoader />}>
                        <CategoryManagement />
                      </Suspense>
                    }
                  />
                  <Route
                    path="orders"
                    element={
                      <Suspense fallback={<PageLoader />}>
                        <OrderManagement />
                      </Suspense>
                    }
                  />
                  <Route
                    path="users"
                    element={
                      <Suspense fallback={<PageLoader />}>
                        <UserManagement />
                      </Suspense>
                    }
                  />
                  <Route
                    path="coupons"
                    element={
                      <Suspense fallback={<PageLoader />}>
                        <CouponManagement />
                      </Suspense>
                    }
                  />
                  <Route
                    path="featured"
                    element={
                      <Suspense fallback={<PageLoader />}>
                        <FeaturedProductsTab />
                      </Suspense>
                    }
                  />
                  <Route
                    path="loyalty"
                    element={
                      <Suspense fallback={<PageLoader />}>
                        <LoyaltyManagement />
                      </Suspense>
                    }
                  />
                  <Route
                    path="flagged-accounts"
                    element={
                      <Suspense fallback={<PageLoader />}>
                        <FlaggedAccounts />
                      </Suspense>
                    }
                  />
                </Route>

                {/* 404 Catch-All Route */}
                <Route
                  path="*"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <NotFoundPage />
                    </Suspense>
                  }
                />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </MotionConfig>
      </QueryClientProvider>
    </HelmetProvider>
    </AppBootstrapper>
  </StrictMode>
);
