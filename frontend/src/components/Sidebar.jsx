import PropTypes from 'prop-types';
import { useState, useMemo } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { FiBookOpen, FiCompass, FiHome, FiLogOut, FiMenu, FiUserPlus, FiPlus, FiList, FiUsers } from 'react-icons/fi';
import { useAppContext } from '../context/AppContext';

const allNavItems = [
  { name: 'Dashboard', path: '/dashboard', icon: FiHome, roles: ['student', 'instructor', 'admin'] },
  { name: 'Courses', path: '/courses', icon: FiBookOpen, roles: ['student'] },
  { name: 'Learning', path: '/learn', icon: FiCompass, roles: ['student'] },
  { name: 'Manage Instructors', path: '/instructors', icon: FiUsers, roles: ['admin'] },
  { name: 'Create Instructor', path: '/create-instructor', icon: FiUserPlus, roles: ['admin'] },
  { name: 'Create Course', path: '/create-course', icon: FiPlus, roles: ['instructor', 'admin'] },
  { name: 'My Courses', path: '/my-courses', icon: FiList, roles: ['instructor', 'admin'] }
];

const Sidebar = ({ isCollapsed = false, onToggle }) => {
  const { user, logout } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = useMemo(() => {
    if (!user) return [];
    return allNavItems.filter((item) => item.roles.includes(user.role));
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const renderNavLink = (item) => {
    if (item.roles && !item.roles.includes(user?.role)) {
      return null;
    }

    const Icon = item.icon;
    const isActive =
      item.path === '/learn'
        ? location.pathname.startsWith('/learn') && !location.pathname.includes('/edit')
        : item.path === '/my-courses'
        ? location.pathname === '/my-courses'
        : item.path === '/instructors'
        ? location.pathname === '/instructors' || location.pathname === '/create-instructor' || location.pathname.startsWith('/instructors/')
        : item.path === '/create-course'
        ? location.pathname === '/create-course' || (location.pathname.includes('/courses/') && location.pathname.includes('/edit'))
        : location.pathname === item.path;

    return (
      <NavLink
        key={item.name}
        to={item.path}
        onClick={() => setIsMobileOpen(false)}
        className={({ isActive: routeActive }) =>
          [
            'flex items-center rounded-xl px-4 py-3 transition-colors duration-200',
            'text-sm font-medium',
            'hover:bg-purple-100/90 hover:text-purple-700',
            'dark:hover:bg-purple-400/10 dark:hover:text-purple-200',
            routeActive || isActive
              ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-100'
              : 'text-slate-600 dark:text-slate-300'
          ].join(' ')
        }
        title={isCollapsed ? item.name : undefined}
      >
        <Icon className="mr-3 text-lg" />
        {!isCollapsed && <span>{item.name}</span>}
      </NavLink>
    );
  };

  return (
    <aside
      className={[
        'border-r border-slate-200 bg-white/90 backdrop-blur-md transition-all duration-300',
        'dark:border-slate-800 dark:bg-slate-950/80',
        'fixed inset-y-0 left-0 z-40 flex flex-col shadow-lg',
        isCollapsed ? 'w-16' : 'w-64'
      ].join(' ')}
    >
      <div className="flex items-center justify-between px-4 py-5">
          <button
            onClick={() => navigate('/dashboard')}
          className={[
            'flex items-center gap-3 rounded-xl transition',
            isCollapsed ? 'justify-center px-2 py-2' : 'px-3 py-2'
          ].join(' ')}
        >
          <div
            className={[
              'flex items-center justify-center rounded-xl font-semibold uppercase tracking-wide',
              'bg-purple-600 text-white shadow-md',
              isCollapsed ? 'h-10 w-10 text-sm' : 'h-11 w-11 text-base'
            ].join(' ')}
          >
            SH
          </div>
          {!isCollapsed && (
            <div className="text-left">
              <span className="block text-sm font-semibold text-purple-700 dark:text-purple-200">
                SkillsHub Rwanda
              </span>
              <span className="block text-xs text-slate-500 dark:text-slate-400">
                Learn. Build. Grow.
              </span>
            </div>
          )}
          </button>
        <button
          onClick={() => {
            setIsMobileOpen((open) => !open);
            onToggle?.();
          }}
          className="rounded-lg p-2 text-purple-600 hover:bg-purple-100/70 dark:text-purple-200 dark:hover:bg-purple-500/20 lg:hidden"
          aria-label="Toggle navigation"
        >
          <FiMenu className="text-xl" />
        </button>
      </div>

      <nav
        className={[
          'flex-1 space-y-2 overflow-y-auto px-3 pb-6 pt-2',
          isMobileOpen ? 'block' : 'hidden lg:block'
        ].join(' ')}
      >
        {navItems.map(renderNavLink)}
      </nav>

        <div className="mt-auto border-t border-slate-200 px-3 py-4 dark:border-slate-800">
        <div className="rounded-xl bg-purple-600 p-4 text-white shadow-md">
          <p className="text-sm font-semibold">{user?.name}</p>
          <p className="text-xs capitalize opacity-80">{user?.role}</p>
        </div>
        <button
          onClick={handleLogout}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-purple-200 px-4 py-2 text-sm font-medium text-purple-600 transition hover:bg-purple-100/90 dark:border-purple-500/40 dark:text-purple-200 dark:hover:bg-purple-500/20"
        >
          <FiLogOut />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
};

Sidebar.propTypes = {
  isCollapsed: PropTypes.bool,
  onToggle: PropTypes.func
};

export default Sidebar;

