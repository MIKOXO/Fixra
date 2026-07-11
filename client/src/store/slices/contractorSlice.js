import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getContractors as getContractorsApi, revokeContractor as revokeContractorApi } from '@services/contractor.api';
import { generateInvite as generateInviteApi } from '@services/invite.api';

export const fetchContractors = createAsyncThunk(
  'contractors/fetchContractors',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getContractorsApi();
      return response.data || response.contractors || response;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error?.message || 'Failed to load contractors');
    }
  }
);

export const inviteContractor = createAsyncThunk(
  'contractors/inviteContractor',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await generateInviteApi(payload);
      return response;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error?.message || 'Failed to generate invite');
    }
  }
);

export const revokeContractor = createAsyncThunk(
  'contractors/revokeContractor',
  async (linkId, { rejectWithValue }) => {
    try {
      await revokeContractorApi(linkId);
      return linkId;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error?.message || 'Failed to revoke contractor');
    }
  }
);

const initialState = {
  contractors: [],
  isLoading: false,
  error: null,
  operationLoading: false,
};

const contractorSlice = createSlice({
  name: 'contractors',
  initialState,
  reducers: {
    clearContractorError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchContractors.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchContractors.fulfilled, (state, action) => {
        state.isLoading = false;
        state.contractors = action.payload;
      })
      .addCase(fetchContractors.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(revokeContractor.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
      })
      .addCase(revokeContractor.fulfilled, (state, action) => {
        state.operationLoading = false;
        state.contractors = state.contractors.filter((c) => (c._id || c.id) !== action.payload);
      })
      .addCase(revokeContractor.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearContractorError } = contractorSlice.actions;
export default contractorSlice.reducer;