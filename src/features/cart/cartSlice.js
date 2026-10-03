import { createSlice } from '@reduxjs/toolkit';
import { storage } from '../../shared/utils/storage.js';

const LEGACY_CART_KEY = 'sneakertown_cart';
const CART_KEY_PREFIX = 'sneakertown_cart_v2';
const cartStorageKey = (uid) => `${CART_KEY_PREFIX}:${uid || 'guest'}`;
const loadCartItems = (uid) => storage.get(cartStorageKey(uid), uid ? [] : storage.get(LEGACY_CART_KEY, []));
const initialOwnerUid = null;
const initialItems = loadCartItems(initialOwnerUid);
const calculate = (items) => ({
  totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
  totalPrice: items.reduce((sum, item) => sum + Number(item.retailPrice || 0) * item.quantity, 0),
});
const persist = (ownerUid, items) => storage.set(cartStorageKey(ownerUid), items);

const cartKey = (id, size) => `${id}__${size}`;

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    ownerUid: initialOwnerUid,
    items: initialItems,
    ...calculate(initialItems),
  },
  reducers: {
    setCartOwner(state, action) {
      state.ownerUid = action.payload || null;
      state.items = loadCartItems(state.ownerUid);
      Object.assign(state, calculate(state.items));
    },
    setCartItems(state, action) {
      state.items = action.payload;
      Object.assign(state, calculate(state.items));
      persist(state.ownerUid, state.items);
    },
    addToCart(state, action) {
      const { selectedSize, ...sneaker } = action.payload;
      const key = cartKey(sneaker.id, selectedSize);
      const existing = state.items.find((entry) => entry.cartKey === key);
      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push({ ...sneaker, selectedSize, cartKey: key, quantity: 1 });
      }
      Object.assign(state, calculate(state.items));
      persist(state.ownerUid, state.items);
    },
    removeFromCart(state, action) {
      state.items = state.items.filter((item) => item.cartKey !== action.payload);
      Object.assign(state, calculate(state.items));
      persist(state.ownerUid, state.items);
    },
    increaseQuantity(state, action) {
      const item = state.items.find((entry) => entry.cartKey === action.payload);
      if (item) item.quantity += 1;
      Object.assign(state, calculate(state.items));
      persist(state.ownerUid, state.items);
    },
    decreaseQuantity(state, action) {
      const item = state.items.find((entry) => entry.cartKey === action.payload);
      if (item && item.quantity > 1) item.quantity -= 1;
      else state.items = state.items.filter((entry) => entry.cartKey !== action.payload);
      Object.assign(state, calculate(state.items));
      persist(state.ownerUid, state.items);
    },
    clearCart(state) {
      state.items = [];
      Object.assign(state, calculate(state.items));
      persist(state.ownerUid, state.items);
    },
    clearGuestCartStorage() {
      storage.remove(cartStorageKey(null));
      storage.remove(LEGACY_CART_KEY);
    },
  },
});

export const { setCartOwner, setCartItems, addToCart, removeFromCart, increaseQuantity, decreaseQuantity, clearCart, clearGuestCartStorage } = cartSlice.actions;
export default cartSlice.reducer;
