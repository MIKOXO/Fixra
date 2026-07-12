import { forwardRef, useCallback } from 'react';

const NumberInput = forwardRef(({
  label,
  name,
  required,
  optional: isOptional,
  prefix,
  min,
  max,
  error,
  helperText,
  className = '',
  ...props
}, ref) => {
  const handleKeyDown = useCallback((e) => {
    if (['e', 'E', '+', '-', '.'].includes(e.key)) {
      e.preventDefault();
    }
  }, []);

  const labelClass =
    'font-body text-xs font-semibold uppercase tracking-[0.08em] text-charcoal-600';
  const inputClass =
    'mt-1.5 w-full rounded-xl border border-charcoal-200/90 bg-white text-charcoal-950 text-sm outline-none transition duration-200 placeholder:text-charcoal-400 placeholder:text-xs focus:border-primary-400 focus:ring-4 focus:ring-primary-100 disabled:cursor-not-allowed disabled:opacity-50';

  return (
    <div className={className}>
      {label && (
        <label htmlFor={name} className={`${labelClass} mb-1 block`}>
          {label}
          {required && <span className="ml-0.5 text-primary-500 text-base leading-none">*</span>}
          {isOptional && (
            <span className="ml-1 font-normal lowercase text-charcoal-400">
              (optional)
            </span>
          )}
        </label>
      )}
      {helperText && (
        <p className="mb-1 font-body text-[11px] text-charcoal-400">{helperText}</p>
      )}
      <div className="relative">
        {prefix && (
          <span className="absolute left-3.5 top-1/2 z-10 -translate-y-1/2 font-body text-sm text-charcoal-500">
            {prefix}
          </span>
        )}
        <input
          ref={ref}
          type="number"
          id={name}
          name={name}
          onKeyDown={handleKeyDown}
          min={min}
          max={max}
          className={`${inputClass} ${prefix ? 'pl-[40px]' : 'px-4'} py-2.5`}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 font-body text-xs text-primary-500">{error}</p>
      )}
    </div>
  );
});

NumberInput.displayName = 'NumberInput';

export default NumberInput;
