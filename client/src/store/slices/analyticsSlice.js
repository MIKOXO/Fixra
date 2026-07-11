import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  getResolutionTime as getResolutionTimeApi,
  getTechnicianPerformance as getTechnicianPerformanceApi,
  getCostPerProperty as getCostPerPropertyApi,
  getMaintenanceFrequency as getMaintenanceFrequencyApi,
} from '@services/analytics.api';

export const fetchLandlordStats = createAsyncThunk(
  'analytics/fetchLandlordStats',
  async (params, { rejectWithValue }) => {
    try {
      const [resolutionTime, technicianPerformance, costPerProperty, maintenanceFrequency] =
        await Promise.all([
          getResolutionTimeApi(params),
          getTechnicianPerformanceApi(params),
          getCostPerPropertyApi(params),
          getMaintenanceFrequencyApi(params),
        ]);
      return {
        resolutionTime: resolutionTime.data,
        technicianPerformance: technicianPerformance.data,
        costPerProperty: costPerProperty.data,
        maintenanceFrequency: maintenanceFrequency.data,
      };
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error?.message || 'Failed to load analytics');
    }
  }
);

const initialState = {
  resolutionTime: null,
  technicianPerformance: null,
  costPerProperty: null,
  maintenanceFrequency: null,
  isLoading: false,
  error: null,
};

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLandlordStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLandlordStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.resolutionTime = action.payload.resolutionTime;
        state.technicianPerformance = action.payload.technicianPerformance;
        state.costPerProperty = action.payload.costPerProperty;
        state.maintenanceFrequency = action.payload.maintenanceFrequency;
      })
      .addCase(fetchLandlordStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export default analyticsSlice.reducer;