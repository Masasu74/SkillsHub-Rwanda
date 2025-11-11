import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import ModuleNavigation from '../components/ModuleNavigation';
import ProgressBar from '../components/ProgressBar';
import VideoPlayer from '../components/VideoPlayer';
import { useAppContext } from '../context/AppContext';
import jsPDF from 'jspdf';

const CERT_SIGNATURE = 'https://res.cloudinary.com/ddlrwdiu9/image/upload/v1731317465/signature-placeholder.png';

const loadImageData = async (url) => {
  if (!url) return null;
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn('Failed to load image for certificate:', error);
    return null;
  }
};

const LearningInterface = () => {
  const { courseId } = useParams();
  const {
    api,
    enrollments,
    getCourseProgress,
    updateProgress,
    completePracticeItem,
    submitQuizAttempt
  } = useAppContext();
  const [course, setCourse] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const [activeModule, setActiveModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [practiceSubmitting, setPracticeSubmitting] = useState(false);
  const [quizSubmitting, setQuizSubmitting] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});

  const enrollment = useMemo(
    () =>
      enrollments.find(
        (item) =>
          item.course === courseId || item.course?._id?.toString() === courseId?.toString()
      ),
    [enrollments, courseId]
  );

  const activeEnrollment = useMemo(() => {
    if (progressData?.enrollment) {
      return progressData.enrollment;
    }
    return enrollment;
  }, [progressData?.enrollment, enrollment]);

  useEffect(() => {
    const loadCourse = async () => {
      try {
        const progressResponse = await getCourseProgress(courseId);

        if (progressResponse.success) {
          const { course: coursePayload, enrollment: enrollmentPayload, progressEntries } =
            progressResponse.data;

          if (coursePayload) {
            setCourse(coursePayload);
            setActiveModule(
              (prev) => prev || (coursePayload.modules?.[0] ?? null)
            );
          } else {
            const { data: courseResponse } = await api.get(`/courses/${courseId}`);
          if (courseResponse.success) {
            setCourse(courseResponse.data);
            setActiveModule(
              (prev) => prev || (courseResponse.data.modules?.[0] ?? null)
            );
            }
          }

          setProgressData({
            enrollment: enrollmentPayload,
            progressEntries: progressEntries || []
          });
        } else {
          const { data: courseResponse } = await api.get(`/courses/${courseId}`);
        if (courseResponse.success) {
          setCourse(courseResponse.data);
          setActiveModule(courseResponse.data.modules?.[0] ?? null);
        }
        }
      } catch (error) {
        console.error('Failed to load learning interface:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [api, courseId, getCourseProgress]);

  const progressEntries = useMemo(
    () => progressData?.progressEntries || [],
    [progressData?.progressEntries]
  );

  const completedModules = useMemo(() => {
    if (activeEnrollment?.completedModules) {
      return activeEnrollment.completedModules;
    }
    return [];
  }, [activeEnrollment?.completedModules]);

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
      setProgressData((prev) => {
        const previousEntries = prev?.progressEntries ?? [];
        let updatedEntries = previousEntries;

        if (data?.progressEntry) {
          const moduleKey = activeModule._id.toString();
          const entryIndex = previousEntries.findIndex(
            (entry) => entry.module.toString() === moduleKey
          );

          if (entryIndex >= 0) {
            updatedEntries = previousEntries.map((entry, index) =>
              index === entryIndex ? data.progressEntry : entry
            );
          } else {
            updatedEntries = [...previousEntries, data.progressEntry];
          }
        }

        return {
          ...prev,
          enrollment: data?.enrollment ?? prev?.enrollment,
          progressEntries: updatedEntries
        };
      });
      toast.success(
        !isCompleted
          ? 'Module marked as completed. Keep going!'
          : 'Module marked as in progress.'
      );
    }
  };

  const isPracticeCompleted = (type, moduleId, itemIndex) => {
    if (!activeEnrollment) return false;
    const collection =
      type === 'exercise'
        ? activeEnrollment.completedExercises || []
        : activeEnrollment.completedActivities || [];

    const key = type === 'exercise' ? 'exerciseIndex' : 'activityIndex';

    return collection.some(
      (entry) =>
        entry.moduleId?.toString() === moduleId.toString() && entry[key] === Number(itemIndex)
    );
  };

  const handlePracticeComplete = async (type, itemIndex) => {
    if (!activeModule) return;

    const moduleId = activeModule._id.toString();
    const completed = isPracticeCompleted(type, moduleId, itemIndex);

    setPracticeSubmitting(true);
    const response = await completePracticeItem({
      courseId,
      moduleId,
      itemIndex,
      itemType: type,
      completed: !completed
    });
    setPracticeSubmitting(false);

    if (response.success) {
      setProgressData((prev) => ({
        ...prev,
        enrollment: response.data.enrollment ?? prev?.enrollment
      }));

      toast.success(
        !completed
          ? `Great! ${type === 'exercise' ? 'Exercise' : 'Activity'} marked as complete.`
          : `${type === 'exercise' ? 'Exercise' : 'Activity'} marked as incomplete.`
      );
    }
  };

  const handleQuizOptionChange = (questionIndex, optionIndex) => {
    if (!activeModule) return;
    setQuizAnswers((prev) => {
      const moduleKey = activeModule._id.toString();
      const existing = prev[moduleKey] ? [...prev[moduleKey]] : Array(activeModule.quiz.length);
      existing[questionIndex] = optionIndex;
      return {
        ...prev,
        [moduleKey]: existing
      };
    });
  };

  const handleQuizSubmit = async () => {
    if (!activeModule || !activeModule.quiz?.length) return;

    const moduleKey = activeModule._id.toString();
    const answers = quizAnswers[moduleKey] || [];

    if (answers.length !== activeModule.quiz.length || answers.some((value) => value === undefined)) {
      toast.error('Please answer all quiz questions before submitting.');
      return;
    }

    setQuizSubmitting(true);
    const response = await submitQuizAttempt({
      courseId,
      moduleId: moduleKey,
      answers
    });
    setQuizSubmitting(false);

    if (response.success) {
      setProgressData((prev) => ({
        ...prev,
        enrollment: response.data.enrollment ?? prev?.enrollment
      }));

      const passed = response.data.quizResult?.passed;
      toast[passed ? 'success' : 'info'](
        passed
          ? 'Great job! You passed the quiz.'
          : 'Quiz recorded. Review the material and try again for a pass.'
      );
    }
  };

  const moduleQuizResult = useMemo(() => {
    if (!activeModule || !activeEnrollment?.quizResults) return null;
    return activeEnrollment.quizResults.find(
      (result) => result.moduleId?.toString() === activeModule._id.toString()
    );
  }, [activeEnrollment?.quizResults, activeModule]);

  const certificateIssued = Boolean(activeEnrollment?.certificateIssuedAt);
  const certificateIssuedDate = certificateIssued
    ? new Date(activeEnrollment.certificateIssuedAt)
    : null;

  const handleCertificateDownload = async () => {
    if (!certificateIssued || !course) return;
    const issuedAt = certificateIssuedDate?.toLocaleDateString();
    const doc = new jsPDF('landscape', 'pt', 'a4');
    const width = doc.internal.pageSize.getWidth();
    const height = doc.internal.pageSize.getHeight();

    doc.setFillColor(241, 245, 249);
    doc.rect(0, 0, width, height, 'F');

    doc.setDrawColor(124, 58, 237);
    doc.setLineWidth(6);
    doc.roundedRect(40, 40, width - 80, height - 80, 20, 20);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.setTextColor(124, 58, 237);
    doc.text('Certificate of Completion', width / 2, 120, { align: 'center' });

    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text('This certifies that', width / 2, 170, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.text(
      (activeEnrollment?.student?.name || 'A SkillsHub Learner').toUpperCase(),
      width / 2,
      210,
      { align: 'center' }
    );

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(14);
    doc.text('has successfully completed the course', width / 2, 250, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text(`"${course.title}"`, width / 2, 290, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.text(
      'delivered by SkillsHub Rwanda',
      width / 2,
      320,
      { align: 'center' }
    );

    doc.setFontSize(11);
    doc.text(
      `Issued on ${issuedAt || 'Recently'} | Certificate ID: ${activeEnrollment.certificateId}`,
      width / 2,
      360,
      { align: 'center' }
    );

    const signatureImage = await loadImageData(CERT_SIGNATURE);
    const signatureWidth = 160;
    const signatureHeight = 60;
    const signatureX = width / 2 - signatureWidth / 2;
    const signatureY = 420;

    if (signatureImage) {
      doc.addImage(signatureImage, 'PNG', signatureX, signatureY, signatureWidth, signatureHeight);
    } else {
      doc.setFont('helvetica', 'italic');
      doc.text('Signature', width / 2, signatureY + 30, { align: 'center' });
    }

    doc.setDrawColor(168, 85, 247);
    doc.line(signatureX, signatureY + signatureHeight + 10, signatureX + signatureWidth, signatureY + signatureHeight + 10);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.text('Programme Lead', width / 2, signatureY + signatureHeight + 30, { align: 'center' });

    doc.save(
      `${(activeEnrollment?.student?.name || 'skillsHub_learner')
        .toLowerCase()
        .replace(/\s+/g, '_')}_certificate.pdf`
    );
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
        <ProgressBar value={activeEnrollment?.progress || 0} label="Overall progress" />
        {certificateIssued && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
            🎉 Certificate unlocked on {certificateIssuedDate?.toLocaleDateString()} — Certificate ID:{' '}
            <span className="font-semibold">{activeEnrollment.certificateId}</span>
          </div>
        )}
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
            {activeModule?.exercises?.length > 0 && (
              <div className="mt-6 space-y-3">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Practice Exercises
                </h4>
                <ul className="space-y-3">
                  {activeModule.exercises.map((exercise, index) => {
                    const completed = isPracticeCompleted(
                      'exercise',
                      activeModule._id,
                      index
                    );
                    return (
                      <li
                        key={`exercise-${activeModule._id}-${index}`}
                        className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <span>{exercise}</span>
                          <button
                            type="button"
                            onClick={() => handlePracticeComplete('exercise', index)}
                            disabled={practiceSubmitting}
                            className="rounded-full bg-purple-600 px-3 py-1 text-xs font-semibold text-white shadow hover:bg-purple-500 disabled:opacity-60"
                          >
                            {completed ? 'Undo' : 'Mark complete'}
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {activeModule?.activities?.length > 0 && (
              <div className="mt-6 space-y-3">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Guided Activities
                </h4>
                <ul className="space-y-3">
                  {activeModule.activities.map((activity, index) => {
                    const completed = isPracticeCompleted(
                      'activity',
                      activeModule._id,
                      index
                    );
                    return (
                      <li
                        key={`activity-${activeModule._id}-${index}`}
                        className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <span>{activity}</span>
                          <button
                            type="button"
                            onClick={() => handlePracticeComplete('activity', index)}
                            disabled={practiceSubmitting}
                            className="rounded-full bg-purple-600 px-3 py-1 text-xs font-semibold text-white shadow hover:bg-purple-500 disabled:opacity-60"
                          >
                            {completed ? 'Undo' : 'Mark complete'}
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {activeModule?.quiz?.length > 0 && (
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Knowledge Check
                  </h4>
                  {moduleQuizResult && (
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        moduleQuizResult.passed
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200'
                      }`}
                    >
                      Last score: {moduleQuizResult.score}/{moduleQuizResult.total}{' '}
                      {moduleQuizResult.passed ? '(Passed)' : '(Needs review)'}
                    </span>
                  )}
                </div>
                {activeModule.quiz.map((question, questionIndex) => {
                  const selectedAnswer =
                    quizAnswers[activeModule._id?.toString()]?.[questionIndex];
                  return (
                    <div
                      key={`quiz-${activeModule._id}-${questionIndex}`}
                      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800/60"
                    >
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                        {questionIndex + 1}. {question.question}
                      </p>
                      <div className="mt-3 space-y-2">
                        {question.options.map((option, optionIndex) => (
                          <label
                            key={`option-${optionIndex}`}
                            className="flex cursor-pointer items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:border-purple-400 dark:border-slate-700 dark:text-slate-300 dark:hover:border-purple-400"
                          >
                            <input
                              type="radio"
                              name={`quiz-${activeModule._id}-${questionIndex}`}
                              value={optionIndex}
                              checked={selectedAnswer === optionIndex}
                              onChange={() => handleQuizOptionChange(questionIndex, optionIndex)}
                              className="text-purple-600 focus:ring-purple-500"
                            />
                            <span>{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
                <button
                  type="button"
                  onClick={handleQuizSubmit}
                  disabled={quizSubmitting}
                  className="rounded-full bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-purple-500 disabled:opacity-60"
                >
                  {moduleQuizResult?.passed ? 'Retake quiz' : 'Submit quiz'}
                </button>
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

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Certificate
            </h3>
            {certificateIssued ? (
              <div className="mt-3 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                <p>
                  Certificate unlocked on{' '}
                  <span className="font-semibold">
                    {certificateIssuedDate?.toLocaleDateString()}
                  </span>
                </p>
                <p className="break-words text-xs text-slate-400 dark:text-slate-500">
                  ID: {activeEnrollment?.certificateId}
                </p>
                <button
                  type="button"
                  onClick={handleCertificateDownload}
                  className="w-full rounded-full bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-purple-500"
                >
                  Download certificate
                </button>
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                Complete every module, exercise, activity, and pass the quizzes to unlock your
                SkillsHub Rwanda certificate.
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default LearningInterface;

