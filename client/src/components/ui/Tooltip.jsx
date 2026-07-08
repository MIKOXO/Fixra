import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';

const Tooltip = ({ children, label, side = 'right', className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const triggerRef = useRef(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  const updatePosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      let top = 0;
      let left = 0;

      if (side === 'right') {
        top = rect.top + rect.height / 2;
        left = rect.right + 12;
      } else if (side === 'left') {
        top = rect.top + rect.height / 2;
        left = rect.left - 12;
      } else if (side === 'top') {
        top = rect.top - 8;
        left = rect.left + rect.width / 2;
      } else if (side === 'bottom') {
        top = rect.bottom + 8;
        left = rect.left + rect.width / 2;
      }

      setCoords({ top, left });
    }
  };

  useEffect(() => {
    if (isVisible) {
      updatePosition();
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true);
    }
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isVisible]);

  const positionTransforms = {
    right: '-translate-y-1/2',
    left: '-translate-x-full -translate-y-1/2',
    top: '-translate-x-1/2 -translate-y-full',
    bottom: '-translate-x-1/2',
  };

  return (
    <>
      <div
        ref={triggerRef}
        className={`relative inline-flex ${className}`}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      {createPortal(
        <AnimatePresence>
          {isVisible && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              style={{
                position: 'fixed',
                top: coords.top,
                left: coords.left,
                zIndex: 9999,
              }}
              className={`pointer-events-none transform whitespace-nowrap rounded-lg bg-charcoal-950 px-3 py-1.5 font-heading text-xs font-medium text-white shadow-lg ${positionTransforms[side]}`}
            >
              {label}
              <div
                className={`absolute h-2 w-2 rotate-45 bg-charcoal-950 ${
                  side === 'right'
                    ? '-left-1 top-1/2 -translate-y-1/2'
                    : side === 'left'
                      ? '-right-1 top-1/2 -translate-y-1/2'
                      : side === 'bottom'
                        ? '-top-1 left-1/2 -translate-x-1/2'
                        : '-bottom-1 left-1/2 -translate-x-1/2'
                }`}
              />
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

export default Tooltip;
