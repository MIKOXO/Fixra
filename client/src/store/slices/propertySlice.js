import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getProperties as getPropertiesApi } from '@services/property.api';

export const fetchProperties = createAsyncThunk(
  'properties/fetchProperties',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getPropertiesApi();
      return response.properties || response.data || response;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error?.message || 'Failed to load properties');
    }
  }
);

const initialState = {
  properties: [],
  isLoading: false,
  error: null,
};

const propertySlice = createSlice({
  name: 'properties',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProperties.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProperties.fulfilled, (state, action) => {
        state.isLoading = false;
        state.properties = action.payload;
      })
      .addCase(fetchProperties.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export default propertySlice.reducer;