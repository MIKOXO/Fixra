import { useEffect, useRef } from 'react';

const useAutoClearErrors = (errors, clearErrors, timeout = 7000) => {
  const timersRef = useRef({});

  useEffect(() => {
    Object.keys(errors).forEach((field) => {
      if (errors[field] && !timersRef.current[field]) {
        timersRef.current[field] = setTimeout(() => {
          clearErrors(field);
          delete timersRef.current[field];
        }, timeout);
      }
    });

    return () => {
      Object.values(timersRef.current).forEach(clearTimeout);
      timersRef.current = {};
    };
  }, [errors, clearErrors, timeout]);
};

export default useAutoClearErrors;
