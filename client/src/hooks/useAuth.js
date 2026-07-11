import { useMemo } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import {
  changePassword as changePasswordThunk,
  clearAuthError,
  deleteAccount as deleteAccountThunk,
  fetchCurrentUser as fetchCurrentUserThunk,
  login as loginThunk,
  logout as logoutThunk,
  registerLandlord as registerLandlordThunk,
  registerWithInvite as registerWithInviteThunk,
  verifyEmail as verifyEmailThunk,
  resendVerification as resendVerificationThunk,
  requestPasswordReset as requestPasswordResetThunk,
  verifyResetCode as verifyResetCodeThunk,
  resetPassword as resetPasswordThunk,
} from '@store/slices/authSlice';

const useAuth = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, isLoading, error } = useSelector((state) => state.auth, shallowEqual);

  const actions = useMemo(
    () => ({
      changePassword: (data) => dispatch(changePasswordThunk(data)),
      clearError: () => dispatch(clearAuthError()),
      deleteAccount: () => dispatch(deleteAccountThunk()),
      login: (credentials) => dispatch(loginThunk(credentials)),
      registerLandlord: (data) => dispatch(registerLandlordThunk(data)),
      registerWithInvite: (payload) => dispatch(registerWithInviteThunk(payload)),
      logout: () => dispatch(logoutThunk()),
      fetchCurrentUser: () => dispatch(fetchCurrentUserThunk()),
      verifyEmail: (payload) => dispatch(verifyEmailThunk(payload)),
      resendVerification: (email) => dispatch(resendVerificationThunk(email)),
      requestPasswordReset: (email) => dispatch(requestPasswordResetThunk(email)),
      verifyResetCode: (payload) => dispatch(verifyResetCodeThunk(payload)),
      resetPassword: (payload) => dispatch(resetPasswordThunk(payload)),
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
