import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiBook,
  FiFlag,
  FiPlayCircle,
  FiUsers,
  FiEdit,
  FiCheckCircle,
  FiPlus,
  FiTrendingUp
} from 'react-icons/fi';
import ProgressBar from '../components/ProgressBar';
import { useAppContext } from '../context/AppContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, enrollments, courses, fetchEnrollments, fetchMyCourses, fetchCourses } = useAppContext();

  useEffect(() => {
    if (user?.role === 'student') {
      fetchEnrollments();
    } else if (user?.role === 'instructor' || user?.role === 'admin') {
      if (user?.role === 'instructor') {
        fetchMyCourses();
      } else {
        fetchCourses();
      }
    }
  }, [user, fetchEnrollments, fetchMyCourses, fetchCourses]);

  // Student Dashboard
  if (user?.role === 'student') {
    const activeEnrollments = enrollments.filter((enrollment) => enrollment.status === 'active');
    const completedEnrollments = enrollments.filter(
      (enrollment) => enrollment.status === 'completed'
    );

    return (
      <div className="space-y-10">
        <section className="rounded-3xl bg-purple-600 p-8 text-white shadow-xl">
          <h2 className="text-2xl font-semibold">Welcome to SkillsHub Rwanda</h2>
          <p className="mt-2 max-w-2xl text-sm text-purple-100/90">
            Discover career-ready skills, track your growth, and stay motivated as you progress.
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
  }

  // Instructor Dashboard
  if (user?.role === 'instructor') {
    const publishedCourses = courses.filter((course) => course.isPublished);
    const draftCourses = courses.filter((course) => !course.isPublished);

    return (
      <div className="space-y-10">
        <section className="rounded-3xl bg-purple-600 p-8 text-white shadow-xl">
          <h2 className="text-2xl font-semibold">Welcome back, mentor!</h2>
          <p className="mt-2 max-w-2xl text-sm text-purple-100/90">
            Lead your learners with impactful lessons and support them through their journey.
          </p>
        </section>

        <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total</span>
              <span className="rounded-full bg-purple-100/80 px-3 py-1 text-xs font-semibold text-purple-600 dark:bg-purple-500/20 dark:text-purple-200">
                <FiBook className="inline-flex text-base" />
              </span>
            </div>
            <p className="mt-4 text-3xl font-bold text-slate-900 dark:text-white">
              {courses.length}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">My Courses</p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                Published
              </span>
              <span className="rounded-full bg-emerald-100/80 px-3 py-1 text-xs font-semibold text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-200">
                <FiCheckCircle className="inline-flex text-base" />
              </span>
            </div>
            <p className="mt-4 text-3xl font-bold text-slate-900 dark:text-white">
              {publishedCourses.length}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Live Courses</p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Drafts</span>
              <span className="rounded-full bg-amber-100/80 px-3 py-1 text-xs font-semibold text-amber-600 dark:bg-amber-500/20 dark:text-amber-200">
                <FiEdit className="inline-flex text-base" />
              </span>
            </div>
            <p className="mt-4 text-3xl font-bold text-slate-900 dark:text-white">
              {draftCourses.length}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">In Progress</p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Modules</span>
              <span className="rounded-full bg-blue-100/80 px-3 py-1 text-xs font-semibold text-blue-600 dark:bg-blue-500/20 dark:text-blue-200">
                <FiTrendingUp className="inline-flex text-base" />
              </span>
            </div>
            <p className="mt-4 text-3xl font-bold text-slate-900 dark:text-white">
              {courses.reduce((total, course) => total + (course.modules?.length || 0), 0)}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Total Modules</p>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="rounded-2xl bg-purple-100/80 p-3 text-purple-600 dark:bg-purple-500/20 dark:text-purple-200">
                <FiBook className="text-xl" />
              </span>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Course Management
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Create and manage your courses to share knowledge with students.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/create-course')}
              className="flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white transition hover:bg-purple-500"
            >
              <FiPlus />
              Create Course
            </button>
          </div>
        </section>

        {courses.length > 0 && (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
              Recent Courses
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {courses.slice(0, 3).map((course) => (
                <div
                  key={course._id}
                  onClick={() => navigate(`/courses/${course._id}`)}
                  className="cursor-pointer rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-purple-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:hover:border-purple-500"
                >
                  <h4 className="mb-2 font-semibold text-slate-900 dark:text-white">
                    {course.title}
                  </h4>
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span className="capitalize">{course.category}</span>
                    {course.isPublished ? (
                      <span className="rounded-full bg-emerald-100 px-2 py-1 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200">
                        Published
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber-100 px-2 py-1 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200">
                        Draft
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    );
  }

  // Admin Dashboard
  if (user?.role === 'admin') {
    const publishedCourses = courses.filter((course) => course.isPublished);
    const draftCourses = courses.filter((course) => !course.isPublished);

    return (
      <div className="space-y-10">
        <section className="rounded-3xl bg-purple-600 p-8 text-white shadow-xl">
          <h2 className="text-2xl font-semibold">Admin Dashboard</h2>
          <p className="mt-2 max-w-2xl text-sm text-purple-100/90">
            Manage the SkillsHub Rwanda platform, oversee courses, and support instructors and students.
          </p>
        </section>

        <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total</span>
              <span className="rounded-full bg-purple-100/80 px-3 py-1 text-xs font-semibold text-purple-600 dark:bg-purple-500/20 dark:text-purple-200">
                <FiBook className="inline-flex text-base" />
              </span>
            </div>
            <p className="mt-4 text-3xl font-bold text-slate-900 dark:text-white">
              {courses.length}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">All Courses</p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                Published
              </span>
              <span className="rounded-full bg-emerald-100/80 px-3 py-1 text-xs font-semibold text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-200">
                <FiCheckCircle className="inline-flex text-base" />
              </span>
            </div>
            <p className="mt-4 text-3xl font-bold text-slate-900 dark:text-white">
              {publishedCourses.length}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Live Courses</p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Drafts</span>
              <span className="rounded-full bg-amber-100/80 px-3 py-1 text-xs font-semibold text-amber-600 dark:bg-amber-500/20 dark:text-amber-200">
                <FiEdit className="inline-flex text-base" />
              </span>
            </div>
            <p className="mt-4 text-3xl font-bold text-slate-900 dark:text-white">
              {draftCourses.length}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Pending</p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Actions</span>
              <span className="rounded-full bg-blue-100/80 px-3 py-1 text-xs font-semibold text-blue-600 dark:bg-blue-500/20 dark:text-blue-200">
                <FiUsers className="inline-flex text-base" />
              </span>
            </div>
            <p className="mt-4 text-3xl font-bold text-slate-900 dark:text-white">2</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Quick Actions</p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div 
            onClick={() => navigate('/instructors')}
            className="cursor-pointer rounded-3xl border border-slate-200 bg-white p-6 shadow-lg transition hover:border-purple-300 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 dark:hover:border-purple-500"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="rounded-2xl bg-purple-100/80 p-3 text-purple-600 dark:bg-purple-500/20 dark:text-purple-200">
                  <FiUsers className="text-xl" />
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Manage Instructors
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Create and manage instructor accounts
                  </p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/create-instructor');
                }}
                className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-500"
              >
                <FiPlus />
                Add
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="rounded-2xl bg-purple-100/80 p-3 text-purple-600 dark:bg-purple-500/20 dark:text-purple-200">
                  <FiBook className="text-xl" />
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Create Course
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Add a new course to the platform
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate('/create-course')}
                className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-500"
              >
                <FiPlus />
                Create
              </button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return null;
};

export default Dashboard;

