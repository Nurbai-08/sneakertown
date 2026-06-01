import { createSlice } from '@reduxjs/toolkit';
import { storage } from '../../shared/utils/storage.js';

const FAVORITES_KEY = 'sneakertown_favorites';
const initialFavorites = storage.get(FAVORITES_KEY, []);
const persist = (items) => storage.set(FAVORITES_KEY, items);

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState: {
    favorites: initialFavorites,
  },
  reducers: {
    setFavorites(state, action) {
      state.favorites = action.payload;
      persist(state.favorites);
    },
    addFavorite(state, action) {
      if (!state.favorites.some((item) => item.id === action.payload.id)) {
        state.favorites.push(action.payload);
      }
      persist(state.favorites);
    },
    removeFavorite(state, action) {
      state.favorites = state.favorites.filter((item) => item.id !== action.payload);
      persist(state.favorites);
    },
    clearFavorites(state) {
      state.favorites = [];
      persist(state.favorites);
    },
  },
});

export const { setFavorites, addFavorite, removeFavorite, clearFavorites } = favoritesSlice.actions;
export default favoritesSlice.reducer;
