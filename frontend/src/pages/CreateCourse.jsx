import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { FiBook, FiList, FiTag, FiClock, FiImage, FiDollarSign, FiUpload, FiVideo, FiX } from 'react-icons/fi';
import { useAppContext } from '../context/AppContext';
import { toast } from 'react-toastify';

const CreateCourse = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const editId = id || searchParams.get('edit');
  const isEditMode = !!editId;
  
  const { createCourse, updateCourse, fetchCourseById, uploadFile } = useAppContext();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'technology',
    level: 'beginner',
    duration: 0,
    price: 0,
    imageUrl: '',
    isPublished: false
  });
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideos, setUploadingVideos] = useState({});

  useEffect(() => {
    if (isEditMode && editId) {
      const loadCourse = async () => {
        setFetching(true);
        const { success, data } = await fetchCourseById(editId);
        setFetching(false);
        
        if (success && data) {
          setFormData({
            title: data.title || '',
            description: data.description || '',
            category: data.category || 'technology',
            level: data.level || 'beginner',
            duration: data.duration || 0,
            price: data.price || 0,
            imageUrl: data.imageUrl || '',
            isPublished: data.isPublished || false
          });
          setModules(data.modules || []);
        } else {
          toast.error('Failed to load course for editing');
          navigate('/my-courses');
        }
      };
      loadCourse();
    }
  }, [isEditMode, editId, fetchCourseById, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value
    }));
  };

  const handleAddModule = () => {
    setModules((prev) => [
      ...prev,
      {
        title: '',
        content: '',
        videoUrl: '',
        duration: 0,
        resources: [],
        exercises: [],
        activities: [],
        quiz: []
      }
    ]);
  };

  const handleModuleChange = (index, field, value) => {
    setModules((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleRemoveModule = (index) => {
    setModules((prev) => prev.filter((_, i) => i !== index));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setUploadingImage(true);
    const { success, data } = await uploadFile(file, 'image', 'skillshub/images');
    setUploadingImage(false);

    if (success && data?.url) {
      setFormData((prev) => ({ ...prev, imageUrl: data.url }));
    }
  };

  const handleModuleVideoUpload = async (e, moduleIndex) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      alert('Please select a video file');
      return;
    }

    setUploadingVideos((prev) => ({ ...prev, [moduleIndex]: true }));
    const { success, data } = await uploadFile(file, 'video', 'skillshub/videos');
    setUploadingVideos((prev) => ({ ...prev, [moduleIndex]: false }));

    if (success && data?.url) {
      handleModuleChange(moduleIndex, 'videoUrl', data.url);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const courseData = {
      ...formData,
      modules: modules.filter((module) => module.title.trim().length > 0)
    };

    let result;
    if (isEditMode) {
      result = await updateCourse(editId, courseData);
    } else {
      result = await createCourse(courseData);
    }

    setLoading(false);

    if (result.success) {
      navigate('/my-courses');
    }
  };

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
          {isEditMode ? 'Edit Course' : 'Create New Course'}
        </h2>
        <p className="max-w-2xl text-sm text-slate-500 dark:text-slate-400">
          {isEditMode
            ? 'Update your course details, modules, and content. Changes will be saved immediately.'
            : 'Design a new learning experience for students. Add modules, content, and resources to build a comprehensive course.'}
        </p>
      </header>

      {fetching && (
        <div className="flex items-center justify-center rounded-3xl border border-slate-200 bg-white p-12 dark:border-slate-800 dark:bg-slate-900">
          <div className="h-16 w-16 animate-spin rounded-full border-t-2 border-b-2 border-purple-500" />
        </div>
      )}

      {!fetching && (
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-6 text-lg font-semibold text-slate-900 dark:text-white">Course Information</h3>
          <div className="space-y-6">
            <div>
              <label htmlFor="title" className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                <FiBook className="text-lg" />
                Course Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
                placeholder="Introduction to Web Development"
              />
            </div>

            <div>
              <label htmlFor="description" className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                <FiBook className="text-lg" />
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={6}
                value={formData.description}
                onChange={handleChange}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
                placeholder="A comprehensive course covering..."
              />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="category" className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  <FiTag className="text-lg" />
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="technology">Technology</option>
                  <option value="business">Business</option>
                  <option value="hospitality">Hospitality</option>
                  <option value="education">Education</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="agriculture">Agriculture</option>
                  <option value="finance">Finance</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="level" className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  <FiTag className="text-lg" />
                  Level *
                </label>
                <select
                  id="level"
                  name="level"
                  required
                  value={formData.level}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="duration" className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  <FiClock className="text-lg" />
                  Duration (hours) *
                </label>
                <input
                  type="number"
                  id="duration"
                  name="duration"
                  required
                  min={1}
                  value={formData.duration}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
                  placeholder="10"
                />
              </div>

              <div>
                <label htmlFor="price" className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  <FiDollarSign className="text-lg" />
                  Price (RWF)
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  min={0}
                  value={formData.price}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label htmlFor="imageUrl" className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                <FiImage className="text-lg" />
                Course Thumbnail
              </label>
              {formData.imageUrl ? (
                <div className="mt-2 space-y-2">
                  <div className="relative inline-block">
                    <img
                      src={formData.imageUrl}
                      alt="Course thumbnail"
                      className="h-32 w-full rounded-xl object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, imageUrl: '' }))}
                      className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white transition hover:bg-red-600"
                    >
                      <FiX className="text-sm" />
                    </button>
                  </div>
                </div>
              ) : (
                <label className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-8 transition hover:border-purple-500 hover:bg-purple-50/50 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-purple-500">
                  <FiUpload className="mb-2 text-2xl text-slate-400" />
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    {uploadingImage ? 'Uploading...' : 'Click to upload thumbnail image'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploadingImage}
                  />
                </label>
              )}
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isPublished"
                name="isPublished"
                checked={formData.isPublished}
                onChange={handleChange}
                className="h-5 w-5 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
              />
              <label htmlFor="isPublished" className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Publish this course immediately
              </label>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
              <FiList className="text-lg" />
              Course Modules
            </h3>
            <button
              type="button"
              onClick={handleAddModule}
              className="rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-500"
            >
              Add Module
            </button>
          </div>

          {modules.length === 0 ? (
            <p className="text-center text-sm text-slate-500 dark:text-slate-400">
              No modules added yet. Click "Add Module" to get started.
            </p>
          ) : (
            <div className="space-y-6">
              {modules.map((module, index) => (
                <div key={index} className="rounded-xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-800">
                  <div className="mb-4 flex items-center justify-between">
                    <h4 className="font-semibold text-slate-900 dark:text-white">Module {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => handleRemoveModule(index)}
                      className="text-sm text-red-600 hover:text-red-700 dark:text-red-400"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Module Title"
                      value={module.title}
                      onChange={(e) => handleModuleChange(index, 'title', e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 placeholder-slate-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                    <textarea
                      placeholder="Module Content"
                      rows={4}
                      value={module.content}
                      onChange={(e) => handleModuleChange(index, 'content', e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 placeholder-slate-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                    <div>
                      {module.videoUrl ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between rounded-lg border border-slate-300 bg-white px-4 py-2 dark:border-slate-700 dark:bg-slate-900">
                            <div className="flex items-center gap-2">
                              <FiVideo className="text-purple-600" />
                              <span className="truncate text-sm text-slate-700 dark:text-slate-300">
                                Video uploaded
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleModuleChange(index, 'videoUrl', '')}
                              className="text-red-600 hover:text-red-700"
                            >
                              <FiX />
                            </button>
                          </div>
                          <video
                            src={module.videoUrl}
                            controls
                            className="w-full rounded-lg"
                            style={{ maxHeight: '200px' }}
                          />
                        </div>
                      ) : (
                        <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-white px-4 py-6 transition hover:border-purple-500 hover:bg-purple-50/50 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-purple-500">
                          <FiVideo className="mb-2 text-xl text-slate-400" />
                          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            {uploadingVideos[index] ? 'Uploading video...' : 'Click to upload video (optional)'}
                          </span>
                          <input
                            type="file"
                            accept="video/*"
                            onChange={(e) => handleModuleVideoUpload(e, index)}
                            className="hidden"
                            disabled={uploadingVideos[index]}
                          />
                        </label>
                      )}
                    </div>
                    <input
                      type="number"
                      placeholder="Duration (minutes)"
                      min={0}
                      value={module.duration}
                      onChange={(e) => handleModuleChange(index, 'duration', Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 placeholder-slate-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Course' : 'Create Course')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/my-courses')}
            className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Cancel
          </button>
        </div>
      </form>
      )}
    </div>
  );
};

export default CreateCourse;

