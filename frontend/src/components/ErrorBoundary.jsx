import { Component } from 'react';
import { useNavigate, useRouteError } from 'react-router-dom';
import { FiAlertCircle, FiHome } from 'react-icons/fi';

export const ErrorBoundary = () => {
  const error = useRouteError();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-lg dark:border-slate-800 dark:bg-slate-900">
        <FiAlertCircle className="mx-auto mb-4 text-5xl text-red-500" />
        <h1 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">
          {error?.status === 404 ? '404 Not Found' : 'Oops! Something went wrong'}
        </h1>
        <p className="mb-6 text-slate-600 dark:text-slate-400">
          {error?.status === 404
            ? "The page you're looking for doesn't exist."
            : error?.message || 'An unexpected error occurred. Please try again.'}
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Go Back
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white transition hover:bg-purple-500"
          >
            <FiHome />
            Home
          </button>
        </div>
      </div>
    </div>
  );
};

export class ErrorBoundaryClass extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
          <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-lg dark:border-slate-800 dark:bg-slate-900">
            <FiAlertCircle className="mx-auto mb-4 text-5xl text-red-500" />
            <h1 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">
              Something went wrong
            </h1>
            <p className="mb-6 text-slate-600 dark:text-slate-400">
              {this.state.error?.message || 'An unexpected error occurred. Please refresh the page.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white transition hover:bg-purple-500"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

