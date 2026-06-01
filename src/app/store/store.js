import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../../shared/services/authSlice.js';
import sneakersReducer from '../../features/sneakers/sneakersSlice.js';
import cartReducer from '../../features/cart/cartSlice.js';
import favoritesReducer from '../../features/favorites/favoritesSlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    sneakers: sneakersReducer,
    cart: cartReducer,
    favorites: favoritesReducer,
  },
});
