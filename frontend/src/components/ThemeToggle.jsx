import PropTypes from 'prop-types';
import { useTheme } from '../context/ThemeContext';
import { FiMoon, FiSun } from 'react-icons/fi';

const ThemeToggle = ({ iconSun, iconMoon }) => {
  const { darkMode, toggleDarkMode } = useTheme();

  const SunIcon = iconSun || <FiSun className="text-lg text-yellow-500" />;
  const MoonIcon = iconMoon || <FiMoon className="text-lg text-indigo-400" />;

  return (
    <button
      type="button"
      onClick={toggleDarkMode}
      className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600 shadow-inner transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
      title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {darkMode ? SunIcon : MoonIcon}
    </button>
  );
};

ThemeToggle.propTypes = {
  iconSun: PropTypes.node,
  iconMoon: PropTypes.node
};

export default ThemeToggle;
