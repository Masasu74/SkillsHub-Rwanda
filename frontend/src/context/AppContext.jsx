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

        setEnrollments((prev) => {
          let found = false;

          const next = prev.map((enrollment) => {
            const enrollmentCourseId =
              typeof enrollment.course === 'string'
                ? enrollment.course
                : enrollment.course?._id?.toString();

            if (enrollmentCourseId === normalizedCourseId) {
              found = true;
              return updatedEnrollment;
            }

            return enrollment;
          });

          return found ? next : [...prev, updatedEnrollment];
        });

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
        getCourseProgress
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

