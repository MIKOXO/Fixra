import { useMemo } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import {
  clearAuthError,
  fetchCurrentUser as fetchCurrentUserThunk,
  login as loginThunk,
  logout as logoutThunk,
  registerLandlord as registerLandlordThunk,
  registerWithInvite as registerWithInviteThunk,
} from '@store/slices/authSlice';

const useAuth = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, isLoading, error } = useSelector((state) => state.auth, shallowEqual);

  const actions = useMemo(
    () => ({
      clearError: () => dispatch(clearAuthError()),
      login: (credentials) => dispatch(loginThunk(credentials)),
      registerLandlord: (data) => dispatch(registerLandlordThunk(data)),
      registerWithInvite: (payload) => dispatch(registerWithInviteThunk(payload)),
      logout: () => dispatch(logoutThunk()),
      fetchCurrentUser: () => dispatch(fetchCurrentUserThunk()),
    }),
    [dispatch]
  );

  return useMemo(
    () => ({
      user,
      isAuthenticated,
      isLoading,
      error,
      ...actions,
    }),
    [actions, error, isAuthenticated, isLoading, user]
  );
};

export default useAuth;
