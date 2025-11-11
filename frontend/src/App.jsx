import { Suspense, lazy } from 'react';
import {
  Navigate,
  Outlet,
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements
} from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import ScrollToTop from './components/ScrollToTop';
import DynamicFavicon from './components/DynamicFavicon';
import DynamicTitle from './components/DynamicTitle';
import { AppProvider, useAppContext } from './context/AppContext';
import { SystemSettingsProvider } from './context/SystemSettingsContext';
import { ThemeProvider } from './context/ThemeContext';
import RootLayout from './layout/RootLayout';

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="h-16 w-16 animate-spin rounded-full border-t-2 border-b-2 border-purple-500" />
  </div>
);

const Landing = lazy(() => import('./pages/Landing'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const CourseCatalog = lazy(() => import('./pages/CourseCatalog'));
const LearningOverview = lazy(() => import('./pages/LearningOverview'));
const LearningInterface = lazy(() => import('./pages/LearningInterface'));
const Login = lazy(() => import('./pages/Login'));

const ProtectedRoute = () => {
  const { user, loading } = useAppContext();

  if (loading) {
    return <LoadingFallback />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <RootLayout>
      <ScrollToTop />
      <Suspense fallback={<LoadingFallback />}>
        <Outlet />
      </Suspense>
    </RootLayout>
  );
};

const App = () => {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/">
        <Route
          index
          element={
            <Suspense fallback={<LoadingFallback />}>
              <Landing />
            </Suspense>
          }
        />
        <Route
          path="login"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <Login />
            </Suspense>
          }
        />
        <Route element={<ProtectedRoute />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/courses" element={<CourseCatalog />} />
          <Route path="/learn" element={<LearningOverview />} />
          <Route path="/learn/:courseId" element={<LearningInterface />} />
        </Route>
      </Route>
    )
  );

  return (
    <ThemeProvider>
      <AppProvider>
        <SystemSettingsProvider>
        <div className="App min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
          <DynamicFavicon />
          <DynamicTitle />
          <RouterProvider router={router} />
          <ToastContainer
            position="top-right"
            autoClose={4000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
          />
        </div>
        </SystemSettingsProvider>
      </AppProvider>
    </ThemeProvider>
  );
};

export default App;