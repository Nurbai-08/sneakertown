import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { sneakersApi } from '../../shared/services/sneakersApi.js';

export const getSneakers = createAsyncThunk('sneakers/getSneakers', async (_, { getState, rejectWithValue }) => {
  try {
    const { search, filters, sort, page } = getState().sneakers;
    const params = {
      limit: 24,
      page,
      sort,
      ...(search ? { name: search } : {}),
      ...(filters.brand ? { brand: filters.brand } : {}),
      ...(filters.releaseDate ? { releaseDate: filters.releaseDate } : {}),
      ...(filters.minPrice ? { minPrice: filters.minPrice } : {}),
      ...(filters.maxPrice ? { maxPrice: filters.maxPrice } : {}),
    };
    return sneakersApi.getSneakers(params);
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const getSneakerById = createAsyncThunk('sneakers/getSneakerById', async (id, { rejectWithValue }) => {
  try {
    return await sneakersApi.getSneakerById(id);
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const searchSneakers = createAsyncThunk('sneakers/searchSneakers', async (query, { dispatch }) => {
  dispatch(setSearch(query));
  return dispatch(getSneakers()).unwrap();
});

export const filterSneakers = createAsyncThunk('sneakers/filterSneakers', async (filters, { dispatch }) => {
  dispatch(setFilters(filters));
  return dispatch(getSneakers()).unwrap();
});

const sneakersSlice = createSlice({
  name: 'sneakers',
  initialState: {
    sneakers: [],
    selectedSneaker: null,
    loading: false,
    error: null,
    search: '',
    filters: {
      brand: '',
      minPrice: '',
      maxPrice: '',
      releaseDate: '',
    },
    sort: 'releaseDate:desc',
    page: 1,
    total: 0,
  },
  reducers: {
    setSearch(state, action) {
      state.search = action.payload;
      state.page = 1;
    },
    setFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
      state.page = 1;
    },
    setSort(state, action) {
      state.sort = action.payload;
      state.page = 1;
    },
    setPage(state, action) {
      state.page = action.payload;
    },
    clearFilters(state) {
      state.filters = { brand: '', minPrice: '', maxPrice: '', releaseDate: '' };
      state.search = '';
      state.page = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getSneakers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSneakers.fulfilled, (state, action) => {
        state.loading = false;
        state.sneakers = action.payload.sneakers;
        state.total = action.payload.total;
      })
      .addCase(getSneakers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Не удалось загрузить кроссовки';
      })
      .addCase(getSneakerById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.selectedSneaker = null;
      })
      .addCase(getSneakerById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedSneaker = action.payload;
      })
      .addCase(getSneakerById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Товар не найден';
      });
  },
});

export const { setSearch, setFilters, setSort, setPage, clearFilters } = sneakersSlice.actions;
export default sneakersSlice.reducer;
