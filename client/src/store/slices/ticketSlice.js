import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getTickets as getTicketsApi } from '@services/ticket.api';

export const fetchTickets = createAsyncThunk(
  'tickets/fetchTickets',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getTicketsApi();
      return response.tickets || response.data || response;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error?.message || 'Failed to load tickets');
    }
  }
);

const initialState = {
  tickets: [],
  isLoading: false,
  error: null,
};

const ticketSlice = createSlice({
  name: 'tickets',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTickets.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTickets.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tickets = action.payload;
      })
      .addCase(fetchTickets.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export default ticketSlice.reducer;