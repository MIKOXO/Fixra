import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  getProperties as getPropertiesApi,
  createProperty as createPropertyApi,
  updateProperty as updatePropertyApi,
  deleteProperty as deletePropertyApi,
  addUnit as addUnitApi,
} from '@services/property.api';

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

export const createProperty = createAsyncThunk(
  'properties/createProperty',
  async (data, { rejectWithValue }) => {
    try {
      const response = await createPropertyApi(data);
      return response.property;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error?.message || 'Failed to create property');
    }
  }
);

export const updateProperty = createAsyncThunk(
  'properties/updateProperty',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await updatePropertyApi(id, data);
      return response.property;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error?.message || 'Failed to update property');
    }
  }
);

export const deleteProperty = createAsyncThunk(
  'properties/deleteProperty',
  async (id, { rejectWithValue }) => {
    try {
      await deletePropertyApi(id);
      return id;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error?.message || 'Failed to delete property');
    }
  }
);

export const addUnit = createAsyncThunk(
  'properties/addUnit',
  async ({ propertyId, data }, { rejectWithValue }) => {
    try {
      const response = await addUnitApi(propertyId, data);
      return response.property;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error?.message || 'Failed to add unit');
    }
  }
);

const initialState = {
  properties: [],
  isLoading: false,
  error: null,
  operationLoading: false,
};

const propertySlice = createSlice({
  name: 'properties',
  initialState,
  reducers: {
    clearPropertyError(state) {
      state.error = null;
    },
  },
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
      })
      .addCase(createProperty.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
      })
      .addCase(createProperty.fulfilled, (state, action) => {
        state.operationLoading = false;
        state.properties.unshift(action.payload);
      })
      .addCase(createProperty.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload;
      })
      .addCase(updateProperty.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
      })
      .addCase(updateProperty.fulfilled, (state, action) => {
        state.operationLoading = false;
        const idx = state.properties.findIndex((p) => (p._id || p.id) === (action.payload._id || action.payload.id));
        if (idx !== -1) state.properties[idx] = action.payload;
      })
      .addCase(updateProperty.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload;
      })
      .addCase(deleteProperty.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
      })
      .addCase(deleteProperty.fulfilled, (state, action) => {
        state.operationLoading = false;
        state.properties = state.properties.filter(
          (p) => (p._id || p.id) !== action.payload
        );
      })
      .addCase(deleteProperty.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload;
      })
      .addCase(addUnit.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
      })
      .addCase(addUnit.fulfilled, (state, action) => {
        state.operationLoading = false;
        const idx = state.properties.findIndex((p) => (p._id || p.id) === (action.payload._id || action.payload.id));
        if (idx !== -1) state.properties[idx] = action.payload;
      })
      .addCase(addUnit.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearPropertyError } = propertySlice.actions;
export default propertySlice.reducer;