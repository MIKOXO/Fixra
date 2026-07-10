import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  getTickets as getTicketsApi,
  getTicketById as getTicketByIdApi,
  transitionStatus as transitionStatusApi,
  addNote as addNoteApi,
} from '@services/ticket.api';

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

export const fetchTicketById = createAsyncThunk(
  'tickets/fetchTicketById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await getTicketByIdApi(id);
      return response.ticket || response.data || response;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error?.message || 'Failed to load ticket');
    }
  }
);

export const transitionTicketStatus = createAsyncThunk(
  'tickets/transitionTicketStatus',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await transitionStatusApi(id, data);
      return { id, ticket: response.ticket || response.data || response };
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error?.message || 'Failed to update status');
    }
  }
);

export const addTicketNote = createAsyncThunk(
  'tickets/addTicketNote',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await addNoteApi(id, data);
      return { id, note: response.note || response.data || response };
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error?.message || 'Failed to add note');
    }
  }
);

const initialState = {
  tickets: [],
  isLoading: false,
  error: null,
  currentTicket: null,
  currentTicketLoading: false,
  currentTicketError: null,
  operationLoading: false,
};

const ticketSlice = createSlice({
  name: 'tickets',
  initialState,
  reducers: {
    clearTicketError(state) {
      state.error = null;
      state.currentTicketError = null;
    },
    clearCurrentTicket(state) {
      state.currentTicket = null;
      state.currentTicketError = null;
    },
  },
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
      })
      .addCase(fetchTicketById.pending, (state) => {
        state.currentTicketLoading = true;
        state.currentTicketError = null;
      })
      .addCase(fetchTicketById.fulfilled, (state, action) => {
        state.currentTicketLoading = false;
        state.currentTicket = action.payload;
      })
      .addCase(fetchTicketById.rejected, (state, action) => {
        state.currentTicketLoading = false;
        state.currentTicketError = action.payload;
      })
      .addCase(transitionTicketStatus.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
      })
      .addCase(transitionTicketStatus.fulfilled, (state, action) => {
        state.operationLoading = false;
        const { id, ticket } = action.payload;
        const idx = state.tickets.findIndex((t) => (t._id || t.id) === id);
        if (idx !== -1) state.tickets[idx] = ticket;
        if (state.currentTicket && (state.currentTicket._id || state.currentTicket.id) === id) {
          state.currentTicket = ticket;
        }
      })
      .addCase(transitionTicketStatus.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload;
      })
      .addCase(addTicketNote.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
      })
      .addCase(addTicketNote.fulfilled, (state, action) => {
        state.operationLoading = false;
        const { note } = action.payload;
        if (state.currentTicket) {
          if (!state.currentTicket.notes) state.currentTicket.notes = [];
          state.currentTicket.notes.push(note);
        }
      })
      .addCase(addTicketNote.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearTicketError, clearCurrentTicket } = ticketSlice.actions;
export default ticketSlice.reducer;