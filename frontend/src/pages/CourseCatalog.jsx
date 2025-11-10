import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CourseCard from '../components/CourseCard';
import SearchBar from '../components/SearchBar';
import { useAppContext } from '../context/AppContext';

const CourseCatalog = () => {
  const navigate = useNavigate();
  const { courses, coursesLoading, enrollments, fetchCourses, enrollInCourse } = useAppContext();
  const [filters, setFilters] = useState({ search: '', category: '', level: '' });

  useEffect(() => {
    fetchCourses({
      ...(filters.search && { search: filters.search }),
      ...(filters.category && { category: filters.category }),
      ...(filters.level && { level: filters.level })
    });
  }, [filters.search, filters.category, filters.level, fetchCourses]);

  const enrolledCourseIds = useMemo(
    () =>
      new Set(
        enrollments.map((enrollment) =>
          typeof enrollment.course === 'string' ? enrollment.course : enrollment.course?._id
        )
      ),
    [enrollments]
  );

  const handleViewCourse = async (course) => {
    const courseId = course._id;
    if (!enrolledCourseIds.has(courseId)) {
      const { success } = await enrollInCourse(courseId);
      if (!success) {
        return;
      }
    }
    navigate(`/learn/${courseId}`);
  };

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
          Explore SkillsHub courses
        </h2>
        <p className="max-w-2xl text-sm text-slate-500 dark:text-slate-400">
          Discover curated programs designed with Rwanda&apos;s future in mind—from technology and
          digital literacy to business and hospitality.
        </p>
      </header>

      <SearchBar filters={filters} onChange={setFilters} />

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
        <div className="rounded-3xl border border-dashed border-purple-200 bg-purple-50/50 p-12 text-center text-sm font-medium text-purple-500 dark:border-purple-500/40 dark:bg-purple-500/10 dark:text-purple-200">
          No courses found with the selected filters. Try adjusting your search to discover more
          learning opportunities.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => (
            <CourseCard key={course._id} course={course} onSelect={handleViewCourse} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseCatalog;

