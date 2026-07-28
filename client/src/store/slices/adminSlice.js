import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  getPlatformStats as getPlatformStatsApi,
  getUserGrowth as getUserGrowthApi,
  getAttentionItems as getAttentionItemsApi,
  getAdminUsers as getAdminUsersApi,
  getAdminProperties as getAdminPropertiesApi,
  getAdminTickets as getAdminTicketsApi,
  deactivateUser as deactivateUserApi,
  reactivateUser as reactivateUserApi,
} from '@services/admin.api';

const extractError = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

export const fetchPlatformStats = createAsyncThunk(
  'admin/fetchPlatformStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getPlatformStatsApi();
      return response.data || response;
    } catch (error) {
      return rejectWithValue(extractError(error, 'Failed to load platform stats'));
    }
  }
);

export const fetchUserGrowth = createAsyncThunk(
  'admin/fetchUserGrowth',
  async (days = 30, { rejectWithValue }) => {
    try {
      const response = await getUserGrowthApi(days);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(extractError(error, 'Failed to load user growth'));
    }
  }
);

export const fetchAttentionItems = createAsyncThunk(
  'admin/fetchAttentionItems',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAttentionItemsApi();
      return response.data || response;
    } catch (error) {
      return rejectWithValue(extractError(error, 'Failed to load attention items'));
    }
  }
);

export const fetchAdminUsers = createAsyncThunk(
  'admin/fetchAdminUsers',
  async (params, { rejectWithValue }) => {
    try {
      const response = await getAdminUsersApi(params);
      return response;
    } catch (error) {
      return rejectWithValue(extractError(error, 'Failed to load users'));
    }
  }
);

export const fetchAdminProperties = createAsyncThunk(
  'admin/fetchAdminProperties',
  async (params, { rejectWithValue }) => {
    try {
      const response = await getAdminPropertiesApi(params);
      return response;
    } catch (error) {
      return rejectWithValue(extractError(error, 'Failed to load properties'));
    }
  }
);

export const fetchAdminTickets = createAsyncThunk(
  'admin/fetchAdminTickets',
  async (params, { rejectWithValue }) => {
    try {
      const response = await getAdminTicketsApi(params);
      return response;
    } catch (error) {
      return rejectWithValue(extractError(error, 'Failed to load tickets'));
    }
  }
);

export const deactivateUserThunk = createAsyncThunk(
  'admin/deactivateUser',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await deactivateUserApi(userId);
      return response;
    } catch (error) {
      return rejectWithValue(extractError(error, 'Failed to deactivate user'));
    }
  }
);

export const reactivateUserThunk = createAsyncThunk(
  'admin/reactivateUser',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await reactivateUserApi(userId);
      return response;
    } catch (error) {
      return rejectWithValue(extractError(error, 'Failed to reactivate user'));
    }
  }
);

const initialState = {
  platformStats: null,
  userGrowth: null,
  attentionItems: null,
  users: null,
  properties: null,
  tickets: null,
  isLoading: false,
  usersLoading: false,
  propertiesLoading: false,
  ticketsLoading: false,
  error: null,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlatformStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPlatformStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.platformStats = action.payload;
      })
      .addCase(fetchPlatformStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchUserGrowth.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserGrowth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userGrowth = action.payload;
      })
      .addCase(fetchUserGrowth.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchAttentionItems.fulfilled, (state, action) => {
        state.attentionItems = action.payload;
      })
      .addCase(fetchAdminUsers.pending, (state) => {
        state.usersLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminUsers.fulfilled, (state, action) => {
        state.usersLoading = false;
        state.users = action.payload;
      })
      .addCase(fetchAdminUsers.rejected, (state, action) => {
        state.usersLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchAdminProperties.pending, (state) => {
        state.propertiesLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminProperties.fulfilled, (state, action) => {
        state.propertiesLoading = false;
        state.properties = action.payload;
      })
      .addCase(fetchAdminProperties.rejected, (state, action) => {
        state.propertiesLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchAdminTickets.pending, (state) => {
        state.ticketsLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminTickets.fulfilled, (state, action) => {
        state.ticketsLoading = false;
        state.tickets = action.payload;
      })
      .addCase(fetchAdminTickets.rejected, (state, action) => {
        state.ticketsLoading = false;
        state.error = action.payload;
      });
  },
});

export default adminSlice.reducer;
