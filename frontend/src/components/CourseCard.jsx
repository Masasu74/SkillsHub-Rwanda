import PropTypes from 'prop-types';
import { FiClock, FiLayers, FiUsers } from 'react-icons/fi';

const categoryColors = {
  technology: 'bg-sky-100 text-sky-700 dark:bg-sky-500/10 dark:text-sky-200',
  business: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200',
  hospitality: 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-200'
};

const CourseCard = ({ course, onSelect }) => {
  const {
    title,
    description,
    category,
    level,
    duration,
    imageUrl,
    modules = [],
    instructor
  } = course;

  const badgeClass =
    categoryColors[category] || 'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-200';

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900">
      <div className="relative">
        <div className="h-40 w-full overflow-hidden">
          <img
            src={
              imageUrl ||
              `https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=800&q=80`
            }
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div
          className={[
            'absolute top-4 left-4 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-black/5 backdrop-blur',
            badgeClass
          ].join(' ')}
        >
          {category}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 transition group-hover:text-purple-600 dark:text-white">
            {title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{description}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800">
            <FiLayers className="text-base text-purple-500" />
            {level}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800">
            <FiClock className="text-base text-purple-500" />
            {duration} hrs
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800">
            <FiUsers className="text-base text-purple-500" />
            {modules.length} modules
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between">
          <div className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Instructor
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {instructor?.name || 'SkillsHub Instructor'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onSelect?.(course)}
            className="rounded-full bg-purple-600 px-5 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
          >
            View course
          </button>
        </div>
      </div>
    </article>
  );
};

CourseCard.propTypes = {
  course: PropTypes.shape({
    _id: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    category: PropTypes.string,
    level: PropTypes.string,
    duration: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    imageUrl: PropTypes.string,
    modules: PropTypes.array,
    instructor: PropTypes.shape({
      name: PropTypes.string
    })
  }).isRequired,
  onSelect: PropTypes.func
};

export default CourseCard;

