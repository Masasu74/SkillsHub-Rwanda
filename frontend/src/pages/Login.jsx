import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLock, FiMail, FiMapPin, FiUser } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAppContext } from '../context/AppContext';

const Login = () => {
  const { login, register } = useAppContext();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    location: '',
    bio: '',
    skills: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (mode === 'register' && form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'login') {
        const response = await login({
          email: form.email,
          password: form.password
        });
        if (response.success) {
          navigate('/dashboard', { replace: true });
        } else {
          toast.error(response.message || 'Unable to sign in');
        }
      } else {
        const skillList = form.skills
          .split(',')
          .map((skill) => skill.trim())
          .filter(Boolean);

        const response = await register({
          name: form.name,
          email: form.email,
          password: form.password,
          bio: form.bio,
          skills: skillList,
          location: form.location
        });

        if (response.success) {
          toast.success('Welcome aboard! Your account has been created.');
          navigate('/dashboard', { replace: true });
        } else {
          toast.error(response.message || 'Unable to create account');
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const sectionCopy = useMemo(() => {
    if (mode === 'register') {
      return {
        heading: 'Start your learning journey',
        description: 'Create a learner account to enroll in courses and track your progress.',
        submitLabel: submitting ? 'Creating account...' : 'Create account',
        togglePrompt: 'Already have an account?',
        toggleAction: 'Sign in'
      };
    }

    return {
      heading: 'Sign in to continue',
      description: 'Use your SkillsHub credentials to access your personalised learning journey.',
      submitLabel: submitting ? 'Signing in...' : 'Sign in',
      togglePrompt: 'New to SkillsHub?',
      toggleAction: 'Create an account'
    };
  }, [mode, submitting]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 py-12 dark:bg-slate-950">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-4xl border border-slate-100 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 md:grid-cols-[1.2fr,1fr]">
        <section className="relative hidden flex-col justify-between overflow-hidden bg-purple-700 p-10 text-white md:flex">
          <div>
            <span className="inline-flex items-center rounded-full bg-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-purple-100">
              SkillsHub Rwanda
            </span>
            <h1 className="mt-6 text-3xl font-semibold leading-tight">
              Your pathway to practical, job-ready skills
            </h1>
            <p className="mt-4 max-w-sm text-sm text-purple-100/90">
              Join learning journeys tailored for Rwanda&apos;s technology, business, and hospitality
              sectors. Learn at your pace and unlock new opportunities.
            </p>
          </div>
          <div className="rounded-3xl bg-white/10 p-6 text-sm text-purple-100/90 backdrop-blur">
            <p className="font-medium uppercase tracking-wide text-purple-100/90">
              Why learn with SkillsHub?
            </p>
            <ul className="mt-4 space-y-2">
              <li>• Instructor-led courses backed by real industry experience</li>
              <li>• Module-level tracking so you can celebrate progress</li>
              <li>• Communities and mentorship designed for Rwanda&apos;s youth</li>
            </ul>
          </div>
        </section>

        <section className="p-8 md:p-12">
          <div className="mb-10 space-y-2">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
              {sectionCopy.heading}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {sectionCopy.description}
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {mode === 'register' && (
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Full name
                  </label>
                  <div className="mt-2 flex items-center rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 focus-within:border-purple-400 focus-within:bg-white dark:border-slate-800 dark:bg-slate-900/70">
                    <FiUser className="mr-3 text-lg text-slate-400" />
                    <input
                      type="text"
                      name="name"
                      required
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Ariella Uwera"
                      className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Location (optional)
                    </label>
                    <div className="mt-2 flex items-center rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 focus-within:border-purple-400 focus-within:bg-white dark:border-slate-800 dark:bg-slate-900/70">
                      <FiMapPin className="mr-3 text-lg text-slate-400" />
                      <input
                        type="text"
                        name="location"
                        value={form.location}
                        onChange={handleChange}
                        placeholder="Kigali, Rwanda"
                        className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Skills (comma separated, optional)
                    </label>
                    <input
                      type="text"
                      name="skills"
                      value={form.skills}
                      onChange={handleChange}
                      placeholder="Web development, Hospitality"
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-purple-400 focus:bg-white dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    About you (optional)
                  </label>
                  <textarea
                    name="bio"
                    value={form.bio}
                    onChange={handleChange}
                    placeholder="Tell us about your goals or experience..."
                    rows={3}
                    className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-purple-400 focus:bg-white dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-100"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Email
              </label>
              <div className="mt-2 flex items-center rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 focus-within:border-purple-400 focus-within:bg-white dark:border-slate-800 dark:bg-slate-900/70">
                <FiMail className="mr-3 text-lg text-slate-400" />
                <input
                  type="email"
                  name="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Password
                </label>
                <div className="mt-2 flex items-center rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 focus-within:border-purple-400 focus-within:bg-white dark:border-slate-800 dark:bg-slate-900/70">
                  <FiLock className="mr-3 text-lg text-slate-400" />
                  <input
                    type="password"
                    name="password"
                    required
                    value={form.password}
                    onChange={handleChange}
                    placeholder={mode === 'register' ? 'Create a password' : 'Enter your password'}
                    className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100"
                  />
                </div>
              </div>

              {mode === 'register' && (
                <div className="sm:col-span-1">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Confirm password
                  </label>
                  <div className="mt-2 flex items-center rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 focus-within:border-purple-400 focus-within:bg-white dark:border-slate-800 dark:bg-slate-900/70">
                    <FiLock className="mr-3 text-lg text-slate-400" />
                    <input
                      type="password"
                      name="confirmPassword"
                      required
                      value={form.confirmPassword}
                      onChange={handleChange}
                      placeholder="Re-enter password"
                      className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100"
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
            className="w-full rounded-2xl bg-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-80"
            >
              {sectionCopy.submitLabel}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-center gap-2 text-sm">
            <span className="text-slate-500 dark:text-slate-400">{sectionCopy.togglePrompt}</span>
            <button
              type="button"
              onClick={() => {
                setMode((prev) => (prev === 'login' ? 'register' : 'login'));
                setForm((prev) => ({
                  ...prev,
                  password: '',
                  confirmPassword: ''
                }));
              }}
              className="font-semibold text-purple-600 hover:text-purple-500 dark:text-purple-300 dark:hover:text-purple-200"
            >
              {sectionCopy.toggleAction}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Login;

