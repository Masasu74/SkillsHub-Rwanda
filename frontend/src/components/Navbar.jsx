import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBell, FiChevronDown, FiMoon, FiSun } from 'react-icons/fi';
import ThemeToggle from './ThemeToggle';
import { useAppContext } from '../context/AppContext';

const Navbar = () => {
  const { user, logout } = useAppContext();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((segment) => segment[0]?.toUpperCase())
        .slice(0, 2)
        .join('')
    : 'SR';

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
    setMenuOpen(false);
  };

  return (
    <header className="flex items-center justify-between rounded-3xl bg-white/80 px-6 py-4 shadow-lg backdrop-blur-xl dark:bg-slate-900/80">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
          Hi {user?.name?.split(' ')[0] || 'there'} 👋
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Let’s keep learning and building your skills today.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          className="rounded-full bg-purple-100/70 p-3 text-purple-600 transition hover:bg-purple-100 dark:bg-purple-500/20 dark:text-purple-200 dark:hover:bg-purple-500/30"
          aria-label="Notifications"
        >
          <FiBell className="text-lg" />
        </button>

        <ThemeToggle
          iconSun={<FiSun className="text-base" />}
          iconMoon={<FiMoon className="text-base" />}
        />

        <div className="relative z-[999]">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="flex items-center gap-3 rounded-full bg-purple-600/10 px-3 py-2 text-left transition hover:bg-purple-600/20 dark:bg-purple-500/20 dark:hover:bg-purple-500/30"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-600 text-sm font-semibold text-white shadow-md">
              {initials}
            </span>
            <div className="hidden text-sm lg:block">
              <p className="font-semibold text-slate-900 dark:text-white">{user?.name}</p>
              <p className="text-xs capitalize text-slate-500 dark:text-slate-400">
                {user?.role}
              </p>
            </div>
            <FiChevronDown className="text-slate-500 transition-transform dark:text-slate-400" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-3 w-48 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-700 dark:bg-slate-900">
              <button
                type="button"
                onClick={() => {
                  navigate('/dashboard');
                  setMenuOpen(false);
                }}
                className="w-full rounded-xl px-4 py-2 text-left text-sm font-medium text-slate-600 transition hover:bg-purple-100/80 hover:text-purple-700 dark:text-slate-300 dark:hover:bg-purple-500/20 dark:hover:text-purple-100"
              >
                View Profile
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="mt-2 w-full rounded-xl px-4 py-2 text-left text-sm font-medium text-red-500 transition hover:bg-red-100/70 dark:hover:bg-red-500/20"
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;

