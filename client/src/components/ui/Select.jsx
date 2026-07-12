import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdKeyboardArrowDown } from 'react-icons/md';

const dropdownVariants = {
  hidden: { opacity: 0, scaleY: 0.85, y: -6 },
  visible: { opacity: 1, scaleY: 1, y: 0, transition: { duration: 0.15, ease: 'easeOut' } },
  exit: { opacity: 0, scaleY: 0.85, y: -6, transition: { duration: 0.1, ease: 'easeIn' } },
};

const Select = ({ value, onChange, options = [], placeholder = 'Select...', className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) close();
    };
    const handleEscape = (e) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, close]);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-charcoal-200/90 bg-white px-3.5 py-2.5 font-body text-sm text-charcoal-700 outline-none transition-all duration-200 hover:border-charcoal-300 focus:border-primary-400 focus:ring-4 focus:ring-primary-100"
      >
        <span className={selected && value !== '' ? 'text-charcoal-800' : 'text-charcoal-400'}>
          {selected ? selected.label : placeholder}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="flex shrink-0 text-charcoal-400"
        >
          <MdKeyboardArrowDown className="text-lg" />
        </motion.span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="dropdown"
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute left-0 right-0 top-full z-40 mt-1.5 origin-top overflow-y-auto rounded-xl border border-charcoal-200/90 bg-white shadow-lg max-h-60"
          >
            {options.length === 0 ? (
              <p className="px-3.5 py-2.5 font-body text-xs text-charcoal-400">No options</p>
            ) : (
              options.map((option, i) => (
                <button
                  key={option.value ?? i}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    close();
                  }}
                  className={`flex w-full items-center px-3.5 py-2.5 text-left font-body text-sm transition-colors hover:bg-primary-50 ${
                    value === option.value
                      ? 'bg-primary-50/80 font-semibold text-primary-600'
                      : 'text-charcoal-700'
                  }`}
                >
                  {option.label}
                </button>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Select;