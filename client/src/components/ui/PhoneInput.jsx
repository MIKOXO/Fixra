import { forwardRef, useCallback } from 'react';

const DIGIT_LIMIT = 9;

const formatDisplay = (raw) => {
  if (!raw) return '';
  const rest = raw.replace(/^\+251/, '');
  if (!rest) return '+251';
  const groups = [];
  if (rest.length > 0) groups.push(rest.slice(0, 2));
  if (rest.length > 2) groups.push(rest.slice(2, 5));
  if (rest.length > 5) groups.push(rest.slice(5));
  return `+251 ${groups.join(' ')}`;
};

const toRaw = (display) => {
  const digits = display.replace(/\D/g, '');
  let rest = digits.startsWith('251') ? digits.slice(3) : digits;
  rest = rest.slice(0, DIGIT_LIMIT);
  return rest ? `+251${rest}` : '';
};

const PhoneInput = forwardRef(({ value = '', onChange, onFocus, ...props }, ref) => {
  const handleChange = useCallback((e) => {
    const raw = toRaw(e.target.value);
    onChange(raw);
  }, [onChange]);

  const handleFocus = useCallback((e) => {
    if (!value) {
      onChange('+251');
    }
    if (onFocus) onFocus(e);
  }, [value, onChange, onFocus]);

  return (
    <input
      ref={ref}
      type="tel"
      autoComplete="tel"
      value={formatDisplay(value)}
      onChange={handleChange}
      onFocus={handleFocus}
      {...props}
    />
  );
});

PhoneInput.displayName = 'PhoneInput';

export default PhoneInput;
