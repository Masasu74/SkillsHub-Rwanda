import PropTypes from 'prop-types';

const ProgressBar = ({ value, label }) => {
  const clamped = Math.max(0, Math.min(100, value || 0));

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between text-sm font-medium text-slate-600 dark:text-slate-300">
          <span>{label}</span>
          <span>{clamped}%</span>
        </div>
      )}
      <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <div
          className="h-full rounded-full bg-purple-600 transition-all duration-500"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};

ProgressBar.propTypes = {
  value: PropTypes.number,
  label: PropTypes.string
};

ProgressBar.defaultProps = {
  value: 0,
  label: undefined
};

export default ProgressBar;

