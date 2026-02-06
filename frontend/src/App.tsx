import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { useState, useEffect, lazy, Suspense } from 'react';

// Layout Components
import Layout from './components/layout/Layout';
import AdminLayout from './components/admin/AdminLayout';

// Public Pages
const Home = lazy(() => import('./pages/Home'));
const Services = lazy(() => import('./pages/Services'));
const Gallery = lazy(() => import('./pages/Gallery'));
const Contact = lazy(() => import('./pages/Contact'));
const Enquiry = lazy(() => import('./pages/Enquiry'));
const ROParts = lazy(() => import('./pages/ROParts'));


// Admin Pages
const AdminLogin = lazy(() => import('./pages/admin/Login'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const Customers = lazy(() => import('./pages/admin/Customers'));
const Orders = lazy(() => import('./pages/admin/Orders'));
const AdminServices = lazy(() => import('./pages/admin/Services'));
const Products = lazy(() => import('./pages/admin/Products'));
const AdminGallery = lazy(() => import('./pages/admin/Gallery'));
const Visitors = lazy(() => import('./pages/admin/Visitors'));
const Analytics = lazy(() => import('./pages/admin/Analytics'));
const Settings = lazy(() => import('./pages/admin/Settings'));
const AdminContact = lazy(() => import('./pages/admin/Contact'));
const AdminIssues = lazy(() => import('./pages/admin/Issues'));
const AdminEnquiries = lazy(() => import('./pages/admin/Enquiries'));
const AdminUsers = lazy(() => import('./pages/admin/Users'));

// Providers
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { CookieConsentProvider } from './contexts/CookieConsentContext';
import { VisitorTrackingProvider } from './contexts/VisitorTrackingContext';

// Components
const VisitorTrackingManager = lazy(() => import('./components/VisitorTrackingManager'));
// Lazy-load consent flow to improve initial loading smoothness
const LazyConsentFlowManager = lazy(() => import('./components/ConsentFlowManager'));
import ScrollToTop from './components/common/ScrollToTop';
import ErrorBoundary from './components/common/ErrorBoundary';
import Preloader from './components/common/Preloader';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  const [isLoading, setIsLoading] = useState(false);

  // Remove artificial preload delay; rely on component-level Suspense
  useEffect(() => {
    setIsLoading(false);
  }, []);

  return (
    <ErrorBoundary>
      <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <CookieConsentProvider>
            <VisitorTrackingProvider>
              <AuthProvider>
                <Router>
                <Preloader isLoading={isLoading} />
                <ScrollToTop />
                <Suspense fallback={<Preloader isLoading={true} />}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="services" element={<Services />} />
                    <Route path="gallery" element={<Gallery />} />
                    <Route path="contact" element={<Contact />} />
                    <Route path="enquiry" element={<Enquiry />} />
                    <Route path="ro-parts" element={<ROParts />} />
                  </Route>

                  {/* Admin Routes */}
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="customers" element={<Customers />} />
                    <Route path="orders" element={<Orders />} />
                    <Route path="services" element={<AdminServices />} />
                    <Route path="products" element={<Products />} />
                    <Route path="gallery" element={<AdminGallery />} />
                    <Route path="contacts" element={<AdminContact />} />
                    <Route path="issues" element={<AdminIssues />} />
                    <Route path="enquiries" element={<AdminEnquiries />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="visitors" element={<Visitors />} />
                    <Route path="analytics" element={<Analytics />} />
                    <Route path="settings" element={<Settings />} />
                  </Route>

                  {/* 404 Route */}
                  <Route path="*" element={
                    <Layout>
                      <div className="min-h-screen flex items-center justify-center">
                        <div className="text-center">
                          <h1 className="text-6xl font-bold text-gray-900">404</h1>
                          <p className="text-xl text-gray-600 mt-4">Page not found</p>
                          <p className="text-gray-500 mt-2">
                            The page you're looking for doesn't exist.
                          </p>
                          <div className="mt-8">
                            <Link to="/" className="btn-primary">
                              Go back home
                            </Link>
                          </div>
                        </div>
                      </div>
                    </Layout>
                  } />
                </Routes>
                </Suspense>
                
                {/* Global Components */}
                <Suspense fallback={null}>
                  <LazyConsentFlowManager />
                </Suspense>
                <VisitorTrackingManager />
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: '#363636',
                      color: '#fff',
                    },
                    success: {
                      duration: 3000,
                      iconTheme: {
                        primary: '#10B981',
                        secondary: '#fff',
                      },
                    },
                    error: {
                      duration: 5000,
                      iconTheme: {
                        primary: '#EF4444',
                        secondary: '#fff',
                      },
                    },
                  }}
                />
                </Router>
              </AuthProvider>
            </VisitorTrackingProvider>
          </CookieConsentProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;
