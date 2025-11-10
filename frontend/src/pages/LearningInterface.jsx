import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import ModuleNavigation from '../components/ModuleNavigation';
import ProgressBar from '../components/ProgressBar';
import VideoPlayer from '../components/VideoPlayer';
import { useAppContext } from '../context/AppContext';

const LearningInterface = () => {
  const { courseId } = useParams();
  const { api, enrollments, getCourseProgress, updateProgress } = useAppContext();
  const [course, setCourse] = useState(null);
  const [progressEntry, setProgressEntry] = useState(null);
  const [activeModule, setActiveModule] = useState(null);
  const [loading, setLoading] = useState(true);

  const enrollment = useMemo(
    () =>
      enrollments.find(
        (item) =>
          item.course === courseId || item.course?._id?.toString() === courseId?.toString()
      ),
    [enrollments, courseId]
  );

  useEffect(() => {
    const loadCourse = async () => {
      try {
        const [{ data: courseResponse }, progressResponse] = await Promise.all([
          api.get(`/courses/${courseId}`),
          getCourseProgress(courseId)
        ]);

        if (courseResponse.success) {
          setCourse(courseResponse.data);
          setActiveModule(courseResponse.data.modules?.[0] ?? null);
        }

        if (progressResponse.success) {
          setProgressEntry(progressResponse.data);
        }
      } catch (error) {
        console.error('Failed to load learning interface:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [api, courseId, getCourseProgress]);

  const completedModules = useMemo(
    () => enrollment?.completedModules || [],
    [enrollment?.completedModules]
  );

  const handleModuleSelect = (moduleData) => {
    setActiveModule(moduleData);
  };

  const handleModuleComplete = async () => {
    if (!activeModule) return;

    const isCompleted = completedModules.some(
      (moduleId) => moduleId.toString() === activeModule._id.toString()
    );

    const { success, data } = await updateProgress({
      courseId,
      moduleId: activeModule._id.toString(),
      completed: !isCompleted
    });

    if (success) {
      setProgressEntry((prev) => {
        const previousEntries = prev?.progressEntries ?? [];
        const updatedEntries = data?.progressEntry
          ? (() => {
              const moduleKey = activeModule._id.toString();
              const entryIndex = previousEntries.findIndex(
                (entry) => entry.module.toString() === moduleKey
              );

              if (entryIndex >= 0) {
                return previousEntries.map((entry, index) =>
                  index === entryIndex ? data.progressEntry : entry
                );
              }

              return [...previousEntries, data.progressEntry];
            })()
          : previousEntries;

        return {
          ...prev,
          enrollment: data?.enrollment ?? prev?.enrollment,
          progressEntries: updatedEntries
        };
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-2/5 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="h-72 animate-pulse rounded-3xl bg-slate-200 dark:bg-slate-800" />
          <div className="h-72 animate-pulse rounded-3xl bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="rounded-3xl border border-dashed border-purple-200 bg-purple-50/70 p-8 text-center text-sm text-purple-500 dark:border-purple-500/40 dark:bg-purple-500/10 dark:text-purple-200">
        Course content unavailable. Please return to the catalog and try again.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-wide text-purple-500 dark:text-purple-200">
          <span className="rounded-full bg-purple-100/80 px-3 py-1 dark:bg-purple-500/20">
            {course.category}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
            {course.level}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
            {course.duration} hours
          </span>
        </div>
        <h2 className="text-3xl font-semibold text-slate-900 dark:text-white">{course.title}</h2>
        <p className="max-w-3xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          {course.description}
        </p>
        <ProgressBar value={enrollment?.progress || 0} label="Overall progress" />
      </header>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-6">
          <VideoPlayer videoUrl={activeModule?.videoUrl} title={activeModule?.title} />
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {activeModule?.title || 'Module overview'}
                </h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {activeModule?.content || 'Select a module to view the lesson content.'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleModuleComplete}
                className="rounded-full bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-400 dark:focus:ring-offset-slate-900"
              >
                {completedModules.some(
                  (moduleId) => moduleId.toString() === activeModule?._id?.toString()
                )
                  ? 'Mark as incomplete'
                  : 'Mark as complete'}
              </button>
            </div>
            {activeModule?.resources?.length > 0 && (
              <div className="mt-6 space-y-2">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Resources
                </h4>
                <ul className="list-inside list-disc text-sm text-slate-500 dark:text-slate-400">
                  {activeModule.resources.map((resource, index) => (
                    <li key={resource || index}>{resource}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Course modules
            </h3>
            <div className="mt-4">
              <ModuleNavigation
                modules={course.modules}
                activeModuleId={activeModule?._id}
                completedModules={completedModules}
                onSelect={handleModuleSelect}
              />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Instructor
            </h3>
            <p className="mt-2 text-base font-semibold text-slate-900 dark:text-white">
              {course.instructor?.name || 'SkillsHub Instructor'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {course.instructor?.profile?.bio ||
                'Empowering Rwanda’s youth with hands-on learning pathways.'}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default LearningInterface;

