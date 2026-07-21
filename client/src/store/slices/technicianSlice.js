import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getTechnicians, updateTechnicianAvailability as updateAvailabilityApi, deactivateTechnician } from '@services/contractor.api';
import { generateInvite } from '@services/invite.api';

export const fetchTechnicians = createAsyncThunk(
  'technicians/fetchTechnicians',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getTechnicians();
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error?.message || 'Failed to load technicians');
    }
  }
);

export const inviteTechnician = createAsyncThunk(
  'technicians/inviteTechnician',
  async (payload, { rejectWithValue }) => {
    try {
      return await generateInvite(payload);
    } catch (error) {
      return rejectWithValue(error?.message || 'Failed to generate invite');
    }
  }
);

export const toggleAvailability = createAsyncThunk(
  'technicians/toggleAvailability',
  async ({ id, isAvailable }, { rejectWithValue }) => {
    try {
      const response = await updateAvailabilityApi(id, isAvailable);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error?.message || 'Failed to update availability');
    }
  }
);

export const removeTechnician = createAsyncThunk(
  'technicians/removeTechnician',
  async (id, { rejectWithValue }) => {
    try {
      await deactivateTechnician(id);
      return id;
    } catch (error) {
      return rejectWithValue(error?.message || 'Failed to remove technician');
    }
  }
);

const technicianSlice = createSlice({
  name: 'technicians',
  initialState: {
    technicians: [],
    isLoading: false,
    error: null,
    operationLoading: false,
  },
  reducers: {
    clearTechnicianError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTechnicians.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTechnicians.fulfilled, (state, action) => {
        state.isLoading = false;
        state.technicians = action.payload;
      })
      .addCase(fetchTechnicians.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(toggleAvailability.fulfilled, (state, action) => {
        const updated = action.payload;
        const id = updated._id || updated.id;
        const idx = state.technicians.findIndex((t) => (t._id || t.id) === id);
        if (idx !== -1) state.technicians[idx] = updated;
      })
      .addCase(removeTechnician.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
      })
      .addCase(removeTechnician.fulfilled, (state, action) => {
        state.operationLoading = false;
        state.technicians = state.technicians.filter((t) => (t._id || t.id) !== action.payload);
      })
      .addCase(removeTechnician.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearTechnicianError } = technicianSlice.actions;
export default technicianSlice.reducer;
