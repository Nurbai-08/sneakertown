import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseEnabled, mapFirebaseError } from './firebase.js';
import { userDataService } from './userDataService.js';
import { mapFirebaseUser, mergeAuthUser } from '../../entities/user/model.js';

const AUTH_RATE_LIMIT_WINDOW = 2000;
const authThrottle = new Map();

const checkThrottle = (key) => {
  const now = Date.now();
  const last = authThrottle.get(key) || 0;
  if (now - last < AUTH_RATE_LIMIT_WINDOW) {
    throw new Error('auth/too-many-requests');
  }
  authThrottle.set(key, now);
  if (authThrottle.size > 100) {
    for (const [k, t] of authThrottle) {
      if (now - t > AUTH_RATE_LIMIT_WINDOW * 2) authThrottle.delete(k);
    }
  }
};

const requireFirebase = () => {
  if (!isFirebaseEnabled) {
    throw new Error('Firebase не настроен. Заполните переменные VITE_FIREBASE_* в .env');
  }
};

export const registerUser = createAsyncThunk('auth/registerUser', async ({ email, password, displayName }, { rejectWithValue }) => {
  try {
    requireFirebase();
    checkThrottle('register');
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    const name = displayName?.trim() || '';

    if (name) {
      await updateProfile(user, { displayName: name });
    }

    const currentUser = auth.currentUser ?? user;
    const mappedUser = {
      ...mapFirebaseUser(currentUser),
      displayName: name || currentUser.displayName || '',
    };

    userDataService.upsertUser({ ...currentUser, displayName: mappedUser.displayName }).catch((err) => console.error('Failed to upsert user:', err));

    return mappedUser;
  } catch (error) {
    return rejectWithValue(mapFirebaseError(error));
  }
});

export const loginUser = createAsyncThunk('auth/loginUser', async ({ email, password }, { rejectWithValue }) => {
  try {
    requireFirebase();
    checkThrottle('login');
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    userDataService.upsertUser(user).catch((err) => console.error('Failed to upsert user:', err));
    return mapFirebaseUser(user);
  } catch (error) {
    return rejectWithValue(mapFirebaseError(error));
  }
});

export const loginWithGoogle = createAsyncThunk('auth/loginWithGoogle', async (_, { rejectWithValue }) => {
  try {
    requireFirebase();
    checkThrottle('google');
    const { user } = await signInWithPopup(auth, googleProvider);
    userDataService.upsertUser(user).catch((err) => console.error('Failed to upsert user:', err));
    return mapFirebaseUser(user);
  } catch (error) {
    return rejectWithValue(mapFirebaseError(error));
  }
});

export const logoutUser = createAsyncThunk('auth/logoutUser', async (_, { rejectWithValue }) => {
  try {
    requireFirebase();
    await signOut(auth);
  } catch (error) {
    return rejectWithValue(mapFirebaseError(error));
  }
});

export const resetPassword = createAsyncThunk('auth/resetPassword', async (email, { rejectWithValue }) => {
  try {
    requireFirebase();
    checkThrottle('reset');
    await sendPasswordResetEmail(auth, email);
    return true;
  } catch (error) {
    return rejectWithValue(mapFirebaseError(error));
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    authReady: false,
  },
  reducers: {
    setUser(state, action) {
      state.user = mergeAuthUser(state.user, action.payload);
      state.isAuthenticated = Boolean(state.user);
      state.loading = false;
    },
    setAuthReady(state, action) {
      state.authReady = action.payload;
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher((action) => action.type.startsWith('auth/') && action.type.endsWith('/pending'), (state) => {
        state.loading = true;
        state.error = null;
      })
      .addMatcher((action) => action.type.startsWith('auth/') && action.type.endsWith('/fulfilled'), (state, action) => {
        state.loading = false;
        if (action.payload && action.type !== 'auth/resetPassword/fulfilled') {
          state.user = mergeAuthUser(state.user, action.payload);
          state.isAuthenticated = true;
        }
        if (action.type === 'auth/logoutUser/fulfilled') {
          state.user = null;
          state.isAuthenticated = false;
        }
      })
      .addMatcher((action) => action.type.startsWith('auth/') && action.type.endsWith('/rejected'), (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Ошибка авторизации';
      });
  },
});

export const { setUser, setAuthReady, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
