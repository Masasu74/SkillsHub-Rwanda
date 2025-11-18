import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiBook,
  FiClock,
  FiTag,
  FiUser,
  FiPlay,
  FiEdit2,
  FiUsers,
  FiTrendingUp,
  FiCheckCircle,
  FiAward
} from 'react-icons/fi';
import ProgressBar from '../components/ProgressBar';
import { useAppContext } from '../context/AppContext';
import { toast } from 'react-toastify';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { api, user, enrollInCourse, enrollments, fetchCourseEnrollments, fetchCourseAnalytics } = useAppContext();
  const [course, setCourse] = useState(null);
  const [courseEnrollments, setCourseEnrollments] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/courses/${id}`);
        if (data.success) {
          setCourse(data.data);
        } else {
          toast.error('Course not found');
          navigate('/courses');
        }
      } catch (error) {
        console.error('Failed to fetch course:', error);
        toast.error('Failed to load course details');
        navigate(user?.role === 'student' ? '/courses' : '/my-courses');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCourse();
    }
  }, [id, api, navigate, user]);

  const isOwner =
    course?.instructor?._id?.toString() === (user?.id?.toString() || user?._id?.toString()) ||
    user?.role === 'admin';

  useEffect(() => {
    const fetchEnrollmentsAndAnalytics = async () => {
      if (!isOwner || !id || !course) return;

      setLoadingEnrollments(true);
      setLoadingAnalytics(true);

      const [enrollmentsResult, analyticsResult] = await Promise.all([
        fetchCourseEnrollments(id),
        fetchCourseAnalytics(id)
      ]);

      if (enrollmentsResult.success) {
        setCourseEnrollments(enrollmentsResult.data);
      }
      if (analyticsResult.success) {
        setAnalytics(analyticsResult.data);
      }

      setLoadingEnrollments(false);
      setLoadingAnalytics(false);
    };

    if (course && isOwner) {
      fetchEnrollmentsAndAnalytics();
    }
  }, [course, isOwner, id, fetchCourseEnrollments, fetchCourseAnalytics]);

  const isEnrolled = enrollments.some(
    (enrollment) =>
      (typeof enrollment.course === 'string'
        ? enrollment.course
        : enrollment.course?._id?.toString()) === id
  );

  const handleEnroll = async () => {
    setEnrolling(true);
    const { success } = await enrollInCourse(id);
    setEnrolling(false);
    if (success) {
      navigate(`/learn/${id}`);
    }
  };

  const handleStartLearning = () => {
    navigate(`/learn/${id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-16 w-16 animate-spin rounded-full border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 text-xl font-semibold text-slate-900 dark:text-white">Course not found</h2>
        <button
          onClick={() => navigate(user?.role === 'student' ? '/courses' : '/my-courses')}
          className="rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white transition hover:bg-purple-500"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <button
        onClick={() => navigate(user?.role === 'student' ? '/courses' : '/my-courses')}
        className="flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-200"
      >
        <FiArrowLeft />
        Back
      </button>

      <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
        {/* Main Content */}
        <div className="space-y-8">
          {/* Course Header */}
          <div className="space-y-4">
            {course.imageUrl && (
              <div className="aspect-video overflow-hidden rounded-3xl bg-slate-200">
                <img
                  src={course.imageUrl}
                  alt={course.title}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <div>
              <h1 className="mb-2 text-3xl font-bold text-slate-900 dark:text-white">
                {course.title}
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400">{course.description}</p>
            </div>
          </div>

          {/* Course Info */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 text-xl font-semibold text-slate-900 dark:text-white">Course Details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3">
                <FiTag className="text-purple-600" />
                <div>
                  <span className="text-sm text-slate-500 dark:text-slate-400">Category</span>
                  <p className="font-medium capitalize text-slate-900 dark:text-white">{course.category}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FiBook className="text-purple-600" />
                <div>
                  <span className="text-sm text-slate-500 dark:text-slate-400">Level</span>
                  <p className="font-medium capitalize text-slate-900 dark:text-white">{course.level}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FiClock className="text-purple-600" />
                <div>
                  <span className="text-sm text-slate-500 dark:text-slate-400">Duration</span>
                  <p className="font-medium text-slate-900 dark:text-white">{course.duration} hours</p>
                </div>
              </div>
              {course.instructor && (
                <div className="flex items-center gap-3">
                  <FiUser className="text-purple-600" />
                  <div>
                    <span className="text-sm text-slate-500 dark:text-slate-400">Instructor</span>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {course.instructor?.name || 'Unknown'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Modules */}
          {course.modules && course.modules.length > 0 && (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="mb-4 text-xl font-semibold text-slate-900 dark:text-white">
                Course Modules ({course.modules.length})
              </h2>
              <div className="space-y-4">
                {course.modules.map((module, index) => (
                  <div
                    key={module._id || index}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="mb-2 font-semibold text-slate-900 dark:text-white">
                          Module {index + 1}: {module.title}
                        </h3>
                        {module.content && (
                          <p className="mb-2 text-sm text-slate-600 dark:text-slate-400">
                            {module.content.substring(0, 150)}
                            {module.content.length > 150 ? '...' : ''}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                          {module.duration > 0 && (
                            <span className="flex items-center gap-1">
                              <FiClock /> {module.duration} min
                            </span>
                          )}
                          {module.videoUrl && (
                            <span className="flex items-center gap-1">
                              <FiPlay /> Video included
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Enrolled Users - Only for course owners */}
          {isOwner && (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-slate-900 dark:text-white">
                <FiUsers className="text-purple-600" />
                Enrolled Students ({courseEnrollments.length})
              </h2>
              {loadingEnrollments ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-purple-500" />
                </div>
              ) : courseEnrollments.length === 0 ? (
                <p className="rounded-xl border border-dashed border-purple-200 bg-purple-50/50 p-6 text-center text-sm text-purple-600 dark:border-purple-500/40 dark:bg-purple-500/10 dark:text-purple-200">
                  No students enrolled yet
                </p>
              ) : (
                <div className="space-y-3">
                  {courseEnrollments.map((enrollment) => (
                    <div
                      key={enrollment._id}
                      className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800"
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900 dark:text-white">
                          {enrollment.student?.name || 'Unknown Student'}
                        </h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {enrollment.student?.email || 'No email'}
                        </p>
                        <div className="mt-2 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                          <span className="capitalize">{enrollment.status}</span>
                          <span>Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="ml-4 w-32">
                        <ProgressBar value={enrollment.progress || 0} />
                        <p className="mt-1 text-center text-xs text-slate-500 dark:text-slate-400">
                          {Math.round(enrollment.progress || 0)}% Complete
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Course Analytics - Only for course owners */}
          {isOwner && analytics && (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-slate-900 dark:text-white">
                <FiTrendingUp className="text-purple-600" />
                Course Analytics
              </h2>
              {loadingAnalytics ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-purple-500" />
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <FiUsers />
                      Total Enrollments
                    </div>
                    <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                      {analytics.totalEnrollments}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <FiPlay />
                      Active
                    </div>
                    <p className="mt-2 text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {analytics.activeEnrollments}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <FiCheckCircle />
                      Completed
                    </div>
                    <p className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {analytics.completedEnrollments}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <FiTrendingUp />
                      Avg Progress
                    </div>
                    <p className="mt-2 text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {analytics.avgProgress.toFixed(1)}%
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <FiAward />
                      Completion Rate
                    </div>
                    <p className="mt-2 text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {analytics.completionRate}%
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <FiAward />
                      Certificates Issued
                    </div>
                    <p className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {analytics.certificatesIssued}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900">
            {course.price > 0 ? (
              <div className="mb-4">
                <span className="text-3xl font-bold text-slate-900 dark:text-white">
                  {course.price.toLocaleString()} RWF
                </span>
              </div>
            ) : (
              <div className="mb-4">
                <span className="text-3xl font-bold text-slate-900 dark:text-white">Free</span>
              </div>
            )}

            {isOwner ? (
              <div className="space-y-3">
                <button
                  onClick={() => navigate(`/courses/${id}/edit`)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white transition hover:bg-purple-500"
                >
                  <FiEdit2 />
                  Edit Course
                </button>
                <p className="text-center text-xs text-slate-500 dark:text-slate-400">
                  You own this course
                </p>
              </div>
            ) : user?.role === 'student' ? (
              <div className="space-y-3">
                {isEnrolled ? (
                  <button
                    onClick={handleStartLearning}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white transition hover:bg-purple-500"
                  >
                    <FiPlay />
                    Continue Learning
                  </button>
                ) : (
                  <button
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <FiPlay />
                    {enrolling ? 'Enrolling...' : 'Enroll Now'}
                  </button>
                )}
              </div>
            ) : null}

            {!course.isPublished && (
              <div className="mt-4 rounded-lg bg-amber-50 p-3 text-center text-sm text-amber-700 dark:bg-amber-500/20 dark:text-amber-200">
                This course is not yet published
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;

