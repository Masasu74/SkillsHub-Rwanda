import { useEffect } from 'react';
import { FiBook, FiFlag, FiPlayCircle } from 'react-icons/fi';
import ProgressBar from '../components/ProgressBar';
import { useAppContext } from '../context/AppContext';

const Dashboard = () => {
  const { user, enrollments, fetchEnrollments } = useAppContext();

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  const activeEnrollments = enrollments.filter((enrollment) => enrollment.status === 'active');
  const completedEnrollments = enrollments.filter((enrollment) => enrollment.status === 'completed');

  return (
    <div className="space-y-10">
      <section className="rounded-3xl bg-purple-600 p-8 text-white shadow-xl">
        <h2 className="text-2xl font-semibold">
          {user?.role === 'instructor' ? 'Welcome back, mentor!' : 'Welcome to SkillsHub Rwanda'}
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-purple-100/90">
          {user?.role === 'instructor'
            ? 'Lead your learners with impactful lessons and support them through their journey.'
            : 'Discover career-ready skills, track your growth, and stay motivated as you progress.'}
        </p>
      </section>

      <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Active</span>
            <span className="rounded-full bg-purple-100/80 px-3 py-1 text-xs font-semibold text-purple-600 dark:bg-purple-500/20 dark:text-purple-200">
              <FiPlayCircle className="inline-flex text-base" />
            </span>
          </div>
          <p className="mt-4 text-3xl font-bold text-slate-900 dark:text-white">
            {activeEnrollments.length}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Courses in progress</p>
        </div>
        
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              Completed
            </span>
            <span className="rounded-full bg-emerald-100/80 px-3 py-1 text-xs font-semibold text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-200">
              <FiFlag className="inline-flex text-base" />
            </span>
          </div>
          <p className="mt-4 text-3xl font-bold text-slate-900 dark:text-white">
            {completedEnrollments.length}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Milestones achieved</p>
        </div>
        
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900 sm:col-span-2 xl:col-span-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Learning momentum
          </h3>
          <div className="mt-4 space-y-4">
            {enrollments.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-purple-200 bg-purple-50/60 p-6 text-sm text-purple-500 dark:border-purple-500/40 dark:bg-purple-500/10 dark:text-purple-200">
                Enroll in your first course to start tracking your learning progress.
              </p>
            ) : (
              enrollments.slice(0, 3).map((enrollment) => (
                <div key={enrollment._id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      {enrollment.course?.title || 'Course'}
                    </span>
                    <span className="text-xs uppercase tracking-wide text-slate-400">
                      {enrollment.status}
                    </span>
                  </div>
                  <ProgressBar value={enrollment.progress} />
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <span className="rounded-2xl bg-purple-100/80 p-3 text-purple-600 dark:bg-purple-500/20 dark:text-purple-200">
            <FiBook className="text-xl" />
          </span>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Your learning plan
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Stay consistent with weekly study goals and modular learning experiences tailored for
              youths in Rwanda.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;

