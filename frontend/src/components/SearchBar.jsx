import PropTypes from 'prop-types';
import { FiFilter, FiSearch } from 'react-icons/fi';

const categories = [
  { label: 'All categories', value: '' },
  { label: 'Technology', value: 'technology' },
  { label: 'Business', value: 'business' },
  { label: 'Hospitality', value: 'hospitality' }
];

const levels = [
  { label: 'All levels', value: '' },
  { label: 'Beginner', value: 'beginner' },
  { label: 'Intermediate', value: 'intermediate' },
  { label: 'Advanced', value: 'advanced' }
];

const SearchBar = ({ filters, onChange }) => {
  const handleChange = (event) => {
    const { name, value } = event.target;
    onChange({ ...filters, [name]: value });
  };

  return (
    <div className="grid gap-4 rounded-3xl bg-white p-6 shadow-lg dark:bg-slate-900 md:grid-cols-4">
      <div className="md:col-span-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
          Find courses
        </label>
        <div className="mt-2 flex items-center rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-2 focus-within:border-purple-400 focus-within:bg-white dark:border-slate-700 dark:bg-slate-800/60">
          <FiSearch className="mr-3 text-lg text-slate-400" />
          <input
            type="text"
            name="search"
            placeholder="Search by title, instructor or keyword..."
            value={filters.search || ''}
            onChange={handleChange}
            className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 dark:text-slate-200"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
          Category
        </label>
        <div className="mt-2 flex items-center rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-2 focus-within:border-purple-400 focus-within:bg-white dark:border-slate-700 dark:bg-slate-800/60">
          <FiFilter className="mr-3 text-lg text-slate-400" />
          <select
            name="category"
            value={filters.category || ''}
            onChange={handleChange}
            className="w-full bg-transparent text-sm text-slate-700 outline-none dark:text-slate-200"
          >
            {categories.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
          Level
        </label>
        <div className="mt-2 flex items-center rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-2 focus-within:border-purple-400 focus-within:bg-white dark:border-slate-700 dark:bg-slate-800/60">
          <FiFilter className="mr-3 text-lg text-slate-400" />
          <select
            name="level"
            value={filters.level || ''}
            onChange={handleChange}
            className="w-full bg-transparent text-sm text-slate-700 outline-none dark:text-slate-200"
          >
            {levels.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

SearchBar.propTypes = {
  filters: PropTypes.shape({
    search: PropTypes.string,
    category: PropTypes.string,
    level: PropTypes.string
  }).isRequired,
  onChange: PropTypes.func.isRequired
};

export default SearchBar;

