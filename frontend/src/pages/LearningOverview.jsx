import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowRight, FiBookOpen } from 'react-icons/fi';
import { useAppContext } from '../context/AppContext';

const LearningOverview = () => {
  const {
    enrollments,
    enrollmentsLoading,
    fetchEnrollments,
    coursesLoading,
    user
  } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  const handleContinue = (courseId) => {
    navigate(`/learn/${courseId}`);
  };

  const renderEmptyState = () => (
    <div className="rounded-3xl border border-dashed border-purple-200 bg-purple-50/60 p-10 text-center text-sm text-purple-500 dark:border-purple-500/30 dark:bg-purple-500/10 dark:text-purple-200">
      <p className="text-base font-semibold text-purple-700 dark:text-purple-200">
        You haven’t enrolled in any courses yet.
      </p>
      <p className="mt-2 text-sm">
        Explore the course catalog to discover learning tracks aligned with your goals.
      </p>
      <button
        type="button"
        onClick={() => navigate('/courses')}
        className="mt-6 inline-flex items-center justify-center rounded-full bg-purple-600 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-purple-500"
      >
        Browse courses
      </button>
    </div>
  );

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">
          Continue learning
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {user?.name
            ? `${user.name.split(' ')[0]}, pick up where you left off or jump into a new module.`
            : 'Fuel your growth with SkillsHub Rwanda coursework.'}
        </p>
      </header>

      {(enrollmentsLoading || coursesLoading) && (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {[...Array(3)].map((_, index) => (
            <div
              key={`skeleton-${index}`}
              className="h-48 animate-pulse rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
            />
          ))}
        </div>
      )}

      {!enrollmentsLoading && !coursesLoading && (
        <>
          {enrollments.length === 0 && renderEmptyState()}

          {enrollments.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {enrollments.map((enrollment) => {
                const course = enrollment.course;
                const courseId = typeof course === 'string' ? course : course?._id;
                const progress = enrollment.progress ?? 0;
                const lastAccessed = enrollment.lastAccessed
                  ? new Date(enrollment.lastAccessed)
                  : null;

                return (
                  <article
                    key={courseId}
                    className="flex h-full flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-lg transition hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="space-y-3">
                      <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-purple-700 dark:bg-purple-500/20 dark:text-purple-200">
                        <FiBookOpen className="text-sm" />
                        <span>{course?.category}</span>
                      </div>
                      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                        {course?.title || 'SkillsHub course'}
                      </h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3">
                        {course?.description}
                      </p>

                      <div>
                        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                          <span>Progress</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="mt-2 h-2 rounded-full bg-slate-200 dark:bg-slate-800">
                          <div
                            className="h-full rounded-full bg-purple-500 transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-col gap-2 text-xs text-slate-400 dark:text-slate-500">
                      {lastAccessed && (
                        <span>
                          Last visited on{' '}
                          {lastAccessed.toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleContinue(courseId)}
                        className="mt-3 inline-flex items-center justify-center gap-2 rounded-full bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-purple-500"
                      >
                        Continue learning
                        <FiArrowRight />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default LearningOverview;

