import axios from 'axios';
import PropTypes from 'prop-types';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import { toast } from 'react-toastify';

const AppContext = createContext();

const resolveApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (import.meta.env.MODE === 'development') return 'http://localhost:4000/api';
  return '/api';
};

const createApiClient = () => {
  const instance = axios.create({
    baseURL: resolveApiBaseUrl(),
    headers: {
      'Content-Type': 'application/json'
    },
    timeout: 20000
  });

  instance.interceptors.request.use(
      (config) => {
      const token = localStorage.getItem('token');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        return config;
      },
      (error) => Promise.reject(error)
    );

  instance.interceptors.response.use(
    (response) => response,
      (error) => {
        const status = error.response?.status;

        if (status === 401) {
        localStorage.removeItem('token');
        }
        
        return Promise.reject(error);
      }
    );

  return instance;
};

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(false);
  const [error, setError] = useState(null);

  const api = useMemo(() => createApiClient(), []);

  const mergeEnrollment = useCallback(
    (updatedEnrollment) => {
      if (!updatedEnrollment) return;

      const updatedCourseId =
        typeof updatedEnrollment.course === 'string'
          ? updatedEnrollment.course
          : updatedEnrollment.course?._id?.toString();

      setEnrollments((prev) => {
        let found = false;

        const next = prev.map((enrollment) => {
          const enrollmentCourseId =
            typeof enrollment.course === 'string'
              ? enrollment.course
              : enrollment.course?._id?.toString();

          if (enrollmentCourseId === updatedCourseId) {
            found = true;
            return updatedEnrollment;
          }

          return enrollment;
        });

        return found ? next : [...prev, updatedEnrollment];
      });
    },
    [setEnrollments]
  );

  const handleAuthSuccess = useCallback((data) => {
    if (!data?.token || !data?.user) {
      throw new Error('Invalid authentication response');
    }

    localStorage.setItem('token', data.token);
    setUser(data.user);
    toast.success(`Welcome back, ${data.user.name.split(' ')[0]}!`);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
    setEnrollments([]);
    toast.info('You have been logged out.');
  }, []);

  const fetchProfile = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me');
      if (data.success) {
      setUser(data.user);
      }
    } catch (profileError) {
      logout();
      throw profileError;
    }
  }, [api, logout]);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
        setLoading(false);
      return;
    }

    fetchProfile()
      .catch(() => {
        // Swallow errors, already handled in fetchProfile
      })
      .finally(() => setLoading(false));
  }, [fetchProfile]);

  const login = useCallback(
    async ({ email, password }) => {
      try {
        const { data } = await api.post('/auth/login', { email, password });
        handleAuthSuccess(data);
      return { success: true };
      } catch (authError) {
        const message = authError.response?.data?.message || 'Failed to log in';
        toast.error(message);
        return { success: false, message };
      }
    },
    [api, handleAuthSuccess]
  );

  const register = useCallback(
    async ({ name, email, password, bio, skills, location }) => {
      try {
        const { data } = await api.post('/auth/register', {
          name,
          email,
          password,
          bio,
          skills,
          location
        });
        handleAuthSuccess(data);
        return { success: true };
      } catch (registrationError) {
        const message = registrationError.response?.data?.message || 'Registration failed';
        toast.error(message);
        return { success: false, message };
      }
    },
    [api, handleAuthSuccess]
  );

  const fetchCourses = useCallback(
    async (filters = {}) => {
      setCoursesLoading(true);
      try {
        const { data } = await api.get('/courses', { params: filters });
        if (data.success) {
          setCourses(data.data);
        } else {
          setCourses([]);
        }
      } catch (fetchError) {
        setError(fetchError.message);
        setCourses([]);
      } finally {
        setCoursesLoading(false);
      }
    },
    [api]
  );

  const fetchEnrollments = useCallback(async () => {
    if (!user) return;

    setEnrollmentsLoading(true);
    try {
      const { data } = await api.get('/enrollments/my-courses');
      if (data.success) {
        setEnrollments(data.data);
      } else {
        setEnrollments([]);
      }
    } catch (fetchError) {
      setError(fetchError.message);
      setEnrollments([]);
    } finally {
      setEnrollmentsLoading(false);
    }
  }, [api, user]);

  const enrollInCourse = useCallback(
    async (courseId) => {
      try {
        const { data } = await api.post('/enrollments', { courseId });
        if (data.success) {
          setEnrollments((prev) => {
            const alreadyExists = prev.some(
              (enrollment) => enrollment.course._id === courseId || enrollment.course === courseId
            );
            if (alreadyExists) return prev;
            return [...prev, data.data];
          });
          toast.success('Enrolled in course successfully!');
        }
        return { success: true };
      } catch (enrollmentError) {
        const message = enrollmentError.response?.data?.message || 'Failed to enroll';
        toast.error(message);
        return { success: false, message };
      }
    },
    [api]
  );

  const updateProgress = useCallback(
    async ({ courseId, progress, moduleId, completed }) => {
      try {
        const normalizedCourseId = courseId?.toString();

        let response;
        if (moduleId) {
          response = await api.put('/progress/module-complete', {
            courseId: normalizedCourseId,
            moduleId,
            completed,
            status: completed ? 'completed' : 'in-progress'
          });
        } else {
          response = await api.put('/enrollments/progress', {
            courseId: normalizedCourseId,
            ...(typeof progress === 'number' ? { progress } : {})
          });
        }

        const { data } = response;

        if (!data.success) {
          return { success: false, message: data.message };
        }

        const updatedEnrollment = moduleId ? data.data.enrollment : data.data;
        const progressEntry = moduleId ? data.data.progressEntry : undefined;

        mergeEnrollment(updatedEnrollment);

        return {
          success: true,
          data: {
            enrollment: updatedEnrollment,
            ...(progressEntry ? { progressEntry } : {})
          }
        };
      } catch (progressError) {
        const message = progressError.response?.data?.message || 'Failed to update progress';
        toast.error(message);
        return { success: false, message };
      }
    },
    [api, mergeEnrollment]
  );

  const completePracticeItem = useCallback(
    async ({ courseId, moduleId, itemIndex, itemType, completed = true }) => {
      try {
        const { data } = await api.put('/progress/practice-complete', {
          courseId,
          moduleId,
          itemIndex,
          itemType,
          completed
        });

        if (!data.success) {
          return { success: false, message: data.message };
        }

        mergeEnrollment(data.data.enrollment);
        return { success: true, data: data.data };
      } catch (practiceError) {
        const message =
          practiceError.response?.data?.message || 'Failed to update practice item';
        toast.error(message);
        return { success: false, message };
      }
    },
    [api, mergeEnrollment]
  );

  const submitQuizAttempt = useCallback(
    async ({ courseId, moduleId, answers }) => {
      try {
        const { data } = await api.post('/progress/quiz', {
          courseId,
          moduleId,
          answers
        });

        if (!data.success) {
          return { success: false, message: data.message };
        }

        mergeEnrollment(data.data.enrollment);

        return {
          success: true,
          data: data.data
        };
      } catch (quizError) {
        const message = quizError.response?.data?.message || 'Failed to submit quiz';
        toast.error(message);
        return { success: false, message };
      }
    },
    [api, mergeEnrollment]
  );

  const fetchCertificate = useCallback(
    async (courseId) => {
      try {
        const { data } = await api.get(`/progress/${courseId}/certificate`);
        if (data.success) {
          return { success: true, data: data.data };
        }
        return { success: false, message: data.message };
      } catch (certificateError) {
        const message =
          certificateError.response?.data?.message || 'Failed to load certificate';
        toast.error(message);
        return { success: false, message };
      }
    },
    [api]
  );

  const getCourseProgress = useCallback(
    async (courseId) => {
      try {
        const { data } = await api.get(`/progress/${courseId}`);
        return { success: true, data: data.data };
      } catch (progressError) {
        const message = progressError.response?.data?.message || 'Failed to load progress';
      toast.error(message);
        return { success: false, message };
      }
    },
    [api]
  );

  const fetchInstructors = useCallback(
    async () => {
      try {
        const { data } = await api.get('/auth/instructors');
        if (data.success) {
          return { success: true, data: data.data };
        }
        return { success: false, message: data.message };
      } catch (error) {
        const message = error.response?.data?.message || 'Failed to fetch instructors';
        toast.error(message);
        return { success: false, message };
      }
    },
    [api]
  );

  const fetchInstructorById = useCallback(
    async (instructorId) => {
      try {
        const { data } = await api.get(`/auth/instructors/${instructorId}`);
        if (data.success) {
          return { success: true, data: data.data };
        }
        return { success: false, message: data.message };
      } catch (error) {
        const message = error.response?.data?.message || 'Failed to fetch instructor';
        toast.error(message);
        return { success: false, message };
      }
    },
    [api]
  );

  const createInstructor = useCallback(
    async ({ name, email, password, bio, skills, location }) => {
      try {
        const { data } = await api.post('/auth/instructors', {
          name,
          email,
          password,
          bio,
          skills,
          location
        });
        if (data.success) {
          toast.success(`Instructor ${name} created successfully!`);
        }
        return { success: true, data: data.data };
      } catch (instructorError) {
        const message = instructorError.response?.data?.message || 'Failed to create instructor';
        toast.error(message);
        return { success: false, message };
      }
    },
    [api]
  );

  const updateInstructor = useCallback(
    async (instructorId, updateData) => {
      try {
        const { data } = await api.put(`/auth/instructors/${instructorId}`, updateData);
        if (data.success) {
          toast.success('Instructor updated successfully!');
        }
        return { success: true, data: data.data };
      } catch (error) {
        const message = error.response?.data?.message || 'Failed to update instructor';
        toast.error(message);
        return { success: false, message };
      }
    },
    [api]
  );

  const deleteInstructor = useCallback(
    async (instructorId) => {
      try {
        const { data } = await api.delete(`/auth/instructors/${instructorId}`);
        if (data.success) {
          toast.success('Instructor deleted successfully!');
        }
        return { success: true };
      } catch (error) {
        const message = error.response?.data?.message || 'Failed to delete instructor';
        toast.error(message);
        return { success: false, message };
      }
    },
    [api]
  );

  const fetchMyCourses = useCallback(
    async () => {
      setCoursesLoading(true);
      try {
        const { data } = await api.get('/courses/my-courses');
        if (data.success) {
          setCourses(data.data);
        } else {
          setCourses([]);
        }
      } catch (fetchError) {
        setError(fetchError.message);
        setCourses([]);
      } finally {
        setCoursesLoading(false);
      }
    },
    [api]
  );

  const createCourse = useCallback(
    async (courseData) => {
      try {
        const { data } = await api.post('/courses', courseData);
        if (data.success) {
          toast.success('Course created successfully!');
          setCourses((prev) => [data.data, ...prev]);
        }
        return { success: true, data: data.data };
      } catch (courseError) {
        const message = courseError.response?.data?.message || 'Failed to create course';
        toast.error(message);
        return { success: false, message };
      }
    },
    [api]
  );

  const updateCourse = useCallback(
    async (courseId, courseData) => {
      try {
        const { data } = await api.put(`/courses/${courseId}`, courseData);
        if (data.success) {
          toast.success('Course updated successfully!');
          setCourses((prev) =>
            prev.map((course) => (course._id === courseId ? data.data : course))
          );
        }
        return { success: true, data: data.data };
      } catch (courseError) {
        const message = courseError.response?.data?.message || 'Failed to update course';
        toast.error(message);
        return { success: false, message };
      }
    },
    [api]
  );

  const fetchCourseById = useCallback(
    async (courseId) => {
      try {
        const { data } = await api.get(`/courses/${courseId}`);
        if (data.success) {
          return { success: true, data: data.data };
        }
        return { success: false, message: data.message };
      } catch (courseError) {
        const message = courseError.response?.data?.message || 'Failed to fetch course';
        toast.error(message);
        return { success: false, message };
      }
    },
    [api]
  );

  const deleteCourse = useCallback(
    async (courseId) => {
      try {
        const { data } = await api.delete(`/courses/${courseId}`);
        if (data.success) {
          toast.success('Course deleted successfully!');
          setCourses((prev) => prev.filter((course) => course._id !== courseId));
        }
        return { success: true };
      } catch (courseError) {
        const message = courseError.response?.data?.message || 'Failed to delete course';
        toast.error(message);
        return { success: false, message };
      }
    },
    [api]
  );

  const fetchCourseEnrollments = useCallback(
    async (courseId) => {
      try {
        const { data } = await api.get(`/courses/${courseId}/enrollments`);
        if (data.success) {
          return { success: true, data: data.data };
        }
        return { success: false, message: data.message };
      } catch (error) {
        const message = error.response?.data?.message || 'Failed to fetch enrollments';
        toast.error(message);
        return { success: false, message };
      }
    },
    [api]
  );

  const fetchCourseAnalytics = useCallback(
    async (courseId) => {
      try {
        const { data } = await api.get(`/courses/${courseId}/analytics`);
        if (data.success) {
          return { success: true, data: data.data };
        }
        return { success: false, message: data.message };
      } catch (error) {
        const message = error.response?.data?.message || 'Failed to fetch analytics';
        toast.error(message);
        return { success: false, message };
      }
    },
    [api]
  );

  const uploadFile = useCallback(
    async (file, resourceType = 'auto', folder = null) => {
      try {
        const formData = new FormData();
        formData.append('file', file);
        if (resourceType !== 'auto') {
          formData.append('resourceType', resourceType);
        }
        if (folder) {
          formData.append('folder', folder);
        }

        const { data } = await api.post('/uploads/file', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        if (data.success) {
          return { success: true, data: data.data };
        }
        return { success: false, message: data.message };
      } catch (uploadError) {
        const message = uploadError.response?.data?.message || 'Failed to upload file';
        toast.error(message);
        return { success: false, message };
      }
    },
    [api]
  );

  return (
    <AppContext.Provider
              value={{
        api,
        user,
        courses,
        enrollments,
        loading,
        coursesLoading,
        enrollmentsLoading,
        error,
        login,
        register,
        logout,
        fetchCourses,
        fetchEnrollments,
        enrollInCourse,
        updateProgress,
        completePracticeItem,
        submitQuizAttempt,
        fetchCertificate,
        getCourseProgress,
        fetchInstructors,
        fetchInstructorById,
        createInstructor,
        updateInstructor,
        deleteInstructor,
        fetchMyCourses,
        createCourse,
        updateCourse,
        deleteCourse,
        fetchCourseById,
        fetchCourseEnrollments,
        fetchCourseAnalytics,
        uploadFile
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

AppProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export const useAppContext = () => useContext(AppContext);

