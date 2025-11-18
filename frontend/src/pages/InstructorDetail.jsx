import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiUser,
  FiMail,
  FiMapPin,
  FiBookOpen,
  FiCalendar,
  FiEdit2,
  FiBook
} from 'react-icons/fi';
import { useAppContext } from '../context/AppContext';
import { toast } from 'react-toastify';

const InstructorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { api, fetchInstructorById, fetchCourses } = useAppContext();
  const [instructor, setInstructor] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { success, data } = await fetchInstructorById(id);
        if (success) {
          setInstructor(data);
        } else {
          toast.error('Instructor not found');
          navigate('/instructors');
        }
      } catch (error) {
        console.error('Failed to fetch instructor:', error);
        toast.error('Failed to load instructor details');
        navigate('/instructors');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id, fetchInstructorById, navigate]);

  useEffect(() => {
    const fetchInstructorCourses = async () => {
      if (!instructor?._id) return;
      
      setLoadingCourses(true);
      try {
        const { data } = await api.get(`/courses?instructor=${instructor._id}`);
        if (data.success) {
          setCourses(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      } finally {
        setLoadingCourses(false);
      }
    };

    if (instructor) {
      fetchInstructorCourses();
    }
  }, [instructor, api]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-16 w-16 animate-spin rounded-full border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

  if (!instructor) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 text-xl font-semibold text-slate-900 dark:text-white">Instructor not found</h2>
        <button
          onClick={() => navigate('/instructors')}
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
        onClick={() => navigate('/instructors')}
        className="flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-200"
      >
        <FiArrowLeft />
        Back to Instructors
      </button>

      <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
        {/* Main Content */}
        <div className="space-y-8">
          {/* Instructor Header */}
          <div className="rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start gap-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-purple-100 text-3xl font-semibold text-purple-600 dark:bg-purple-500/20 dark:text-purple-400">
                <FiUser />
              </div>
              <div className="flex-1">
                <h1 className="mb-2 text-3xl font-bold text-slate-900 dark:text-white">
                  {instructor.name}
                </h1>
                <div className="flex items-center gap-4 text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <FiMail className="text-sm" />
                    {instructor.email}
                  </div>
                  {instructor.profile?.location && (
                    <div className="flex items-center gap-2">
                      <FiMapPin className="text-sm" />
                      {instructor.profile.location}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => navigate(`/instructors/${id}/edit`)}
                className="flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white transition hover:bg-purple-500"
              >
                <FiEdit2 />
                Edit Instructor
              </button>
            </div>
          </div>

          {/* Bio */}
          {instructor.profile?.bio && (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="mb-4 text-xl font-semibold text-slate-900 dark:text-white">About</h2>
              <p className="text-slate-600 dark:text-slate-400">{instructor.profile.bio}</p>
            </div>
          )}

          {/* Skills */}
          {instructor.profile?.skills && instructor.profile.skills.length > 0 && (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="mb-4 text-xl font-semibold text-slate-900 dark:text-white">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {instructor.profile.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="rounded-full bg-purple-100 px-4 py-2 text-sm font-medium text-purple-700 dark:bg-purple-500/20 dark:text-purple-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Courses */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 text-xl font-semibold text-slate-900 dark:text-white">
              Courses ({courses.length})
            </h2>
            {loadingCourses ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-purple-500" />
              </div>
            ) : courses.length === 0 ? (
              <p className="rounded-xl border border-dashed border-purple-200 bg-purple-50/50 p-6 text-center text-sm text-purple-600 dark:border-purple-500/40 dark:bg-purple-500/10 dark:text-purple-200">
                No courses created yet
              </p>
            ) : (
              <div className="space-y-3">
                {courses.map((course) => (
                  <div
                    key={course._id}
                    onClick={() => navigate(`/courses/${course._id}`)}
                    className="cursor-pointer rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-purple-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:hover:border-purple-500"
                  >
                    <h3 className="mb-2 font-semibold text-slate-900 dark:text-white">{course.title}</h3>
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
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Instructor Info</h3>
            <div className="space-y-4">
              <div>
                <span className="text-sm text-slate-500 dark:text-slate-400">Email</span>
                <p className="mt-1 font-medium text-slate-900 dark:text-white">{instructor.email}</p>
              </div>
              {instructor.profile?.location && (
                <div>
                  <span className="text-sm text-slate-500 dark:text-slate-400">Location</span>
                  <p className="mt-1 font-medium text-slate-900 dark:text-white">
                    {instructor.profile.location}
                  </p>
                </div>
              )}
              <div>
                <span className="text-sm text-slate-500 dark:text-slate-400">Joined</span>
                <p className="mt-1 font-medium text-slate-900 dark:text-white">
                  {new Date(instructor.createdAt).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <span className="text-sm text-slate-500 dark:text-slate-400">Total Courses</span>
                <p className="mt-1 text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {courses.length}
                </p>
              </div>
              <div>
                <span className="text-sm text-slate-500 dark:text-slate-400">Published Courses</span>
                <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {courses.filter((c) => c.isPublished).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorDetail;

