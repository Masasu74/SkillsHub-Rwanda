import PropTypes from 'prop-types';
import { FiCheckCircle, FiPlayCircle } from 'react-icons/fi';

const ModuleNavigation = ({ modules, activeModuleId, completedModules, onSelect }) => {
  if (!modules?.length) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
        Modules will appear here once the course content is ready.
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {modules.map((module) => {
        const isActive = activeModuleId === module._id;
        const isCompleted = completedModules?.some(
          (moduleId) => moduleId.toString() === module._id.toString()
        );

        return (
          <li key={module._id}>
            <button
              type="button"
              onClick={() => onSelect?.(module)}
              className={[
                'w-full rounded-3xl border px-4 py-3 text-left transition',
                'flex flex-col gap-1',
                isActive
                  ? 'border-purple-500 bg-purple-500/10 text-purple-700 shadow-lg dark:border-purple-400 dark:bg-purple-500/10 dark:text-purple-200'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-purple-300 hover:bg-purple-50 hover:text-purple-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-purple-400 dark:hover:bg-purple-500/10 dark:hover:text-purple-100'
              ].join(' ')}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">{module.title}</span>
                <span className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide">
                  {isCompleted ? (
                    <>
                      <FiCheckCircle className="text-green-500" />
                      Completed
                    </>
                  ) : (
                    <>
                      <FiPlayCircle className="text-purple-400" />
                      {module.duration ? `${module.duration} min` : 'Start'}
                    </>
                  )}
                </span>
              </div>
              {module.description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  {module.description}
                </p>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
};

ModuleNavigation.propTypes = {
  modules: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.string,
      duration: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
    })
  ),
  activeModuleId: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  completedModules: PropTypes.array,
  onSelect: PropTypes.func
};

ModuleNavigation.defaultProps = {
  modules: [],
  activeModuleId: undefined,
  completedModules: [],
  onSelect: undefined
};

export default ModuleNavigation;

