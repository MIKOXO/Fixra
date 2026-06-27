import { useMemo } from 'react';

const CRITERIA = [
  (p) => p.length >= 8,
  (p) => /[a-z]/.test(p),
  (p) => /[A-Z]/.test(p),
  (p) => /[0-9]/.test(p),
  (p) => /[^A-Za-z0-9]/.test(p),
];

const LEVELS = [
  { label: '', segments: 0, barColor: '', textColor: '' },
  { label: 'Weak', segments: 1, barColor: 'bg-red-500', textColor: 'text-red-600' },
  { label: 'Fair', segments: 2, barColor: 'bg-amber-500', textColor: 'text-amber-600' },
  { label: 'Good', segments: 3, barColor: 'bg-amber-400', textColor: 'text-amber-600' },
  { label: 'Strong', segments: 4, barColor: 'bg-sage-400', textColor: 'text-sage-600' },
  { label: 'Very strong', segments: 5, barColor: 'bg-sage-500', textColor: 'text-sage-700' },
];

const PasswordStrengthIndicator = ({ password = '' }) => {
  const { score, level } = useMemo(() => {
    const s = CRITERIA.reduce((acc, fn) => acc + (fn(password) ? 1 : 0), 0);
    return { score: s, level: LEVELS[s] };
  }, [password]);

  if (!password) return null;

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {LEVELS.slice(1).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              i < level.segments ? level.barColor : 'bg-charcoal-200'
            }`}
          />
        ))}
      </div>
      <p className={`text-xs font-medium tracking-wide ${level.textColor}`}>
        {level.label}
      </p>
    </div>
  );
};

export default PasswordStrengthIndicator;
