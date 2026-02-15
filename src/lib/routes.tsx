import { lazy, Suspense, ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { MobileLayout } from '@/components/layout/MobileLayout';

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
const Reports = lazy(() => import('@/pages/Reports'));
const PublicReport = lazy(() => import('@/pages/PublicReport'));
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

// Protected layout shell - keeps background/nav mounted across route changes
export const ProtectedLayout = () => (
  <RequireAuth>
    <MobileLayout>
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
    </MobileLayout>
  </RequireAuth>
);

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

  // Protected routes (layout kept mounted)
  {
    path: '/',
    element: <ProtectedLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'agenda',
        element: <Agenda />,
      },
      {
        path: 'properties',
        element: <Properties />,
      },
      {
        path: 'properties/:id',
        element: <PropertyDetails />,
      },
      {
        path: 'jobs/:id',
        element: <JobDetails />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
      {
        path: 'finance',
        element: <Finance />,
      },
      {
        path: 'reports',
        element: <Reports />,
      },
    ],
  },

  // Execution is a special flow with its own layout
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

  // Public report viewer (no auth)
  {
    path: '/r/:token',
    element: (
      <SuspenseWrapper>
        <PublicReport />
      </SuspenseWrapper>
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
