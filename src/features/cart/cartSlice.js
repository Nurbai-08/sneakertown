import { createSlice } from '@reduxjs/toolkit';
import { storage } from '../../shared/utils/storage.js';

const CART_KEY = 'sneakertown_cart';
const initialItems = storage.get(CART_KEY, []);
const calculate = (items) => ({
  totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
  totalPrice: items.reduce((sum, item) => sum + Number(item.retailPrice || 0) * item.quantity, 0),
});
const persist = (items) => storage.set(CART_KEY, items);

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: initialItems,
    ...calculate(initialItems),
  },
  reducers: {
    setCartItems(state, action) {
      state.items = action.payload;
      Object.assign(state, calculate(state.items));
      persist(state.items);
    },
    addToCart(state, action) {
      const item = state.items.find((entry) => entry.id === action.payload.id);
      if (item) item.quantity += 1;
      else state.items.push({ ...action.payload, quantity: 1 });
      Object.assign(state, calculate(state.items));
      persist(state.items);
    },
    removeFromCart(state, action) {
      state.items = state.items.filter((item) => item.id !== action.payload);
      Object.assign(state, calculate(state.items));
      persist(state.items);
    },
    increaseQuantity(state, action) {
      const item = state.items.find((entry) => entry.id === action.payload);
      if (item) item.quantity += 1;
      Object.assign(state, calculate(state.items));
      persist(state.items);
    },
    decreaseQuantity(state, action) {
      const item = state.items.find((entry) => entry.id === action.payload);
      if (item && item.quantity > 1) item.quantity -= 1;
      else state.items = state.items.filter((entry) => entry.id !== action.payload);
      Object.assign(state, calculate(state.items));
      persist(state.items);
    },
    clearCart(state) {
      state.items = [];
      Object.assign(state, calculate(state.items));
      persist(state.items);
    },
  },
});

export const { setCartItems, addToCart, removeFromCart, increaseQuantity, decreaseQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
