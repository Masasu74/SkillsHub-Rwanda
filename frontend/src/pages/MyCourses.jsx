import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBook, FiEdit2, FiEye, FiPlus, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-toastify';
import CourseCard from '../components/CourseCard';
import { useAppContext } from '../context/AppContext';

const MyCourses = () => {
  const navigate = useNavigate();
  const { courses, coursesLoading, fetchMyCourses, deleteCourse } = useAppContext();
  const [deleting, setDeleting] = useState({});

  useEffect(() => {
    fetchMyCourses();
  }, [fetchMyCourses]);

  const handleViewCourse = (course) => {
    navigate(`/courses/${course._id}`);
  };

  const handleDeleteCourse = async (courseId, courseTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${courseTitle}"? This action cannot be undone and will also delete all enrollments associated with this course.`)) {
      return;
    }

    setDeleting((prev) => ({ ...prev, [courseId]: true }));
    const { success } = await deleteCourse(courseId);
    setDeleting((prev) => ({ ...prev, [courseId]: false }));

    if (success) {
      await fetchMyCourses();
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <header className="space-y-2">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
            My Courses
          </h2>
          <p className="max-w-2xl text-sm text-slate-500 dark:text-slate-400">
            Manage and view all courses you have created. Edit course details, add modules, and track student progress.
          </p>
        </header>
        <button
          onClick={() => navigate('/create-course')}
          className="flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-purple-500"
        >
          <FiPlus className="text-lg" />
          Create Course
        </button>
      </div>

      {coursesLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-72 animate-pulse rounded-3xl border border-slate-200 bg-slate-100/60 dark:border-slate-800 dark:bg-slate-900/60"
            />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-purple-200 bg-purple-50/50 p-12 text-center dark:border-purple-500/40 dark:bg-purple-500/10">
          <FiBook className="mx-auto mb-4 text-4xl text-purple-500 dark:text-purple-400" />
          <h3 className="mb-2 text-lg font-semibold text-purple-700 dark:text-purple-200">
            No courses yet
          </h3>
          <p className="mb-6 text-sm text-purple-600 dark:text-purple-300">
            Get started by creating your first course to share knowledge with students.
          </p>
          <button
            onClick={() => navigate('/create-course')}
            className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-purple-500"
          >
            <FiPlus className="text-lg" />
            Create Your First Course
          </button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => (
            <div
              key={course._id}
              className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg transition hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
            >
              {course.imageUrl && (
                <div className="aspect-video overflow-hidden bg-slate-200">
                  <img
                    src={course.imageUrl}
                    alt={course.title}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                </div>
              )}
              <div className="p-6">
                <div className="mb-2 flex items-start justify-between">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {course.title}
                  </h3>
                  {course.isPublished ? (
                    <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200">
                      Published
                    </span>
                  ) : (
                    <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/20 dark:text-amber-200">
                      Draft
                    </span>
                  )}
                </div>
                <p className="mb-4 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
                  {course.description}
                </p>
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>{course.category}</span>
                  <span className="capitalize">{course.level}</span>
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handleViewCourse(course)}
                    className="flex-1 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-500"
                  >
                    <FiEye className="mr-2 inline" />
                    View
                  </button>
                  <button
                    onClick={() => navigate(`/courses/${course._id}/edit`)}
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                    title="Edit Course"
                  >
                    <FiEdit2 className="text-base" />
                  </button>
                  <button
                    onClick={() => handleDeleteCourse(course._id, course.title)}
                    disabled={deleting[course._id]}
                    className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-700 dark:bg-slate-800 dark:text-red-400 dark:hover:bg-red-500/20"
                    title="Delete Course"
                  >
                    {deleting[course._id] ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                    ) : (
                      <FiTrash2 className="text-base" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCourses;

