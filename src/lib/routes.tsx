import { lazy, Suspense, ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

// Lazy loading for performance
const Login = lazy(() => import('@/pages/auth/Login'));
const ResetPassword = lazy(() => import('@/pages/auth/ResetPassword'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Agenda = lazy(() => import('@/pages/Agenda'));
const Properties = lazy(() => import('@/pages/Properties'));
const PropertyDetails = lazy(() => import('@/pages/PropertyDetails'));
const JobDetails = lazy(() => import('@/pages/JobDetails'));
const Execution = lazy(() => import('@/pages/Execution'));
const Settings = lazy(() => import('@/pages/Settings'));
const Finance = lazy(() => import('@/pages/Finance'));
const NotFound = lazy(() => import('@/pages/NotFound'));

// Animated Loading component
export const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center gap-4"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        <Loader2 className="w-10 h-10 text-primary" />
      </motion.div>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-sm text-muted-foreground font-medium"
      >
        Carregando...
      </motion.span>
    </motion.div>
  </div>
);

// Auth Guard - protects private routes
export const RequireAuth = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <PageLoader />;
  }
  
  if (!user) {
    // Redirect to login while saving intended destination
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Public only - redirects authenticated users
export const PublicOnly = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <PageLoader />;
  }
  
  if (user) {
    // Redirect to dashboard or previous intended destination
    const from = (location.state as any)?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
};

// Suspense wrapper for lazy components
const SuspenseWrapper = ({ children }: { children: ReactNode }) => (
  <Suspense fallback={<PageLoader />}>
    {children}
  </Suspense>
);

// Route definitions
export const routes = [
  // Public routes (redirect if logged in)
  {
    path: '/login',
    element: (
      <PublicOnly>
        <SuspenseWrapper>
          <Login />
        </SuspenseWrapper>
      </PublicOnly>
    ),
  },
  {
    path: '/reset-password',
    element: (
      <SuspenseWrapper>
        <ResetPassword />
      </SuspenseWrapper>
    ),
  },
  
  // Protected routes
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/dashboard',
    element: (
      <RequireAuth>
        <SuspenseWrapper>
          <Dashboard />
        </SuspenseWrapper>
      </RequireAuth>
    ),
  },
  {
    path: '/agenda',
    element: (
      <RequireAuth>
        <SuspenseWrapper>
          <Agenda />
        </SuspenseWrapper>
      </RequireAuth>
    ),
  },
  {
    path: '/properties',
    element: (
      <RequireAuth>
        <SuspenseWrapper>
          <Properties />
        </SuspenseWrapper>
      </RequireAuth>
    ),
  },
  {
    path: '/properties/:id',
    element: (
      <RequireAuth>
        <SuspenseWrapper>
          <PropertyDetails />
        </SuspenseWrapper>
      </RequireAuth>
    ),
  },
  {
    path: '/jobs/:id',
    element: (
      <RequireAuth>
        <SuspenseWrapper>
          <JobDetails />
        </SuspenseWrapper>
      </RequireAuth>
    ),
  },
  {
    path: '/execution/:jobId',
    element: (
      <RequireAuth>
        <SuspenseWrapper>
          <Execution />
        </SuspenseWrapper>
      </RequireAuth>
    ),
  },
  {
    path: '/settings',
    element: (
      <RequireAuth>
        <SuspenseWrapper>
          <Settings />
        </SuspenseWrapper>
      </RequireAuth>
    ),
  },
  {
    path: '/finance',
    element: (
      <RequireAuth>
        <SuspenseWrapper>
          <Finance />
        </SuspenseWrapper>
      </RequireAuth>
    ),
  },
  
  // 404 catch-all
  {
    path: '*',
    element: (
      <SuspenseWrapper>
        <NotFound />
      </SuspenseWrapper>
    ),
  },
];
