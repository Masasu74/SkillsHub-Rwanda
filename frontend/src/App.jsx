import { Suspense, lazy } from 'react';
import PropTypes from 'prop-types';
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
import { ErrorBoundary } from './components/ErrorBoundary';
import { ErrorBoundaryClass } from './components/ErrorBoundary';
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
const CourseDetail = lazy(() => import('./pages/CourseDetail'));
const LearningOverview = lazy(() => import('./pages/LearningOverview'));
const LearningInterface = lazy(() => import('./pages/LearningInterface'));
const Login = lazy(() => import('./pages/Login'));
const ManageInstructors = lazy(() => import('./pages/ManageInstructors'));
const InstructorDetail = lazy(() => import('./pages/InstructorDetail'));
const CreateInstructor = lazy(() => import('./pages/CreateInstructor'));
const CreateCourse = lazy(() => import('./pages/CreateCourse'));
const MyCourses = lazy(() => import('./pages/MyCourses'));

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

const RoleBasedRoute = ({ allowedRoles, children }) => {
  const { user, loading } = useAppContext();

  if (loading) {
    return <LoadingFallback />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

RoleBasedRoute.propTypes = {
  allowedRoles: PropTypes.arrayOf(PropTypes.string).isRequired,
  children: PropTypes.node.isRequired
};

const App = () => {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" errorElement={<ErrorBoundary />}>
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
        <Route element={<ProtectedRoute />} errorElement={<ErrorBoundary />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route
            path="/courses"
            element={
              <RoleBasedRoute allowedRoles={['student']}>
                <CourseCatalog />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/courses/:id/edit"
            element={
              <RoleBasedRoute allowedRoles={['instructor', 'admin']}>
                <CreateCourse />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/courses/:id"
            element={
              <RoleBasedRoute allowedRoles={['student', 'instructor', 'admin']}>
                <CourseDetail />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/learn"
            element={
              <RoleBasedRoute allowedRoles={['student']}>
                <LearningOverview />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/learn/:courseId"
            element={
              <RoleBasedRoute allowedRoles={['student']}>
                <LearningInterface />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/instructors"
            element={
              <RoleBasedRoute allowedRoles={['admin']}>
                <ManageInstructors />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/instructors/:id/edit"
            element={
              <RoleBasedRoute allowedRoles={['admin']}>
                <CreateInstructor />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/instructors/:id"
            element={
              <RoleBasedRoute allowedRoles={['admin']}>
                <InstructorDetail />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/create-instructor"
            element={
              <RoleBasedRoute allowedRoles={['admin']}>
                <CreateInstructor />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/create-course"
            element={
              <RoleBasedRoute allowedRoles={['instructor', 'admin']}>
                <CreateCourse />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/my-courses"
            element={
              <RoleBasedRoute allowedRoles={['instructor', 'admin']}>
                <MyCourses />
              </RoleBasedRoute>
            }
          />
        </Route>
      </Route>
    )
  );

  return (
    <ErrorBoundaryClass>
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
    </ErrorBoundaryClass>
  );
};

export default App;