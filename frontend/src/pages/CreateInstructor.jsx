import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { FiUserPlus, FiMail, FiLock, FiMapPin, FiBookOpen } from 'react-icons/fi';
import { useAppContext } from '../context/AppContext';

const CreateInstructor = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const editId = id || searchParams.get('edit');
  const isEditMode = !!editId;

  const { createInstructor, updateInstructor, fetchInstructorById } = useAppContext();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    bio: '',
    skills: '',
    location: ''
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    const loadInstructor = async () => {
      if (!isEditMode || !editId) return;

      setFetching(true);
      const { success, data } = await fetchInstructorById(editId);
      if (success && data) {
        setFormData({
          name: data.name || '',
          email: data.email || '',
          password: '',
          bio: data.profile?.bio || '',
          skills: data.profile?.skills?.join(', ') || '',
          location: data.profile?.location || ''
        });
      }
      setFetching(false);
    };

    loadInstructor();
  }, [isEditMode, editId, fetchInstructorById]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const skillsArray = formData.skills
      .split(',')
      .map((skill) => skill.trim())
      .filter((skill) => skill.length > 0);

    if (isEditMode) {
      const updateData = {
        name: formData.name,
        email: formData.email,
        bio: formData.bio,
        skills: skillsArray,
        location: formData.location
      };
      
      if (formData.password) {
        updateData.password = formData.password;
      }

      const { success } = await updateInstructor(editId, updateData);
      setLoading(false);

      if (success) {
        navigate(`/instructors/${editId}`);
      }
    } else {
      const { success } = await createInstructor({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        bio: formData.bio,
        skills: skillsArray,
        location: formData.location
      });

      setLoading(false);

      if (success) {
        setFormData({
          name: '',
          email: '',
          password: '',
          bio: '',
          skills: '',
          location: ''
        });
        navigate('/instructors');
      }
    }
  };

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
          {isEditMode ? 'Edit Instructor' : 'Create New Instructor'}
        </h2>
        <p className="max-w-2xl text-sm text-slate-500 dark:text-slate-400">
          {isEditMode
            ? 'Update instructor information on the SkillsHub Rwanda platform.'
            : 'Add a new instructor to the SkillsHub Rwanda platform. They will be able to create and manage courses.'}
        </p>
      </header>

      {fetching ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-16 w-16 animate-spin rounded-full border-t-2 border-b-2 border-purple-500" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg dark:border-slate-800 dark:bg-slate-900">
        <div className="space-y-6">
          <div>
            <label htmlFor="name" className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
              <FiUserPlus className="text-lg" />
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
              <FiMail className="text-lg" />
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
              placeholder="instructor@skillshub.rw"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
              <FiLock className="text-lg" />
              Password {isEditMode ? '(leave blank to keep current)' : '*'}
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required={!isEditMode}
              minLength={8}
              value={formData.password}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
              placeholder={isEditMode ? 'Enter new password (optional)' : 'Minimum 8 characters'}
            />
          </div>

          <div>
            <label htmlFor="bio" className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
              <FiBookOpen className="text-lg" />
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              rows={4}
              value={formData.bio}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
              placeholder="Brief description of the instructor's background and expertise..."
            />
          </div>

          <div>
            <label htmlFor="skills" className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
              <FiBookOpen className="text-lg" />
              Skills (comma-separated)
            </label>
            <input
              type="text"
              id="skills"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
              placeholder="Web Development, JavaScript, React"
            />
          </div>

          <div>
            <label htmlFor="location" className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
              <FiMapPin className="text-lg" />
              Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
              placeholder="Kigali, Rwanda"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? isEditMode
                  ? 'Updating...'
                  : 'Creating...'
                : isEditMode
                ? 'Update Instructor'
                : 'Create Instructor'}
            </button>
            <button
              type="button"
              onClick={() => navigate(isEditMode && editId ? `/instructors/${editId}` : '/instructors')}
              className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
      )}
    </div>
  );
};

export default CreateInstructor;

