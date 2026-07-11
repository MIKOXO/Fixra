import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  changePassword as changePasswordApi,
  fetchCurrentUser as fetchCurrentUserApi,
  login as loginApi,
  logout as logoutApi,
  registerLandlord as registerLandlordApi,
  registerWithInvite as registerWithInviteApi,
  verifyEmail as verifyEmailApi,
  resendVerificationCode as resendVerificationApi,
  requestPasswordReset as requestPasswordResetApi,
  verifyResetCode as verifyResetCodeApi,
  resetPassword as resetPasswordApi,
} from '@services/auth.api';
import { deleteAccount as deleteAccountApi } from '@services/user.api';

const extractErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

const normalizeUser = (payload) => payload?.user || payload;

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const response = await loginApi(credentials);
    return normalizeUser(response);
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error, 'Unable to log in'));
  }
});

export const registerLandlord = createAsyncThunk(
  'auth/registerLandlord',
  async (data, { rejectWithValue }) => {
    try {
      const payload = {
        ...data,
      };

      delete payload.confirmPassword;

      const response = await registerLandlordApi(payload);
      return normalizeUser(response);
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Unable to register'));
    }
  }
);

export const registerWithInvite = createAsyncThunk(
  'auth/registerWithInvite',
  async ({ token, data }, { rejectWithValue }) => {
    try {
      const payload = {
        ...data,
      };

      delete payload.confirmPassword;

      const response = await registerWithInviteApi(payload, token);
      return normalizeUser(response);
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Unable to complete invite registration'));
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async (_payload, { rejectWithValue }) => {
  try {
    await logoutApi();
    return null;
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error, 'Unable to log out'));
  }
});

export const verifyEmail = createAsyncThunk('auth/verifyEmail', async ({ email, code }, { rejectWithValue }) => {
  try {
    const response = await verifyEmailApi(email, code);
    return normalizeUser(response);
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error, 'Unable to verify email'));
  }
});

export const resendVerification = createAsyncThunk(
  'auth/resendVerification',
  async (email, { rejectWithValue }) => {
    try {
      const data = await resendVerificationApi(email);
      return data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Unable to resend code'));
    }
  }
);

export const requestPasswordReset = createAsyncThunk(
  'auth/requestPasswordReset',
  async (email, { rejectWithValue }) => {
    try {
      const data = await requestPasswordResetApi(email);
      return data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Unable to request password reset'));
    }
  }
);

export const verifyResetCode = createAsyncThunk(
  'auth/verifyResetCode',
  async ({ email, code }, { rejectWithValue }) => {
    try {
      const data = await verifyResetCodeApi(email, code);
      return data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Unable to verify reset code'));
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ email, resetToken, newPassword }, { rejectWithValue }) => {
    try {
      const data = await resetPasswordApi(email, resetToken, newPassword);
      return data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Unable to reset password'));
    }
  }
);

export const changePassword = createAsyncThunk('auth/changePassword', async (data, { rejectWithValue }) => {
  try {
    const response = await changePasswordApi(data);
    return response;
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error, 'Unable to change password'));
  }
});

export const deleteAccount = createAsyncThunk('auth/deleteAccount', async (_payload, { rejectWithValue }) => {
  try {
    const response = await deleteAccountApi();
    return response;
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error, 'Unable to delete account'));
  }
});

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_payload, { rejectWithValue }) => {
    try {
      const response = await fetchCurrentUserApi();
      return normalizeUser(response);
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Unable to fetch the current user'));
    }
  }
);

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null;
    },
    resetAuthState() {
      return { ...initialState };
    },
  },
  extraReducers: (builder) => {
    const startLoading = (state) => {
      state.isLoading = true;
      state.error = null;
    };

    const fail = (state, action) => {
      state.isLoading = false;
      state.error = action.payload || action.error.message || 'Request failed';
    };

    const succeedWithUser = (state, action) => {
      state.isLoading = false;
      state.user = action.payload;
      state.isAuthenticated = true;
      state.error = null;
    };

    const succeedWithoutAuth = (state) => {
      state.isLoading = false;
      state.error = null;
    };

    builder
      .addCase(login.pending, startLoading)
      .addCase(login.fulfilled, succeedWithUser)
      .addCase(login.rejected, fail)
      .addCase(registerLandlord.pending, startLoading)
      .addCase(registerLandlord.fulfilled, succeedWithoutAuth)
      .addCase(registerLandlord.rejected, fail)
      .addCase(registerWithInvite.pending, startLoading)
      .addCase(registerWithInvite.fulfilled, succeedWithoutAuth)
      .addCase(registerWithInvite.rejected, fail)
      .addCase(verifyEmail.pending, startLoading)
      .addCase(verifyEmail.fulfilled, succeedWithUser)
      .addCase(verifyEmail.rejected, fail)
      .addCase(resendVerification.pending, (state) => {
        state.error = null;
      })
      .addCase(resendVerification.fulfilled, (state) => {
        state.error = null;
      })
      .addCase(resendVerification.rejected, fail)
      .addCase(requestPasswordReset.pending, (state) => {
        state.error = null;
      })
      .addCase(requestPasswordReset.fulfilled, (state) => {
        state.error = null;
      })
      .addCase(requestPasswordReset.rejected, fail)
      .addCase(verifyResetCode.pending, (state) => {
        state.error = null;
      })
      .addCase(verifyResetCode.fulfilled, (state) => {
        state.error = null;
      })
      .addCase(verifyResetCode.rejected, fail)
      .addCase(resetPassword.pending, startLoading)
      .addCase(resetPassword.fulfilled, succeedWithoutAuth)
      .addCase(resetPassword.rejected, fail)
      .addCase(changePassword.pending, (state) => {
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.error = null;
      })
      .addCase(changePassword.rejected, fail)
      .addCase(deleteAccount.pending, startLoading)
      .addCase(deleteAccount.fulfilled, () => ({ ...initialState }))
      .addCase(deleteAccount.rejected, fail)
      .addCase(fetchCurrentUser.pending, startLoading)
      .addCase(fetchCurrentUser.fulfilled, succeedWithUser)
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.payload || action.error.message || 'Request failed';
      })
      .addCase(logout.pending, startLoading)
      .addCase(logout.fulfilled, () => ({ ...initialState }))
      .addCase(logout.rejected, () => ({ ...initialState }));
  },
});

export const { clearAuthError, resetAuthState } = authSlice.actions;
export default authSlice.reducer;
