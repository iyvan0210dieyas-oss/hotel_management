import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// ─── Async Thunks ────────────────────────────────────────────────────────────

/**
 * Fetch paginated hotels from backend with search + price filter support.
 */
export const fetchHotels = createAsyncThunk(
  'hotels/fetchHotels',
  async ({ search = '', minPrice = '', maxPrice = '', page = 1, limit = 6 } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (search && search.trim()) params.set('search', search.trim());
      if (minPrice !== '' && minPrice !== null && minPrice !== undefined) params.set('minPrice', minPrice);
      if (maxPrice !== '' && maxPrice !== null && maxPrice !== undefined) params.set('maxPrice', maxPrice);
      params.set('page', page);
      params.set('limit', limit);

      const response = await api.get(`/api/hotels?${params.toString()}`);
      return response.data; // { success, data, pagination }
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch hotels');
    }
  }
);

/**
 * Fetch a single hotel by ID.
 */
export const fetchHotelById = createAsyncThunk(
  'hotels/fetchHotelById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/hotels/${id}`);
      return response.data.data; // hotel object
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch hotel');
    }
  }
);

// Alias getHotelById -> fetchHotelById so any existing import works cleanly
export const getHotelById = fetchHotelById;

/**
 * Create a new hotel. Receives a FormData object or plain object.
 */
export const createHotel = createAsyncThunk(
  'hotels/createHotel',
  async (formData, { rejectWithValue }) => {
    try {
      const isFormData = typeof FormData !== 'undefined' && formData instanceof FormData;
      const response = await api.post('/api/hotels', formData, {
        headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
      });
      return response.data.data; // created hotel object
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to create hotel');
    }
  }
);

// Alias addHotel -> createHotel
export const addHotel = createHotel;

/**
 * Update a hotel. Receives { id, formData, ...rest }.
 */
export const updateHotel = createAsyncThunk(
  'hotels/updateHotel',
  async (payload, { rejectWithValue }) => {
    try {
      const id = payload.id;
      const dataToSend = payload.formData || payload;
      const isFormData = typeof FormData !== 'undefined' && dataToSend instanceof FormData;
      const response = await api.put(`/api/hotels/${id}`, dataToSend, {
        headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
      });
      return response.data.data; // updated hotel object
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update hotel');
    }
  }
);

/**
 * Delete a hotel by ID.
 */
export const deleteHotel = createAsyncThunk(
  'hotels/deleteHotel',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/hotels/${id}`);
      return id; // return deleted id for state removal
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to delete hotel');
    }
  }
);

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState = {
  hotels: [],
  selectedHotel: null,
  filters: {
    search: '',
    minPrice: '',
    maxPrice: '',
  },
  pagination: {
    page: 1,
    limit: 6,
    total: 0,
    totalPages: 1,
  },
  loading: false,
  error: null,
  successMessage: null,
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const hotelSlice = createSlice({
  name: 'hotels',
  initialState,
  reducers: {
    // Synchronous filter / pagination actions
    setFilterSearch: (state, action) => {
      state.filters.search = action.payload;
      state.pagination.page = 1;
    },
    setPriceFilter: (state, action) => {
      if (action.payload.minPrice !== undefined) state.filters.minPrice = action.payload.minPrice;
      if (action.payload.maxPrice !== undefined) state.filters.maxPrice = action.payload.maxPrice;
      state.pagination.page = 1;
    },
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    resetFilters: (state) => {
      state.filters.search = '';
      state.filters.minPrice = '';
      state.filters.maxPrice = '';
      state.pagination.page = 1;
    },
    clearSelectedHotel: (state) => {
      state.selectedHotel = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    // ── fetchHotels ──────────────────────────────
    builder
      .addCase(fetchHotels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHotels.fulfilled, (state, action) => {
        state.loading = false;
        state.hotels = action.payload.data || [];
        if (action.payload.pagination) {
          state.pagination.total = action.payload.pagination.total;
          state.pagination.totalPages = action.payload.pagination.totalPages;
          state.pagination.page = action.payload.pagination.page;
          state.pagination.limit = action.payload.pagination.limit;
        }
      })
      .addCase(fetchHotels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load hotels';
      });

    // ── fetchHotelById / getHotelById ─────────────
    builder
      .addCase(fetchHotelById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHotelById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedHotel = action.payload;
        // Also update in hotels array if present
        const idx = state.hotels.findIndex((h) => Number(h.id) === Number(action.payload?.id));
        if (idx !== -1) {
          state.hotels[idx] = action.payload;
        }
      })
      .addCase(fetchHotelById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load hotel';
        state.selectedHotel = null;
      });

    // ── createHotel / addHotel ────────────────────
    builder
      .addCase(createHotel.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createHotel.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = 'Hotel created successfully!';
        if (action.payload) {
          state.hotels.unshift(action.payload);
          state.pagination.total += 1;
        }
      })
      .addCase(createHotel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to create hotel';
      });

    // ── updateHotel ──────────────────────────────
    builder
      .addCase(updateHotel.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateHotel.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = 'Hotel updated successfully!';
        const updated = action.payload;
        if (updated) {
          const idx = state.hotels.findIndex((h) => Number(h.id) === Number(updated.id));
          if (idx !== -1) {
            state.hotels[idx] = updated;
          }
          if (state.selectedHotel && Number(state.selectedHotel.id) === Number(updated.id)) {
            state.selectedHotel = updated;
          }
        }
      })
      .addCase(updateHotel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update hotel';
      });

    // ── deleteHotel ──────────────────────────────
    builder
      .addCase(deleteHotel.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteHotel.fulfilled, (state, action) => {
        state.loading = false;
        const deletedId = Number(action.payload);
        state.hotels = state.hotels.filter((h) => Number(h.id) !== deletedId);
        if (state.selectedHotel && Number(state.selectedHotel.id) === deletedId) {
          state.selectedHotel = null;
        }
        if (state.pagination.total > 0) state.pagination.total -= 1;
      })
      .addCase(deleteHotel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to delete hotel';
      });
  },
});

export const {
  setFilterSearch,
  setPriceFilter,
  setPage,
  resetFilters,
  clearSelectedHotel,
  clearError,
  clearSuccessMessage,
} = hotelSlice.actions;

// Also export alias setFilterPrice for components that use that name
export const setFilterPrice = setPriceFilter;

export default hotelSlice.reducer;
