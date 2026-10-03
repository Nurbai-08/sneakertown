import { createSlice } from '@reduxjs/toolkit';
import { storage } from '../../shared/utils/storage.js';

const LEGACY_FAVORITES_KEY = 'sneakertown_favorites';
const FAVORITES_KEY_PREFIX = 'sneakertown_favorites_v2';
const favoritesStorageKey = (uid) => `${FAVORITES_KEY_PREFIX}:${uid || 'guest'}`;
const loadFavorites = (uid) => storage.get(favoritesStorageKey(uid), uid ? [] : storage.get(LEGACY_FAVORITES_KEY, []));
const initialOwnerUid = null;
const initialFavorites = loadFavorites(initialOwnerUid);
const persist = (ownerUid, items) => storage.set(favoritesStorageKey(ownerUid), items);

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState: {
    ownerUid: initialOwnerUid,
    favorites: initialFavorites,
  },
  reducers: {
    setFavoritesOwner(state, action) {
      state.ownerUid = action.payload || null;
      state.favorites = loadFavorites(state.ownerUid);
    },
    setFavorites(state, action) {
      state.favorites = action.payload;
      persist(state.ownerUid, state.favorites);
    },
    addFavorite(state, action) {
      if (!state.favorites.some((item) => item.id === action.payload.id)) {
        state.favorites.push(action.payload);
      }
      persist(state.ownerUid, state.favorites);
    },
    removeFavorite(state, action) {
      state.favorites = state.favorites.filter((item) => item.id !== action.payload);
      persist(state.ownerUid, state.favorites);
    },
    clearFavorites(state) {
      state.favorites = [];
      persist(state.ownerUid, state.favorites);
    },
    clearGuestFavoritesStorage() {
      storage.remove(favoritesStorageKey(null));
      storage.remove(LEGACY_FAVORITES_KEY);
    },
  },
});

export const { setFavoritesOwner, setFavorites, addFavorite, removeFavorite, clearFavorites, clearGuestFavoritesStorage } = favoritesSlice.actions;
export default favoritesSlice.reducer;
