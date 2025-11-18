import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiMapPin, FiBookOpen, FiPlus, FiUsers, FiCalendar, FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAppContext } from '../context/AppContext';

const ManageInstructors = () => {
  const navigate = useNavigate();
  const { fetchInstructors, deleteInstructor: deleteInstructorApi } = useAppContext();
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState({});

  useEffect(() => {
    const loadInstructors = async () => {
      setLoading(true);
      const { success, data } = await fetchInstructors();
      if (success) {
        setInstructors(data);
      }
      setLoading(false);
    };
    loadInstructors();
  }, [fetchInstructors]);

  const handleDeleteInstructor = async (instructorId, instructorName) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${instructorName}"? This action cannot be undone and will also delete all courses and enrollments associated with this instructor.`
      )
    ) {
      return;
    }

    setDeleting((prev) => ({ ...prev, [instructorId]: true }));
    const { success } = await deleteInstructorApi(instructorId);
    setDeleting((prev) => ({ ...prev, [instructorId]: false }));

    if (success) {
      setInstructors((prev) => prev.filter((instructor) => (instructor._id || instructor.id) !== instructorId));
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <header className="space-y-2">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
            Manage Instructors
          </h2>
          <p className="max-w-2xl text-sm text-slate-500 dark:text-slate-400">
            View and manage all instructors on the SkillsHub Rwanda platform. Add new instructors and view their profiles.
          </p>
        </header>
        <button
          onClick={() => navigate('/create-instructor')}
          className="flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-purple-500"
        >
          <FiPlus className="text-lg" />
          Add Instructor
        </button>
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-64 animate-pulse rounded-3xl border border-slate-200 bg-slate-100/60 dark:border-slate-800 dark:bg-slate-900/60"
            />
          ))}
        </div>
      ) : instructors.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-purple-200 bg-purple-50/50 p-12 text-center dark:border-purple-500/40 dark:bg-purple-500/10">
          <FiUsers className="mx-auto mb-4 text-4xl text-purple-500 dark:text-purple-400" />
          <h3 className="mb-2 text-lg font-semibold text-purple-700 dark:text-purple-200">
            No instructors yet
          </h3>
          <p className="mb-6 text-sm text-purple-600 dark:text-purple-300">
            Get started by creating your first instructor account.
          </p>
          <button
            onClick={() => navigate('/create-instructor')}
            className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-purple-500"
          >
            <FiPlus className="text-lg" />
            Add First Instructor
          </button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {instructors.map((instructor) => (
            <div
              key={instructor._id || instructor.id}
              className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg transition hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="p-6">
                <div className="mb-4 flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-purple-100 text-xl font-semibold text-purple-600 dark:bg-purple-500/20 dark:text-purple-400">
                    <FiUser />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      {instructor.name}
                    </h3>
                    <div className="mt-1 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <FiMail className="text-xs" />
                      {instructor.email}
                    </div>
                  </div>
                </div>

                {instructor.profile?.bio && (
                  <p className="mb-4 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
                    {instructor.profile.bio}
                  </p>
                )}

                <div className="space-y-2">
                  {instructor.profile?.location && (
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <FiMapPin className="text-xs" />
                      {instructor.profile.location}
                    </div>
                  )}

                  {instructor.profile?.skills && instructor.profile.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {instructor.profile.skills.slice(0, 3).map((skill, index) => (
                        <span
                          key={index}
                          className="rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700 dark:bg-purple-500/20 dark:text-purple-200"
                        >
                          {skill}
                        </span>
                      ))}
                      {instructor.profile.skills.length > 3 && (
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                          +{instructor.profile.skills.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <FiCalendar className="text-xs" />
                    Joined {new Date(instructor.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200">
                    <FiBookOpen className="mr-1" />
                    Instructor
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/instructors/${instructor._id || instructor.id}`)}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                      title="View Details"
                    >
                      <FiEye className="text-base" />
                    </button>
                    <button
                      onClick={() => navigate(`/instructors/${instructor._id || instructor.id}/edit`)}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                      title="Edit Instructor"
                    >
                      <FiEdit2 className="text-base" />
                    </button>
                    <button
                      onClick={() => handleDeleteInstructor(instructor._id || instructor.id, instructor.name)}
                      disabled={deleting[instructor._id || instructor.id]}
                      className="rounded-lg border border-red-300 bg-white px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-700 dark:bg-slate-800 dark:text-red-400 dark:hover:bg-red-500/20"
                      title="Delete Instructor"
                    >
                      {deleting[instructor._id || instructor.id] ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                      ) : (
                        <FiTrash2 className="text-base" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageInstructors;

