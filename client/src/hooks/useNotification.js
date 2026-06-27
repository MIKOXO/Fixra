import { useCallback, useEffect, useRef, useState } from 'react';
import { ERROR_TIMEOUT, SUCCESS_TIMEOUT, getUserFriendlyError } from '@utils/notificationUtils';

const clearTimer = (ref) => {
  if (ref.current) {
    clearTimeout(ref.current);
    ref.current = null;
  }
};

const useNotification = (rawError, { errorTimeout = ERROR_TIMEOUT, successTimeout = SUCCESS_TIMEOUT, onErrorDismiss } = {}) => {
  const [notification, setNotification] = useState(null);
  const timerRef = useRef(null);

  const dismiss = useCallback(() => {
    clearTimer(timerRef);
    setNotification(null);
    if (onErrorDismiss) onErrorDismiss();
  }, [onErrorDismiss]);

  useEffect(() => {
    clearTimer(timerRef);
    if (rawError) {
      const friendly = getUserFriendlyError(rawError);
      setNotification({ type: 'error', message: friendly });
      timerRef.current = setTimeout(() => {
        setNotification(null);
        if (onErrorDismiss) onErrorDismiss();
      }, errorTimeout);
    } else {
      setNotification(null);
    }
    return () => clearTimer(timerRef);
  }, [rawError, errorTimeout, onErrorDismiss]);

  useEffect(() => () => clearTimer(timerRef), []);

  const showSuccess = useCallback((message) => {
    clearTimer(timerRef);
    setNotification({ type: 'success', message });
    timerRef.current = setTimeout(() => setNotification(null), successTimeout);
  }, [successTimeout]);

  return { notification, dismiss, showSuccess };
};

export default useNotification;
