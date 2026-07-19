import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getTickets as getTicketsApi } from '@services/ticket.api';
import {
  createEstimate as createEstimateApi,
  dispatchTechnician as dispatchTechnicianApi,
} from '@services/job.api';
import { getTechnicians as getTechniciansApi } from '@services/contractor.api';

export const fetchContractorJobs = createAsyncThunk(
  'jobs/fetchContractorJobs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getTicketsApi();
      return response.tickets || response.data || response;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error?.message || 'Failed to load jobs');
    }
  }
);

export const createEstimate = createAsyncThunk(
  'jobs/createEstimate',
  async (data, { rejectWithValue }) => {
    try {
      const response = await createEstimateApi(data);
      return response.job || response.data || response;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error?.message || 'Failed to submit estimate');
    }
  }
);

export const dispatchTechnician = createAsyncThunk(
  'jobs/dispatchTechnician',
  async ({ jobId, technicianId }, { rejectWithValue }) => {
    try {
      const response = await dispatchTechnicianApi(jobId, { technicianId });
      return response.job || response.data || response;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error?.message || 'Failed to dispatch technician');
    }
  }
);

export const fetchTechnicians = createAsyncThunk(
  'jobs/fetchTechnicians',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getTechniciansApi();
      return response.technicians || response.data || response;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error?.message || 'Failed to load technicians');
    }
  }
);

const initialState = {
  jobs: [],
  technicians: [],
  isLoading: false,
  error: null,
  techniciansLoading: false,
  estimateSubmitting: false,
  dispatchSubmitting: false,
};

const jobSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    clearJobError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchContractorJobs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchContractorJobs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.jobs = action.payload;
      })
      .addCase(fetchContractorJobs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(createEstimate.pending, (state) => {
        state.estimateSubmitting = true;
        state.error = null;
      })
      .addCase(createEstimate.fulfilled, (state) => {
        state.estimateSubmitting = false;
      })
      .addCase(createEstimate.rejected, (state, action) => {
        state.estimateSubmitting = false;
        state.error = action.payload;
      })
      .addCase(dispatchTechnician.pending, (state) => {
        state.dispatchSubmitting = true;
        state.error = null;
      })
      .addCase(dispatchTechnician.fulfilled, (state) => {
        state.dispatchSubmitting = false;
      })
      .addCase(dispatchTechnician.rejected, (state, action) => {
        state.dispatchSubmitting = false;
        state.error = action.payload;
      })
      .addCase(fetchTechnicians.pending, (state) => {
        state.techniciansLoading = true;
      })
      .addCase(fetchTechnicians.fulfilled, (state, action) => {
        state.techniciansLoading = false;
        state.technicians = action.payload;
      })
      .addCase(fetchTechnicians.rejected, (state, action) => {
        state.techniciansLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearJobError } = jobSlice.actions;
export default jobSlice.reducer;
