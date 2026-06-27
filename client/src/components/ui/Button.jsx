import ButtonLoader from './ButtonLoader';

const Button = ({ 
  children, 
  type = 'button', 
  variant = 'primary', 
  disabled = false, 
  loading = false,
  onClick,
  className = '',
  ...props 
}) => {
  const baseStyles = 'inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-2.5 font-heading text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60';
  
  const variants = {
    primary: 'bg-primary-500 text-white shadow-[0_12px_28px_rgba(232,93,58,0.22)] hover:bg-primary-600 hover:shadow-[0_16px_34px_rgba(232,93,58,0.28)]',
    secondary: 'border border-charcoal-300 bg-white text-charcoal-900 hover:border-charcoal-400 hover:bg-charcoal-50',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {loading && <ButtonLoader />}
      {children}
    </button>
  );
};

export default Button;
